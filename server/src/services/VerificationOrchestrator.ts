import { storage } from '../storage/InMemoryStorage.js';
import { eventBus } from '../events/VerificationEventBus.js';
import { AiClient, GeminiClient } from '../ai/GeminiClient.js';
import { WebSearchClient } from '../search/WebSearchClient.js';
import { TavilySearchClient } from '../search/TavilySearchClient.js';
import { ClaimAnalyzer } from './ClaimAnalyzer.js';
import { EvidenceRetriever } from './EvidenceRetriever.js';
import { DebateService } from './DebateService.js';
import { FactChecker } from './FactChecker.js';
import { JudgeService } from './JudgeService.js';
import { logger } from '../utils/logger.js';

export class VerificationOrchestrator {
  private claimAnalyzer: ClaimAnalyzer;
  private evidenceRetriever: EvidenceRetriever;
  private debateService: DebateService;
  private factChecker: FactChecker;
  private judgeService: JudgeService;

  constructor(aiClient?: AiClient, searchClient?: WebSearchClient) {
    const ai = aiClient || new GeminiClient();
    const search = searchClient || new TavilySearchClient();

    this.claimAnalyzer = new ClaimAnalyzer(ai);
    this.evidenceRetriever = new EvidenceRetriever(search);
    this.debateService = new DebateService(ai);
    this.factChecker = new FactChecker(ai);
    this.judgeService = new JudgeService(ai);
  }

  private recordAndEmitEvent(
    verificationId: string,
    eventType: string,
    message: string,
    metadata: Record<string, unknown> = {}
  ): void {
    const now = new Date();
    storage.createVerificationEvent({
      verificationId,
      eventType,
      message,
      metadata,
    });

    eventBus.emitProgress({
      verificationId,
      eventType,
      message,
      timestamp: now.toISOString(),
      metadata,
    });
  }

  async runPipeline(verificationId: string): Promise<void> {
    const verification = storage.getVerification(verificationId);
    if (!verification) {
      logger.error({ verificationId }, 'Verification record not found for orchestration');
      return;
    }

    const startTime = Date.now();
    storage.updateVerification(verificationId, { status: 'IN_PROGRESS' });

    this.recordAndEmitEvent(
      verificationId,
      'verification.started',
      'Verification pipeline initialized and claim accepted.'
    );

    try {
      // Step 1: Claim Analysis
      this.recordAndEmitEvent(
        verificationId,
        'claim_analysis.started',
        'Agent 1 (Claim Analyzer) decomposing claim into subclaims and search queries.'
      );

      const claimAnalysis = await this.claimAnalyzer.analyze(
        verification.claim,
        verification.sourceUrl
      );

      storage.updateVerification(verificationId, {
        normalizedClaim: claimAnalysis.normalizedClaim,
      });

      this.recordAndEmitEvent(
        verificationId,
        'claim_analysis.completed',
        `Claim normalized and ${claimAnalysis.searchQueries.length} targeted search queries generated.`,
        { analysis: claimAnalysis }
      );

      // Step 2: Evidence Search
      this.recordAndEmitEvent(
        verificationId,
        'evidence_search.started',
        'Agent 2 (Evidence Retriever) querying Tavily for authoritative primary and secondary web sources.'
      );

      const evidenceSet = await this.evidenceRetriever.retrieveAndPersist(
        verificationId,
        claimAnalysis.searchQueries
      );

      this.recordAndEmitEvent(
        verificationId,
        'evidence_search.completed',
        `Discovered and verified ${evidenceSet.items.length} unique sources.`,
        { sourceCount: evidenceSet.items.length }
      );

      // Step 3: Multi-Round Debate
      const availableEvidenceIds = evidenceSet.items.map((e) => e.id);
      const rounds = verification.debateRounds || 2;

      const debateResult = await this.debateService.runDebate(
        verificationId,
        verification.claim,
        evidenceSet.formattedText,
        availableEvidenceIds,
        rounds,
        async (agent, round, status, data) => {
          if (status === 'STARTED') {
            this.recordAndEmitEvent(
              verificationId,
              'agent.started',
              `${agent === 'SUPPORTER' ? 'Supporter Agent' : 'Opponent Agent'} active for Round ${round}.`,
              { agent, round }
            );
          } else {
            this.recordAndEmitEvent(
              verificationId,
              'agent.completed',
              `${agent === 'SUPPORTER' ? 'Supporter Agent' : 'Opponent Agent'} submitted Round ${round} argument.`,
              { agent, round, argumentId: data?.id }
            );

            if (agent === 'OPPONENT') {
              this.recordAndEmitEvent(
                verificationId,
                'debate.round.completed',
                `Debate Round ${round} completed.`,
                { round }
              );
            }
          }
        }
      );

      // Step 4: Fact-Checker Audit
      this.recordAndEmitEvent(
        verificationId,
        'fact_check.started',
        'Agent 5 (Fact-Checker) auditing citation integrity, source conflicts, and potential overstatements.'
      );

      const factCheckReport = await this.factChecker.audit(
        verificationId,
        verification.claim,
        evidenceSet.items,
        evidenceSet.formattedText,
        debateResult.fullTranscript,
        debateResult.arguments
      );

      storage.updateVerification(verificationId, {
        factCheckerReport: factCheckReport as unknown as Record<string, unknown>,
      });

      this.recordAndEmitEvent(
        verificationId,
        'fact_check.completed',
        `Fact-checker audit completed. Citation validity: ${Math.round(
          factCheckReport.citationIntegrity.citationValidityRatio * 100
        )}%.`,
        { auditSummary: factCheckReport.summary }
      );

      // Step 5: Judge Evaluation
      this.recordAndEmitEvent(
        verificationId,
        'judge.started',
        'Agent 6 (Chief Judge) deliberating on evidence, debate arguments, and fact-check findings.'
      );

      const judgeReport = await this.judgeService.evaluateAndRenderVerdict(
        verificationId,
        verification.claim,
        evidenceSet.items,
        evidenceSet.formattedText,
        debateResult.fullTranscript,
        factCheckReport
      );

      const durationMs = Date.now() - startTime;
      storage.updateVerification(verificationId, {
        status: 'COMPLETED',
        verdict: judgeReport.verdict,
        confidenceScore: judgeReport.confidenceScore,
        summary: judgeReport.summary,
        explanation: judgeReport.explanation,
        judgeReport: judgeReport as unknown as Record<string, unknown>,
        completedAt: new Date(),
        processingDurationMs: durationMs,
      });

      this.recordAndEmitEvent(
        verificationId,
        'judge.completed',
        `Judge concluded deliberation: ${judgeReport.verdict}.`,
        { verdict: judgeReport.verdict, confidence: judgeReport.confidenceScore }
      );

      this.recordAndEmitEvent(
        verificationId,
        'verification.completed',
        `Verification completed successfully with verdict ${judgeReport.verdict} in ${(
          durationMs / 1000
        ).toFixed(1)}s.`,
        {
          verdict: judgeReport.verdict,
          confidenceScore: judgeReport.confidenceScore,
          processingDurationMs: durationMs,
        }
      );

      logger.info(
        { verificationId, verdict: judgeReport.verdict, durationMs },
        'Verification pipeline finished successfully'
      );
    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      logger.error({ error, verificationId }, 'Verification pipeline execution error');

      const failureCode = error.code || 'ORCHESTRATION_FAILURE';
      const failureMessage = error.message || 'An unexpected error occurred during verification.';

      storage.updateVerification(verificationId, {
        status: 'FAILED',
        failureCode,
        failureMessage,
        completedAt: new Date(),
        processingDurationMs: durationMs,
      });

      this.recordAndEmitEvent(
        verificationId,
        'verification.failed',
        `Verification failed: ${failureMessage}`,
        { error: failureMessage, code: failureCode }
      );
    }
  }
}
