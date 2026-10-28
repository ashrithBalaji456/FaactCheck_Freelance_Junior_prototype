import { z } from 'zod';

export interface ClaimAnalyzerOutput {
  normalizedClaim: string;
  factualAssertions: string[];
  entities: string[];
  temporalContext: string | null;
  subclaims: string[];
  searchQueries: string[];
  ambiguities: string[];
}

export const claimAnalyzerOutputSchema: z.ZodType<ClaimAnalyzerOutput> = z.object({
  normalizedClaim: z.string().min(1),
  factualAssertions: z.array(z.string()),
  entities: z.array(z.string()),
  temporalContext: z.string().nullable(),
  subclaims: z.array(z.string()),
  searchQueries: z.array(z.string()).min(1).max(6),
  ambiguities: z.array(z.string()),
});

export interface SupporterOutput {
  argument: string;
  reasoningSummary: string;
  citedEvidenceIds: string[];
  directEvidenceIds: string[];
  indirectEvidenceIds: string[];
  identifiedWeaknesses: string[];
}

export const supporterOutputSchema: z.ZodType<SupporterOutput> = z.object({
  argument: z.string().min(10),
  reasoningSummary: z.string().min(5),
  citedEvidenceIds: z.array(z.string()),
  directEvidenceIds: z.array(z.string()),
  indirectEvidenceIds: z.array(z.string()),
  identifiedWeaknesses: z.array(z.string()),
});

export interface OpponentOutput {
  argument: string;
  reasoningSummary: string;
  citedEvidenceIds: string[];
  contradictionsIdentified: string[];
  misleadingContextIdentified: string[];
  unsupportedAssumptions: string[];
}

export const opponentOutputSchema: z.ZodType<OpponentOutput> = z.object({
  argument: z.string().min(10),
  reasoningSummary: z.string().min(5),
  citedEvidenceIds: z.array(z.string()),
  contradictionsIdentified: z.array(z.string()),
  misleadingContextIdentified: z.array(z.string()),
  unsupportedAssumptions: z.array(z.string()),
});

export interface FactCheckerOutput {
  supportedClaims: string[];
  unsupportedOrOverstatedClaims: string[];
  sourceConflicts: string[];
  summary: string;
  sourceTypeAssessments: Record<string, 'PRIMARY' | 'SECONDARY' | 'UNKNOWN'>;
}

export const factCheckerOutputSchema: z.ZodType<FactCheckerOutput> = z.object({
  supportedClaims: z.array(z.string()),
  unsupportedOrOverstatedClaims: z.array(z.string()),
  sourceConflicts: z.array(z.string()),
  summary: z.string().min(5),
  sourceTypeAssessments: z.record(z.enum(['PRIMARY', 'SECONDARY', 'UNKNOWN'])),
});

export interface JudgeOutput {
  verdict: 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNCERTAIN';
  confidenceScore: number | null;
  summary: string;
  explanation: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  caveats: string[];
  missingInformation: string[];
}

export const judgeOutputSchema: z.ZodType<JudgeOutput> = z.object({
  verdict: z.enum(['TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNCERTAIN']),
  confidenceScore: z.number().min(0).max(1).nullable(),
  summary: z.string().min(10),
  explanation: z.string().min(20),
  supportingEvidenceIds: z.array(z.string()),
  contradictingEvidenceIds: z.array(z.string()),
  caveats: z.array(z.string()),
  missingInformation: z.array(z.string()),
});
