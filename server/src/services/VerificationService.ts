import { storage } from '../storage/InMemoryStorage.js';
import { VerificationOrchestrator } from './VerificationOrchestrator.js';
import { logger } from '../utils/logger.js';

export class VerificationService {
  private queue: string[] = [];
  private activeJobs = 0;
  private maxConcurrency = 2;
  private orchestrator: VerificationOrchestrator;

  constructor(orchestrator?: VerificationOrchestrator) {
    this.orchestrator = orchestrator || new VerificationOrchestrator();
  }

  enqueue(verificationId: string): void {
    logger.info({ verificationId }, 'Verification enqueued for background processing');
    this.queue.push(verificationId);
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.activeJobs >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const verificationId = this.queue.shift();
    if (!verificationId) return;

    this.activeJobs++;
    logger.debug({ verificationId, activeJobs: this.activeJobs }, 'Starting queued verification job');

    try {
      await this.orchestrator.runPipeline(verificationId);
    } catch (err) {
      logger.error({ err, verificationId }, 'Unhandled error in queue processing worker');
    } finally {
      this.activeJobs--;
      this.processNext();
    }
  }

  /**
   * Recovers any records left in PENDING or IN_PROGRESS
   */
  async recoverUnfinishedJobs(): Promise<void> {
    try {
      const allVerifications = storage.listVerifications({ limit: 1000 }).items;
      const unfinished = allVerifications.filter(
        (v) => v.status === 'PENDING' || v.status === 'IN_PROGRESS'
      );

      if (unfinished.length > 0) {
        logger.warn(
          { count: unfinished.length },
          'Recovering unfinished verification jobs'
        );
        for (const record of unfinished) {
          this.enqueue(record.id);
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error during recovery of unfinished verification jobs');
    }
  }
}

export const verificationService = new VerificationService();
