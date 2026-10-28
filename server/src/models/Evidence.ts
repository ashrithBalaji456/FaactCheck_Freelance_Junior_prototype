export type EvidenceStance = 'SUPPORTS' | 'CONTRADICTS' | 'CONTEXT' | 'UNKNOWN';
export type SourceType = 'PRIMARY' | 'SECONDARY' | 'UNKNOWN';
export type ContentAccessLevel = 'SEARCH_SNIPPET' | 'FETCHED_PAGE';

export interface IEvidence {
  id: string;
  _id: string;
  verificationId: string;
  title: string;
  url: string;
  sourceDomain: string;
  snippet: string;
  publishedAt?: Date | null;
  retrievedAt: Date;
  stance: EvidenceStance;
  relevanceScore?: number | null;
  sourceType: SourceType;
  contentAccessLevel: ContentAccessLevel;
  contentHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
