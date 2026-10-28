import { ZodSchema } from 'zod';
import { AiClient } from './GeminiClient.js';
import {
  ClaimAnalyzerOutput,
  SupporterOutput,
  OpponentOutput,
  FactCheckerOutput,
  JudgeOutput,
} from '../schemas/agentOutputSchemas.js';

export class MockAiClient implements AiClient {
  private customHandlers: Map<string, any> = new Map();

  setHandler(type: string, data: any) {
    this.customHandlers.set(type, data);
  }

  async generateStructuredJson<T>(
    userPrompt: string,
    systemInstruction: string,
    schema: ZodSchema<T>
  ): Promise<T> {
    if (systemInstruction.includes('Agent 1') || systemInstruction.includes('Agent 1: Claim Analyzer')) {
      const claimMatch = userPrompt.match(/Claim to analyze: "([^"]+)"/);
      const claim = claimMatch ? claimMatch[1] : 'Sample Claim';

      const output: ClaimAnalyzerOutput = this.customHandlers.get('claim_analyzer') || {
        normalizedClaim: claim.trim(),
        factualAssertions: ['The Constitution of India came into effect on 26 January 1950.'],
        entities: ['India', 'Constitution', 'Republic Day'],
        temporalContext: '26 January 1950',
        subclaims: ['India adopted a constitution', 'The effective commencement date was 26 January 1950'],
        searchQueries: [
          'Constitution of India commencement date 26 January 1950',
          'Republic Day India 1950 constitution legislative archives',
        ],
        ambiguities: [],
      };
      return schema.parse(output) as T;
    }

    if (systemInstruction.includes('Agent 3') || systemInstruction.includes('Agent 3: Supporter')) {
      const matches = Array.from(userPrompt.matchAll(/\[Evidence ID: ([a-f0-9]{24})\]/g)).map((m) => m[1]);
      const citedIds = matches.slice(0, 2);

      const output: SupporterOutput = this.customHandlers.get('supporter') || {
        argument: `Historical and legislative records clearly corroborate this claim. According to official legislative archives, the Constitution of India was promulgated and brought into full effect on 26 January 1950.`,
        reasoningSummary: 'Corroborated by official legislative archives and constitutional records.',
        citedEvidenceIds: citedIds,
        directEvidenceIds: citedIds,
        indirectEvidenceIds: [],
        identifiedWeaknesses: ['Drafting began earlier in 1946; adoption was 26 Nov 1949 while commencement was 26 Jan 1950.'],
      };
      return schema.parse(output) as T;
    }

    if (systemInstruction.includes('Agent 4') || systemInstruction.includes('Agent 4: Opponent')) {
      const matches = Array.from(userPrompt.matchAll(/\[Evidence ID: ([a-f0-9]{24})\]/g)).map((m) => m[1]);
      const citedIds = matches.slice(0, 1);

      const output: OpponentOutput = this.customHandlers.get('opponent') || {
        argument: `While 26 January 1950 was the commencement date, the Constitution was actually drafted, finalized, and adopted earlier on 26 November 1949. Some citizens confuse the adoption date with the enforcement date.`,
        reasoningSummary: 'Critical distinction between adoption date (26 Nov 1949) and commencement date (26 Jan 1950).',
        citedEvidenceIds: citedIds,
        contradictionsIdentified: [],
        misleadingContextIdentified: ['Potential confusion between Adoption date and Republic Day Commencement date.'],
        unsupportedAssumptions: [],
      };
      return schema.parse(output) as T;
    }

    if (systemInstruction.includes('Agent 5') || systemInstruction.includes('Agent 5: Fact-Checker')) {
      const output: FactCheckerOutput = this.customHandlers.get('fact_checker') || {
        supportedClaims: ['The Indian Constitution came into full effect on 26 January 1950.'],
        unsupportedOrOverstatedClaims: [],
        sourceConflicts: [],
        summary: 'Both agents cited authentic government and historical records. The timeline distinction between 1949 adoption and 1950 commencement is accurate.',
        sourceTypeAssessments: {},
      };
      return schema.parse(output) as T;
    }

    if (systemInstruction.includes('Agent 6') || systemInstruction.includes('Agent 6: Chief Judge')) {
      const matches = Array.from(userPrompt.matchAll(/\[Evidence ID: ([a-f0-9]{24})\]/g)).map((m) => m[1]);

      const output: JudgeOutput = this.customHandlers.get('judge') || {
        verdict: 'TRUE',
        confidenceScore: 0.98,
        summary: 'The claim is historically and legally accurate. The Constitution of India came into effect on 26 January 1950.',
        explanation: 'Official government publications, national archives, and constitutional documents affirm that while the Constituent Assembly adopted the Constitution on 26 November 1949, it formally came into effect on 26 January 1950, celebrated nationwide as Republic Day.',
        supportingEvidenceIds: matches,
        contradictingEvidenceIds: [],
        caveats: ['Certain provisions regarding citizenship took effect earlier upon adoption in 1949, but general commencement was 26 January 1950.'],
        missingInformation: [],
      };
      return schema.parse(output) as T;
    }

    throw new Error(`Unrecognized agent prompt in MockAiClient: ${systemInstruction.substring(0, 50)}`);
  }
}
