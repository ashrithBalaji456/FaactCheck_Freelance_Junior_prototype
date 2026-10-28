import { AiClient } from '../ai/GeminiClient.js';
import { IAgentArgument } from '../models/AgentArgument.js';
import { storage } from '../storage/InMemoryStorage.js';
import {
  SUPPORTER_SYSTEM_PROMPT,
  buildSupporterUserPrompt,
} from '../ai/prompts/supporterPrompt.js';
import {
  OPPONENT_SYSTEM_PROMPT,
  buildOpponentUserPrompt,
} from '../ai/prompts/opponentPrompt.js';
import {
  supporterOutputSchema,
  opponentOutputSchema,
  SupporterOutput,
  OpponentOutput,
} from '../schemas/agentOutputSchemas.js';
import { validateCitationIds } from '../utils/citationValidator.js';
import { logger } from '../utils/logger.js';

export interface DebateExecutionResult {
  arguments: IAgentArgument[];
  fullTranscript: string;
}

export class DebateService {
  constructor(private aiClient: AiClient) { }

  async runDebate(
    verificationId: string,
    claim: string,
    evidenceFormatted: string,
    availableEvidenceIds: string[],
    rounds: number,
    onStep?: (agent: 'SUPPORTER' | 'OPPONENT', round: number, status: 'STARTED' | 'COMPLETED', data?: any) => Promise<void>
  ): Promise<DebateExecutionResult> {
    logger.info({ verificationId, rounds }, 'Starting Multi-Round Competitive Debate');

    const debateArgs: IAgentArgument[] = [];
    let cumulativeTranscript = '';

    for (let round = 1; round <= rounds; round++) {
      // 1. Supporter Turn
      if (onStep) await onStep('SUPPORTER', round, 'STARTED');

      const supporterPrompt = buildSupporterUserPrompt(
        claim,
        evidenceFormatted,
        round,
        cumulativeTranscript
      );

      const supporterOutput: SupporterOutput = await this.aiClient.generateStructuredJson(
        supporterPrompt,
        SUPPORTER_SYSTEM_PROMPT,
        supporterOutputSchema
      );

      // Validate citation IDs deterministically
      const validSupporterCitations = validateCitationIds(
        supporterOutput.citedEvidenceIds,
        availableEvidenceIds
      );

      const supporterDoc = storage.createAgentArgument({
        verificationId,
        agentType: 'SUPPORTER',
        roundNumber: round,
        argument: supporterOutput.argument,
        reasoningSummary: supporterOutput.reasoningSummary,
        evidenceIds: validSupporterCitations.validIds,
      });

      debateArgs.push(supporterDoc);
      cumulativeTranscript += `[Round ${round} Supporter Argument]:\n${supporterOutput.argument}\n\n`;

      if (onStep) await onStep('SUPPORTER', round, 'COMPLETED', supporterDoc);

      // 2. Opponent Turn
      if (onStep) await onStep('OPPONENT', round, 'STARTED');

      const opponentPrompt = buildOpponentUserPrompt(
        claim,
        evidenceFormatted,
        round,
        supporterOutput.argument,
        cumulativeTranscript
      );

      const opponentOutput: OpponentOutput = await this.aiClient.generateStructuredJson(
        opponentPrompt,
        OPPONENT_SYSTEM_PROMPT,
        opponentOutputSchema
      );

      const validOpponentCitations = validateCitationIds(
        opponentOutput.citedEvidenceIds,
        availableEvidenceIds
      );

      const opponentDoc = storage.createAgentArgument({
        verificationId,
        agentType: 'OPPONENT',
        roundNumber: round,
        argument: opponentOutput.argument,
        reasoningSummary: opponentOutput.reasoningSummary,
        evidenceIds: validOpponentCitations.validIds,
      });

      debateArgs.push(opponentDoc);
      cumulativeTranscript += `[Round ${round} Opponent Argument]:\n${opponentOutput.argument}\n\n`;

      if (onStep) await onStep('OPPONENT', round, 'COMPLETED', opponentDoc);
    }

    logger.info(
      { verificationId, totalArguments: debateArgs.length },
      'Completed Multi-Round Debate'
    );

    return {
      arguments: debateArgs,
      fullTranscript: cumulativeTranscript,
    };
  }
}
