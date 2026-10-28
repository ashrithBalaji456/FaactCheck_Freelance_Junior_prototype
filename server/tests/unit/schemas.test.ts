import { describe, it, expect } from 'vitest';
import {
  createVerificationSchema,
  listVerificationQuerySchema,
  searchVerificationQuerySchema,
  verdictParamSchema,
} from '../../src/schemas/verificationSchemas.js';
import {
  claimAnalyzerOutputSchema,
  supporterOutputSchema,
  opponentOutputSchema,
  factCheckerOutputSchema,
  judgeOutputSchema,
} from '../../src/schemas/agentOutputSchemas.js';

describe('Zod Schemas Unit Tests', () => {
  describe('createVerificationSchema', () => {
    it('should validate a valid claim payload', () => {
      const valid = {
        claim: "India's Constitution came into effect on 26 January 1950.",
        sourceUrl: 'https://legislative.gov.in',
        debateRounds: 2,
      };
      const result = createVerificationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject short or blank claims', () => {
      expect(createVerificationSchema.safeParse({ claim: '' }).success).toBe(false);
      expect(createVerificationSchema.safeParse({ claim: 'a' }).success).toBe(false);
    });

    it('should reject debate rounds outside 1-5', () => {
      expect(createVerificationSchema.safeParse({ claim: 'Valid claim text', debateRounds: 0 }).success).toBe(false);
      expect(createVerificationSchema.safeParse({ claim: 'Valid claim text', debateRounds: 10 }).success).toBe(false);
    });

    it('should reject SSRF / private URLs in sourceUrl', () => {
      const invalid = {
        claim: 'Valid claim text here',
        sourceUrl: 'http://localhost:5000/secret',
      };
      const result = createVerificationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Agent Output Schemas', () => {
    it('should validate Judge output with all 4 verdicts', () => {
      const verdicts = ['TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNCERTAIN'] as const;
      for (const verdict of verdicts) {
        const payload = {
          verdict,
          confidenceScore: 0.95,
          summary: 'A comprehensive summary of findings.',
          explanation: 'Detailed judicial explanation describing the complete factual inquiry.',
          supportingEvidenceIds: [],
          contradictingEvidenceIds: [],
          caveats: [],
          missingInformation: [],
        };
        const res = judgeOutputSchema.safeParse(payload);
        expect(res.success).toBe(true);
      }
    });

    it('should reject invalid verdict string', () => {
      const invalid = {
        verdict: 'PROBABLY_TRUE',
        confidenceScore: 0.5,
        summary: 'Summary text',
        explanation: 'Detailed judicial explanation text',
        supportingEvidenceIds: [],
        contradictingEvidenceIds: [],
        caveats: [],
        missingInformation: [],
      };
      const res = judgeOutputSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });
});

