import crypto from 'crypto';
import { IVerification, IVerificationSummary, VerificationStatus, VerificationVerdict } from '../models/Verification.js';
import { IEvidence, EvidenceStance } from '../models/Evidence.js';
import { IAgentArgument, AgentRoleType } from '../models/AgentArgument.js';
import { IVerificationEvent } from '../models/VerificationEvent.js';

export class InMemoryStorage {
  private verifications: Map<string, IVerification> = new Map();
  private evidence: Map<string, IEvidence> = new Map();
  private agentArguments: Map<string, IAgentArgument> = new Map();
  private verificationEvents: Map<string, IVerificationEvent> = new Map();

  /**
   * Generates a 24-character hex string ID compatible with MongoDB ObjectId format
   */
  generateId(): string {
    return crypto.randomBytes(12).toString('hex');
  }

  /**
   * Validates if a string is a valid ID (24 hex characters or UUID format)
   */
  isValidId(id: string): boolean {
    if (!id || typeof id !== 'string') return false;
    return /^[a-f0-9]{24}$/i.test(id) || /^[0-9a-fA-F-]{36}$/.test(id);
  }

  private clone<T>(data: T): T {
    return structuredClone(data);
  }

  // ==========================================
  // Verification Methods
  // ==========================================

  createVerification(data: {
    claim: string;
    sourceUrl?: string | null;
    debateRounds?: number;
    status?: VerificationStatus;
  }): IVerification {
    const id = this.generateId();
    const now = new Date();

    const record: IVerification = {
      id,
      _id: id,
      claim: data.claim.trim(),
      normalizedClaim: undefined,
      sourceUrl: data.sourceUrl || null,
      status: data.status || 'PENDING',
      verdict: null,
      confidenceScore: null,
      summary: null,
      explanation: null,
      failureCode: null,
      failureMessage: null,
      debateRounds: data.debateRounds ?? 2,
      factCheckerReport: null,
      judgeReport: null,
      processingDurationMs: null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };

    this.verifications.set(id, record);
    return this.clone(record);
  }

  getVerification(id: string): IVerification | null {
    const record = this.verifications.get(id);
    return record ? this.clone(record) : null;
  }

  updateVerification(id: string, updates: Partial<IVerification>): IVerification | null {
    const existing = this.verifications.get(id);
    if (!existing) return null;

    const updated: IVerification = {
      ...existing,
      ...updates,
      id: existing.id,
      _id: existing._id,
      updatedAt: new Date(),
    };

    this.verifications.set(id, updated);
    return this.clone(updated);
  }

  listVerifications(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): { items: IVerificationSummary[]; total: number } {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.min(50, Math.max(1, params?.limit || 10));
    const sortField = (params?.sort || 'createdAt') as keyof IVerification;
    const order = params?.order === 'asc' ? 1 : -1;

    const all = Array.from(this.verifications.values());

    all.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA instanceof Date && valB instanceof Date) {
        return (valA.getTime() - valB.getTime()) * order;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * order;
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * order;
      }
      return 0;
    });

    const total = all.length;
    const startIndex = (page - 1) * limit;
    const paged = all.slice(startIndex, startIndex + limit);

    const summaries: IVerificationSummary[] = paged.map((v) => ({
      id: v.id,
      _id: v._id,
      claim: v.claim,
      normalizedClaim: v.normalizedClaim,
      status: v.status,
      verdict: v.verdict,
      confidenceScore: v.confidenceScore,
      summary: v.summary,
      processingDurationMs: v.processingDurationMs,
      createdAt: v.createdAt,
      completedAt: v.completedAt,
    }));

    return { items: this.clone(summaries), total };
  }

  searchVerifications(params: {
    query: string;
    page?: number;
    limit?: number;
  }): { items: IVerificationSummary[]; total: number } {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 10));
    const q = params.query.toLowerCase().trim();

    const matched = Array.from(this.verifications.values()).filter((v) => {
      const inClaim = v.claim.toLowerCase().includes(q);
      const inSummary = v.summary ? v.summary.toLowerCase().includes(q) : false;
      const inNormalized = v.normalizedClaim ? v.normalizedClaim.toLowerCase().includes(q) : false;
      return inClaim || inSummary || inNormalized;
    });

    // Sort descending by createdAt
    matched.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = matched.length;
    const startIndex = (page - 1) * limit;
    const paged = matched.slice(startIndex, startIndex + limit);

    const summaries: IVerificationSummary[] = paged.map((v) => ({
      id: v.id,
      _id: v._id,
      claim: v.claim,
      normalizedClaim: v.normalizedClaim,
      status: v.status,
      verdict: v.verdict,
      confidenceScore: v.confidenceScore,
      summary: v.summary,
      processingDurationMs: v.processingDurationMs,
      createdAt: v.createdAt,
      completedAt: v.completedAt,
    }));

    return { items: this.clone(summaries), total };
  }

  filterVerificationsByVerdict(params: {
    verdict: string;
    page?: number;
    limit?: number;
  }): { items: IVerificationSummary[]; total: number } {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 10));

    const matched = Array.from(this.verifications.values()).filter(
      (v) => v.verdict === params.verdict
    );

    matched.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = matched.length;
    const startIndex = (page - 1) * limit;
    const paged = matched.slice(startIndex, startIndex + limit);

    const summaries: IVerificationSummary[] = paged.map((v) => ({
      id: v.id,
      _id: v._id,
      claim: v.claim,
      normalizedClaim: v.normalizedClaim,
      status: v.status,
      verdict: v.verdict,
      confidenceScore: v.confidenceScore,
      summary: v.summary,
      processingDurationMs: v.processingDurationMs,
      createdAt: v.createdAt,
      completedAt: v.completedAt,
    }));

    return { items: this.clone(summaries), total };
  }

  deleteVerification(id: string): boolean {
    if (!this.verifications.has(id)) {
      return false;
    }

    // 1. Delete verification
    this.verifications.delete(id);

    // 2. Cascade delete related evidence
    for (const [evId, ev] of this.evidence.entries()) {
      if (ev.verificationId === id) {
        this.evidence.delete(evId);
      }
    }

    // 3. Cascade delete related debate arguments
    for (const [argId, arg] of this.agentArguments.entries()) {
      if (arg.verificationId === id) {
        this.agentArguments.delete(argId);
      }
    }

    // 4. Cascade delete related events
    for (const [eventId, event] of this.verificationEvents.entries()) {
      if (event.verificationId === id) {
        this.verificationEvents.delete(eventId);
      }
    }

    return true;
  }

  // ==========================================
  // Evidence Methods
  // ==========================================

  createEvidence(data: Omit<IEvidence, 'id' | '_id' | 'createdAt' | 'updatedAt'>): IEvidence {
    const id = this.generateId();
    const now = new Date();

    const record: IEvidence = {
      ...data,
      id,
      _id: id,
      createdAt: now,
      updatedAt: now,
    };

    this.evidence.set(id, record);
    return this.clone(record);
  }

  createManyEvidence(items: Array<Omit<IEvidence, 'id' | '_id' | 'createdAt' | 'updatedAt'>>): IEvidence[] {
    return items.map((item) => this.createEvidence(item));
  }

  getEvidenceByVerificationId(verificationId: string): IEvidence[] {
    const results = Array.from(this.evidence.values())
      .filter((e) => e.verificationId === verificationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return this.clone(results);
  }

  updateEvidence(id: string, updates: Partial<IEvidence>): IEvidence | null {
    const existing = this.evidence.get(id);
    if (!existing) return null;

    const updated: IEvidence = {
      ...existing,
      ...updates,
      id: existing.id,
      _id: existing._id,
      updatedAt: new Date(),
    };

    this.evidence.set(id, updated);
    return this.clone(updated);
  }

  // ==========================================
  // Debate Argument Methods
  // ==========================================

  createAgentArgument(data: Omit<IAgentArgument, 'id' | '_id' | 'createdAt' | 'updatedAt'>): IAgentArgument {
    const id = this.generateId();
    const now = new Date();

    const record: IAgentArgument = {
      ...data,
      id,
      _id: id,
      createdAt: now,
      updatedAt: now,
    };

    this.agentArguments.set(id, record);
    return this.clone(record);
  }

  getArgumentsByVerificationId(verificationId: string): IAgentArgument[] {
    const results = Array.from(this.agentArguments.values())
      .filter((a) => a.verificationId === verificationId)
      .sort((a, b) => {
        if (a.roundNumber !== b.roundNumber) {
          return a.roundNumber - b.roundNumber;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    return this.clone(results);
  }

  // ==========================================
  // Verification Event Methods
  // ==========================================

  createVerificationEvent(data: Omit<IVerificationEvent, 'id' | '_id' | 'createdAt'>): IVerificationEvent {
    const id = this.generateId();
    const now = new Date();

    const record: IVerificationEvent = {
      ...data,
      id,
      _id: id,
      createdAt: now,
    };

    this.verificationEvents.set(id, record);
    return this.clone(record);
  }

  getEventsByVerificationId(verificationId: string): IVerificationEvent[] {
    const results = Array.from(this.verificationEvents.values())
      .filter((e) => e.verificationId === verificationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return this.clone(results);
  }

  // ==========================================
  // Utility & Stats
  // ==========================================

  clear(): void {
    this.verifications.clear();
    this.evidence.clear();
    this.agentArguments.clear();
    this.verificationEvents.clear();
  }

  getStats(): {
    verifications: number;
    evidence: number;
    arguments: number;
    events: number;
  } {
    return {
      verifications: this.verifications.size,
      evidence: this.evidence.size,
      arguments: this.agentArguments.size,
      events: this.verificationEvents.size,
    };
  }
}

// Global singleton instance for in-memory storage
export const storage = new InMemoryStorage();

