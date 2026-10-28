export type VerificationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type VerificationVerdict = 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNCERTAIN';

export interface IVerification {
  id: string;
  _id: string;
  claim: string;
  normalizedClaim?: string;
  sourceUrl?: string | null;
  status: VerificationStatus;
  verdict?: VerificationVerdict | null;
  confidenceScore?: number | null;
  summary?: string | null;
  explanation?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  debateRounds: number;
  factCheckerReport?: Record<string, unknown> | null;
  judgeReport?: Record<string, unknown> | null;
  processingDurationMs?: number | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

export type IVerificationSummary = Pick<
  IVerification,
  'id' | '_id' | 'claim' | 'normalizedClaim' | 'status' | 'verdict' | 'confidenceScore' | 'summary' | 'processingDurationMs' | 'createdAt' | 'completedAt'
>;
