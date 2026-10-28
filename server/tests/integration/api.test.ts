import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { storage } from '../../src/storage/InMemoryStorage.js';

describe('REST API Integration Tests with In-Memory Storage (/api/v1)', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('GET /api/v1/health should return ok and in-memory storage status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('in-memory');
    expect(res.body.storage.type).toBe('in-memory');
  });

  it('POST /api/v1/verifications should return 202 Accepted and initial status', async () => {
    const res = await request(app)
      .post('/api/v1/verifications')
      .send({
        claim: "India's Constitution came into effect on 26 January 1950.",
        sourceUrl: null,
        debateRounds: 2,
      });

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.statusUrl).toContain('/api/v1/verifications/');
    expect(res.body.data.eventsUrl).toContain('/events/stream');
  });

  it('POST /api/v1/verifications should return 400 on empty claim', async () => {
    const res = await request(app)
      .post('/api/v1/verifications')
      .send({ claim: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/v1/verifications/:id should return report and related data', async () => {
    const v = storage.createVerification({
      claim: 'Test claim for retrieval',
    });
    storage.updateVerification(v.id, {
      status: 'COMPLETED',
      verdict: 'TRUE',
      confidenceScore: 0.99,
      summary: 'Verified as true.',
      explanation: 'Detailed explanation.',
    });

    const res = await request(app).get(`/api/v1/verifications/${v.id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(v.id);
    expect(res.body.data.verdict).toBe('TRUE');
    expect(res.body.data.evidence).toEqual([]);
  });

  it('GET /api/v1/verifications should return paginated list', async () => {
    storage.createVerification({ claim: 'Claim 1' });
    storage.createVerification({ claim: 'Claim 2' });

    const res = await request(app).get('/api/v1/verifications?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('GET /api/v1/verifications/search?q=... should find records', async () => {
    storage.createVerification({ claim: 'Searchable quantum computing finding' });

    const res = await request(app).get('/api/v1/verifications/search?q=quantum');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].claim).toContain('quantum');
  });

  it('GET /api/v1/verifications/verdict/:verdict should filter by verdict', async () => {
    const v1 = storage.createVerification({ claim: 'Verified claim' });
    storage.updateVerification(v1.id, { verdict: 'TRUE' });

    const v2 = storage.createVerification({ claim: 'Unverified claim' });
    storage.updateVerification(v2.id, { verdict: 'FALSE' });

    const res = await request(app).get('/api/v1/verifications/verdict/TRUE');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data.every((r: any) => r.verdict === 'TRUE')).toBe(true);
  });

  it('GET /api/v1/verifications/verdict/INVALID should return 400', async () => {
    const res = await request(app).get('/api/v1/verifications/verdict/MAYBE');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_VERDICT');
  });

  it('GET /api/v1/verifications/:id/evidence should return evidence list', async () => {
    const v = storage.createVerification({ claim: 'Evidence test claim' });
    storage.createEvidence({
      verificationId: v.id,
      title: 'Source Title',
      url: 'https://example.com/source',
      sourceDomain: 'example.com',
      snippet: 'Source snippet',
      publishedAt: null,
      retrievedAt: new Date(),
      stance: 'SUPPORTS',
      sourceType: 'SECONDARY',
      contentAccessLevel: 'SEARCH_SNIPPET',
    });

    const res = await request(app).get(`/api/v1/verifications/${v.id}/evidence`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Source Title');
  });

  it('GET /api/v1/verifications/:id/debate should return arguments', async () => {
    const v = storage.createVerification({ claim: 'Debate test claim' });
    storage.createAgentArgument({
      verificationId: v.id,
      agentType: 'SUPPORTER',
      roundNumber: 1,
      argument: 'Strong supporting argument.',
      reasoningSummary: 'Reasoning.',
      evidenceIds: [],
    });

    const res = await request(app).get(`/api/v1/verifications/${v.id}/debate`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].agentType).toBe('SUPPORTER');
  });

  it('GET /api/v1/verifications/:id/events should return chronological events', async () => {
    const v = storage.createVerification({ claim: 'Event test claim' });
    storage.createVerificationEvent({
      verificationId: v.id,
      eventType: 'claim_analysis.started',
      message: 'Claim analysis in progress.',
    });

    const res = await request(app).get(`/api/v1/verifications/${v.id}/events`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].eventType).toBe('claim_analysis.started');
  });

  it('DELETE /api/v1/verifications/:id should delete verification and related in-memory documents', async () => {
    const v = storage.createVerification({ claim: 'Deletion test claim' });
    storage.createEvidence({
      verificationId: v.id,
      title: 'ToDelete',
      url: 'https://example.com/delete',
      sourceDomain: 'example.com',
      snippet: 'Snippet',
      publishedAt: null,
      retrievedAt: new Date(),
      stance: 'UNKNOWN',
      sourceType: 'UNKNOWN',
      contentAccessLevel: 'SEARCH_SNIPPET',
    });
    storage.createAgentArgument({
      verificationId: v.id,
      agentType: 'SUPPORTER',
      roundNumber: 1,
      argument: 'Arg',
      reasoningSummary: 'Summary',
      evidenceIds: [],
    });
    storage.createVerificationEvent({
      verificationId: v.id,
      eventType: 'verification.started',
      message: 'Started',
    });

    const deleteRes = await request(app).delete(`/api/v1/verifications/${v.id}`);
    expect(deleteRes.status).toBe(204);

    // Verify all cascading records removed
    expect(storage.getVerification(v.id)).toBeNull();
    expect(storage.getEvidenceByVerificationId(v.id)).toHaveLength(0);
    expect(storage.getArgumentsByVerificationId(v.id)).toHaveLength(0);
    expect(storage.getEventsByVerificationId(v.id)).toHaveLength(0);
  });

  it('DELETE /api/v1/verifications/:id should return 404 for non-existent record', async () => {
    const fakeId = storage.generateId();
    const res = await request(app).delete(`/api/v1/verifications/${fakeId}`);
    expect(res.status).toBe(404);
  });
});
