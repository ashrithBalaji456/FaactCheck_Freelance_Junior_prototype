import { describe, it, expect, beforeEach } from 'vitest';
import { VerificationOrchestrator } from '../../src/services/VerificationOrchestrator.js';
import { storage } from '../../src/storage/InMemoryStorage.js';
import { MockAiClient } from '../../src/ai/MockAiClient.js';
import { MockSearchClient } from '../../src/search/MockSearchClient.js';

describe('Multi-Agent Orchestrator Acceptance Test (In-Memory Storage)', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('should run end-to-end 6-agent debate, validate citations, and render verdict', async () => {
    const mockAi = new MockAiClient();
    const mockSearch = new MockSearchClient();
    const orchestrator = new VerificationOrchestrator(mockAi, mockSearch);

    const verification = storage.createVerification({
      claim: "India's Constitution came into effect on 26 January 1950.",
      sourceUrl: 'https://legislative.gov.in',
      debateRounds: 2,
      status: 'PENDING',
    });

    // Execute pipeline
    await orchestrator.runPipeline(verification.id);

    // 1. Check final Verification status in in-memory storage
    const updated = storage.getVerification(verification.id);
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe('COMPLETED');
    expect(updated?.verdict).toBe('TRUE');
    expect(updated?.confidenceScore).toBe(0.98);
    expect(updated?.normalizedClaim).toBeDefined();
    expect(updated?.summary).toContain('Constitution of India');
    expect(updated?.explanation).toBeDefined();
    expect(updated?.processingDurationMs).toBeGreaterThan(0);

    // 2. Check Evidence documents persisted in in-memory storage
    const evidenceList = storage.getEvidenceByVerificationId(verification.id);
    expect(evidenceList.length).toBeGreaterThanOrEqual(1);
    for (const ev of evidenceList) {
      expect(ev.title).toBeDefined();
      expect(ev.url).toBeDefined();
      expect(ev.sourceDomain).toBeDefined();
      expect(['SUPPORTS', 'CONTRADICTS', 'CONTEXT']).toContain(ev.stance);
    }

    // 3. Check Debate Arguments persisted in in-memory storage
    const debateArgs = storage.getArgumentsByVerificationId(verification.id);
    // 2 rounds * 2 agents (Supporter + Opponent) = 4 arguments
    expect(debateArgs.length).toBe(4);
    expect(debateArgs[0].agentType).toBe('SUPPORTER');
    expect(debateArgs[0].roundNumber).toBe(1);
    expect(debateArgs[1].agentType).toBe('OPPONENT');
    expect(debateArgs[1].roundNumber).toBe(1);
    expect(debateArgs[2].agentType).toBe('SUPPORTER');
    expect(debateArgs[2].roundNumber).toBe(2);
    expect(debateArgs[3].agentType).toBe('OPPONENT');
    expect(debateArgs[3].roundNumber).toBe(2);

    // 4. Check Fact-Checker Report
    expect(updated?.factCheckerReport).toBeDefined();
    const audit = updated?.factCheckerReport as any;
    expect(audit.citationIntegrity).toBeDefined();
    expect(audit.citationIntegrity.citationValidityRatio).toBeDefined();

    // 5. Check Verification Events timeline
    const events = storage.getEventsByVerificationId(verification.id);
    const eventTypes = events.map((e) => e.eventType);

    expect(eventTypes).toContain('verification.started');
    expect(eventTypes).toContain('claim_analysis.started');
    expect(eventTypes).toContain('claim_analysis.completed');
    expect(eventTypes).toContain('evidence_search.started');
    expect(eventTypes).toContain('evidence_search.completed');
    expect(eventTypes).toContain('agent.started');
    expect(eventTypes).toContain('agent.completed');
    expect(eventTypes).toContain('debate.round.completed');
    expect(eventTypes).toContain('fact_check.started');
    expect(eventTypes).toContain('fact_check.completed');
    expect(eventTypes).toContain('judge.started');
    expect(eventTypes).toContain('judge.completed');
    expect(eventTypes).toContain('verification.completed');
  });
});
