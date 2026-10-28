import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStorage } from '../../src/storage/InMemoryStorage.js';

describe('InMemoryStorage Unit Tests', () => {
  let storage: InMemoryStorage;

  beforeEach(() => {
    storage = new InMemoryStorage();
  });

  describe('Verification operations', () => {
    it('should create and retrieve a verification record', () => {
      const created = storage.createVerification({
        claim: 'Water boils at 100 degrees Celsius at sea level.',
        sourceUrl: 'https://science.org',
        debateRounds: 2,
      });

      expect(created.id).toBeDefined();
      expect(created._id).toBe(created.id);
      expect(created.status).toBe('PENDING');
      expect(created.claim).toBe('Water boils at 100 degrees Celsius at sea level.');

      const fetched = storage.getVerification(created.id);
      expect(fetched).not.toBeNull();
      expect(fetched?.id).toBe(created.id);
    });

    it('should update verification status, verdict, and findings', () => {
      const created = storage.createVerification({ claim: 'Earth is round' });
      const updated = storage.updateVerification(created.id, {
        status: 'COMPLETED',
        verdict: 'TRUE',
        confidenceScore: 0.99,
        summary: 'Geodetic measurements confirm spherical shape.',
      });

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('COMPLETED');
      expect(updated?.verdict).toBe('TRUE');
      expect(updated?.confidenceScore).toBe(0.99);

      const fetched = storage.getVerification(created.id);
      expect(fetched?.verdict).toBe('TRUE');
    });

    it('should return defensive clones preventing mutation of internal state', () => {
      const created = storage.createVerification({ claim: 'Original claim' });
      const retrieved = storage.getVerification(created.id)!;

      // Attempt to directly mutate the retrieved object
      retrieved.claim = 'Mutated claim directly';

      // Verify that internal storage was not mutated
      const fresh = storage.getVerification(created.id)!;
      expect(fresh.claim).toBe('Original claim');
    });
  });

  describe('Evidence and Argument operations', () => {
    it('should store and retrieve evidence associated with a verification', () => {
      const v = storage.createVerification({ claim: 'Test claim' });
      const ev1 = storage.createEvidence({
        verificationId: v.id,
        title: 'Source 1',
        url: 'https://example.com/1',
        sourceDomain: 'example.com',
        snippet: 'Snippet 1',
        publishedAt: null,
        retrievedAt: new Date(),
        stance: 'SUPPORTS',
        sourceType: 'SECONDARY',
        contentAccessLevel: 'SEARCH_SNIPPET',
      });

      const ev2 = storage.createEvidence({
        verificationId: v.id,
        title: 'Source 2',
        url: 'https://example.com/2',
        sourceDomain: 'example.com',
        snippet: 'Snippet 2',
        publishedAt: null,
        retrievedAt: new Date(),
        stance: 'CONTRADICTS',
        sourceType: 'SECONDARY',
        contentAccessLevel: 'SEARCH_SNIPPET',
      });

      const list = storage.getEvidenceByVerificationId(v.id);
      expect(list).toHaveLength(2);
      expect(list.map((e) => e.id)).toContain(ev1.id);
      expect(list.map((e) => e.id)).toContain(ev2.id);
    });

    it('should update evidence stance and source type', () => {
      const v = storage.createVerification({ claim: 'Test claim' });
      const ev = storage.createEvidence({
        verificationId: v.id,
        title: 'Source',
        url: 'https://example.com',
        sourceDomain: 'example.com',
        snippet: 'Snippet',
        publishedAt: null,
        retrievedAt: new Date(),
        stance: 'UNKNOWN',
        sourceType: 'UNKNOWN',
        contentAccessLevel: 'SEARCH_SNIPPET',
      });

      const updated = storage.updateEvidence(ev.id, {
        stance: 'SUPPORTS',
        sourceType: 'PRIMARY',
      });

      expect(updated?.stance).toBe('SUPPORTS');
      expect(updated?.sourceType).toBe('PRIMARY');
    });

    it('should store and retrieve debate arguments sorted by roundNumber', () => {
      const v = storage.createVerification({ claim: 'Debate claim' });

      storage.createAgentArgument({
        verificationId: v.id,
        agentType: 'OPPONENT',
        roundNumber: 2,
        argument: 'Round 2 Opponent',
        reasoningSummary: 'R2 Summary',
        evidenceIds: [],
      });

      storage.createAgentArgument({
        verificationId: v.id,
        agentType: 'SUPPORTER',
        roundNumber: 1,
        argument: 'Round 1 Supporter',
        reasoningSummary: 'R1 Summary',
        evidenceIds: [],
      });

      const args = storage.getArgumentsByVerificationId(v.id);
      expect(args).toHaveLength(2);
      expect(args[0].roundNumber).toBe(1);
      expect(args[1].roundNumber).toBe(2);
    });
  });

  describe('History, Pagination, Search, and Filtering', () => {
    beforeEach(() => {
      for (let i = 1; i <= 15; i++) {
        storage.createVerification({
          claim: `Factual claim number ${i} about science`,
        });
      }
    });

    it('should paginate verification history correctly', () => {
      const page1 = storage.listVerifications({ page: 1, limit: 10 });
      expect(page1.total).toBe(15);
      expect(page1.items).toHaveLength(10);

      const page2 = storage.listVerifications({ page: 2, limit: 10 });
      expect(page2.items).toHaveLength(5);
    });

    it('should search verifications by keyword', () => {
      storage.createVerification({
        claim: 'Albert Einstein formulated General Relativity in 1915.',
      });

      const result = storage.searchVerifications({ query: 'Einstein' });
      expect(result.total).toBe(1);
      expect(result.items[0].claim).toContain('Albert Einstein');
    });

    it('should filter verifications by verdict', () => {
      const v1 = storage.createVerification({ claim: 'Claim True' });
      storage.updateVerification(v1.id, { verdict: 'TRUE' });

      const v2 = storage.createVerification({ claim: 'Claim False' });
      storage.updateVerification(v2.id, { verdict: 'FALSE' });

      const trueList = storage.filterVerificationsByVerdict({ verdict: 'TRUE' });
      expect(trueList.items.every((item) => item.verdict === 'TRUE')).toBe(true);
      expect(trueList.total).toBe(1);
    });
  });

  describe('Cascading Deletion and Isolation', () => {
    it('should delete verification and all associated evidence, arguments, and events', () => {
      const v = storage.createVerification({ claim: 'Claim to be deleted' });

      storage.createEvidence({
        verificationId: v.id,
        title: 'Evidence to delete',
        url: 'https://example.com/del',
        sourceDomain: 'example.com',
        snippet: 'Snippet',
        publishedAt: null,
        retrievedAt: new Date(),
        stance: 'SUPPORTS',
        sourceType: 'SECONDARY',
        contentAccessLevel: 'SEARCH_SNIPPET',
      });

      storage.createAgentArgument({
        verificationId: v.id,
        agentType: 'SUPPORTER',
        roundNumber: 1,
        argument: 'Arg to delete',
        reasoningSummary: 'Summary',
        evidenceIds: [],
      });

      storage.createVerificationEvent({
        verificationId: v.id,
        eventType: 'verification.started',
        message: 'Started',
      });

      // Verify records exist
      expect(storage.getEvidenceByVerificationId(v.id)).toHaveLength(1);
      expect(storage.getArgumentsByVerificationId(v.id)).toHaveLength(1);
      expect(storage.getEventsByVerificationId(v.id)).toHaveLength(1);

      // Delete
      const deleted = storage.deleteVerification(v.id);
      expect(deleted).toBe(true);

      // Verify all cascading records removed
      expect(storage.getVerification(v.id)).toBeNull();
      expect(storage.getEvidenceByVerificationId(v.id)).toHaveLength(0);
      expect(storage.getArgumentsByVerificationId(v.id)).toHaveLength(0);
      expect(storage.getEventsByVerificationId(v.id)).toHaveLength(0);
    });

    it('should isolate concurrent verifications without cross-contamination', () => {
      const v1 = storage.createVerification({ claim: 'Claim 1' });
      const v2 = storage.createVerification({ claim: 'Claim 2' });

      storage.createEvidence({
        verificationId: v1.id,
        title: 'V1 Evidence',
        url: 'https://v1.com',
        sourceDomain: 'v1.com',
        snippet: 'Snippet 1',
        publishedAt: null,
        retrievedAt: new Date(),
        stance: 'SUPPORTS',
        sourceType: 'SECONDARY',
        contentAccessLevel: 'SEARCH_SNIPPET',
      });

      storage.createEvidence({
        verificationId: v2.id,
        title: 'V2 Evidence',
        url: 'https://v2.com',
        sourceDomain: 'v2.com',
        snippet: 'Snippet 2',
        publishedAt: null,
        retrievedAt: new Date(),
        stance: 'CONTRADICTS',
        sourceType: 'SECONDARY',
        contentAccessLevel: 'SEARCH_SNIPPET',
      });

      const v1Evidence = storage.getEvidenceByVerificationId(v1.id);
      const v2Evidence = storage.getEvidenceByVerificationId(v2.id);

      expect(v1Evidence).toHaveLength(1);
      expect(v1Evidence[0].title).toBe('V1 Evidence');

      expect(v2Evidence).toHaveLength(1);
      expect(v2Evidence[0].title).toBe('V2 Evidence');
    });
  });
});

