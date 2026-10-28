import { AiClient } from '../ai/GeminiClient.js';
import {
  CLAIM_ANALYZER_SYSTEM_PROMPT,
  buildClaimAnalyzerUserPrompt,
} from '../ai/prompts/claimAnalyzerPrompt.js';
import {
  claimAnalyzerOutputSchema,
  ClaimAnalyzerOutput,
} from '../schemas/agentOutputSchemas.js';
import { logger } from '../utils/logger.js';

export class ClaimAnalyzer {
  constructor(private aiClient: AiClient) {}

  async analyze(claim: string, sourceUrl?: string | null): Promise<ClaimAnalyzerOutput> {
    logger.info({ claim, sourceUrl }, 'Starting Agent 1: Claim Analyzer');

    const prompt = buildClaimAnalyzerUserPrompt(claim, sourceUrl);
    const output = await this.aiClient.generateStructuredJson(
      prompt,
      CLAIM_ANALYZER_SYSTEM_PROMPT,
      claimAnalyzerOutputSchema
    );

    logger.info(
      { subclaimCount: output.subclaims.length, queries: output.searchQueries },
      'Agent 1 completed claim analysis'
    );
    return output;
  }
}

