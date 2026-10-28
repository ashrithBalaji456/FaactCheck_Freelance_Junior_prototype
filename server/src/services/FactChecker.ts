import { AiClient } from '../ai/GeminiClient.js';
import { IAgentArgument } from '../models/AgentArgument.js';
import { IEvidence } from '../models/Evidence.js';
import { storage } from '../storage/InMemoryStorage.js';
import {
  FACT_CHECKER_SYSTEM_PROMPT,
  buildFactCheckerUserPrompt,
} from '../ai/prompts/factCheckerPrompt.js';
import {
  factCheckerOutputSchema,
  FactCheckerOutput,
} from '../schemas/agentOutputSchemas.js';
import { logger } from '../utils/logger.js';

export interface FactCheckerAuditReport extends FactCheckerOutput {
  citationIntegrity: {
    totalCitationsCited: number;
    validCitationsCount: number;
    invalidCitationsCount: number;
    citationValidityRatio: number;
    unresolvedIds: string[];
  };
}

export class FactChecker {
  constructor(private aiClient: AiClient) { }

  async audit(
    verificationId: string,
    claim: string,
    evidenceItems: IEvidence[],
    evidenceFormatted: string,
    debateTranscript: string,
    debateArguments: IAgentArgument[]
  ): Promise<FactCheckerAuditReport> {
    logger.info({ verificationId }, 'Starting Agent 5: Fact-Checker Audit');

    // 1. Deterministic citation integrity verification
    const availableIdSet = new Set(evidenceItems.map((e) => e.id));
    let totalCitations = 0;
    let validCitations = 0;
    const unresolvedIds: string[] = [];

    for (const arg of debateArguments) {
      for (const id of arg.evidenceIds) {
        totalCitations++;
        if (availableIdSet.has(id)) {
          validCitations++;
        } else {
          unresolvedIds.push(id);
        }
      }
    }

    const validityRatio = totalCitations > 0 ? validCitations / totalCitations : 1.0;

    // 2. Analytical audit of arguments against evidence
    const prompt = buildFactCheckerUserPrompt(claim, evidenceFormatted, debateTranscript);
    const aiAudit = await this.aiClient.generateStructuredJson(
      prompt,
      FACT_CHECKER_SYSTEM_PROMPT,
      factCheckerOutputSchema
    );

    // Update source types in in-memory storage if identified by FactChecker
    if (aiAudit.sourceTypeAssessments) {
      for (const [idStr, sourceType] of Object.entries(aiAudit.sourceTypeAssessments)) {
        if (availableIdSet.has(idStr)) {
          storage.updateEvidence(idStr, { sourceType });
        }
      }
    }

    const fullReport: FactCheckerAuditReport = {
      ...aiAudit,
      citationIntegrity: {
        totalCitationsCited: totalCitations,
        validCitationsCount: validCitations,
        invalidCitationsCount: unresolvedIds.length,
        citationValidityRatio: validityRatio,
        unresolvedIds,
      },
    };

    logger.info(
      {
        verificationId,
        validityRatio,
        conflictCount: fullReport.sourceConflicts.length,
      },
      'Agent 5 completed Fact-Checker audit'
    );

    return fullReport;
  }
}
