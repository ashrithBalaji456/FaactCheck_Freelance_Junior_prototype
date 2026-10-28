import { AiClient } from '../ai/GeminiClient.js';
import { IEvidence } from '../models/Evidence.js';
import { storage } from '../storage/InMemoryStorage.js';
import {
  JUDGE_SYSTEM_PROMPT,
  buildJudgeUserPrompt,
} from '../ai/prompts/judgePrompt.js';
import {
  judgeOutputSchema,
  JudgeOutput,
} from '../schemas/agentOutputSchemas.js';
import { FactCheckerAuditReport } from './FactChecker.js';
import { logger } from '../utils/logger.js';

export class JudgeService {
  constructor(private aiClient: AiClient) {}

  async evaluateAndRenderVerdict(
    verificationId: string,
    claim: string,
    evidenceItems: IEvidence[],
    evidenceFormatted: string,
    debateTranscript: string,
    factCheckerReport: FactCheckerAuditReport
  ): Promise<JudgeOutput> {
    logger.info({ verificationId }, 'Starting Agent 6: Chief Judge Assessment');

    const prompt = buildJudgeUserPrompt(
      claim,
      evidenceFormatted,
      debateTranscript,
      JSON.stringify(factCheckerReport, null, 2)
    );

    const verdictOutput = await this.aiClient.generateStructuredJson(
      prompt,
      JUDGE_SYSTEM_PROMPT,
      judgeOutputSchema
    );

    // Update Stance on all Evidence documents in In-Memory Storage
    const supportingSet = new Set(verdictOutput.supportingEvidenceIds);
    const contradictingSet = new Set(verdictOutput.contradictingEvidenceIds);

    for (const ev of evidenceItems) {
      let stance: 'SUPPORTS' | 'CONTRADICTS' | 'CONTEXT' = 'CONTEXT';
      if (supportingSet.has(ev.id)) {
        stance = 'SUPPORTS';
      } else if (contradictingSet.has(ev.id)) {
        stance = 'CONTRADICTS';
      }

      storage.updateEvidence(ev.id, { stance });
    }

    logger.info(
      {
        verificationId,
        verdict: verdictOutput.verdict,
        confidence: verdictOutput.confidenceScore,
      },
      'Agent 6 rendered final verdict'
    );

    return verdictOutput;
  }
}
