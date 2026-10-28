import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { validateCitationIds, isValidCitationId } from '../../src/utils/citationValidator.js';

describe('CitationValidator Unit Tests', () => {
  const genId = () => crypto.randomBytes(12).toString('hex');

  it('should accept valid 24-character hex IDs present in available evidence', () => {
    const id1 = genId();
    const id2 = genId();

    const result = validateCitationIds([id1, id2], [id1, id2]);
    expect(result.isValid).toBe(true);
    expect(result.validIds).toHaveLength(2);
    expect(result.invalidIds).toHaveLength(0);
  });

  it('should reject IDs not present in available evidence', () => {
    const id1 = genId();
    const foreignId = genId();

    const result = validateCitationIds([foreignId], [id1]);
    expect(result.isValid).toBe(false);
    expect(result.validIds).toHaveLength(0);
    expect(result.invalidIds).toContain(foreignId);
  });

  it('should reject malformed non-ID strings', () => {
    const id1 = genId();
    const result = validateCitationIds(['invalid-uuid-1234', 'null', ''], [id1]);
    expect(result.isValid).toBe(false);
    expect(result.validIds).toHaveLength(0);
    expect(result.invalidIds).toHaveLength(3);
  });

  it('should deduplicate multiple references to the same valid evidence ID', () => {
    const id1 = genId();
    const result = validateCitationIds([id1, id1, id1], [id1]);
    expect(result.isValid).toBe(true);
    expect(result.validIds).toHaveLength(1);
  });

  it('should accurately test isValidCitationId', () => {
    expect(isValidCitationId(genId())).toBe(true);
    expect(isValidCitationId('not-valid')).toBe(false);
    expect(isValidCitationId('')).toBe(false);
  });
});
