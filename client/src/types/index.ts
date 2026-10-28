export type VerificationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type VerificationVerdict = 'TRUE' | 'FALSE' | 'PARTIALLY_TRUE' | 'UNCERTAIN';
export type EvidenceStance = 'SUPPORTS' | 'CONTRADICTS' | 'CONTEXT' | 'UNKNOWN';
export type AgentRoleType = 'CLAIM_ANALYZER' | 'SUPPORTER' | 'OPPONENT' | 'FACT_CHECKER' | 'JUDGE';

export interface EvidenceItem {
  id: string;
  _id?: string;
  verificationId: string;
  title: string;
  url: string;
  sourceDomain: string;
  snippet: string;
  publishedAt?: string | null;
  retrievedAt: string;
  stance: EvidenceStance;
  relevanceScore?: number | null;
  sourceType: 'PRIMARY' | 'SECONDARY' | 'UNKNOWN';
  contentAccessLevel: 'SEARCH_SNIPPET' | 'FETCHED_PAGE';
}

export interface AgentArgumentItem {
  id: string;
  _id?: string;
  verificationId: string;
  agentType: AgentRoleType;
  roundNumber: number;
  argument: string;
  reasoningSummary: string;
  evidenceIds: string[] | EvidenceItem[];
  createdAt: string;
}

export interface FactCheckerReport {
  supportedClaims: string[];
  unsupportedOrOverstatedClaims: string[];
  sourceConflicts: string[];
  summary: string;
  citationIntegrity?: {
    totalCitationsCited: number;
    validCitationsCount: number;
    invalidCitationsCount: number;
    citationValidityRatio: number;
    unresolvedIds: string[];
  };
}

export interface JudgeReport {
  verdict: VerificationVerdict;
  confidenceScore: number | null;
  summary: string;
  explanation: string;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  caveats: string[];
  missingInformation: string[];
}

export interface VerificationDetail {
  id: string;
  _id?: string;
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
  evidence: EvidenceItem[];
  arguments: AgentArgumentItem[];
  factCheckerReport?: FactCheckerReport | null;
  judgeReport?: JudgeReport | null;
  processingDurationMs?: number | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface VerificationSummary {
  id: string;
  _id?: string;
  claim: string;
  normalizedClaim?: string;
  status: VerificationStatus;
  verdict?: VerificationVerdict | null;
  confidenceScore?: number | null;
  summary?: string | null;
  processingDurationMs?: number | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface VerificationStreamEvent {
  verificationId: string;
  eventType: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

