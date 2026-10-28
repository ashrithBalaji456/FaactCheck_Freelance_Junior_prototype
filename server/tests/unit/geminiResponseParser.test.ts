import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { GeminiResponseParser } from '../../src/ai/GeminiResponseParser.js';

describe('GeminiResponseParser Unit Tests', () => {
  const testSchema = z.object({
    name: z.string(),
    score: z.number(),
  });

  it('should parse raw JSON string', () => {
    const raw = '{"name":"Verification","score":0.99}';
    const parsed = GeminiResponseParser.parseAndValidate(raw, testSchema);
    expect(parsed.name).toBe('Verification');
    expect(parsed.score).toBe(0.99);
  });

  it('should strip markdown ```json code blocks', () => {
    const raw = '```json\n{"name":"MarkdownWrapped","score":1.0}\n```';
    const parsed = GeminiResponseParser.parseAndValidate(raw, testSchema);
    expect(parsed.name).toBe('MarkdownWrapped');
  });

  it('should throw an error on malformed JSON', () => {
    const malformed = '{"name":"Unclosed';
    expect(() => GeminiResponseParser.parseAndValidate(malformed, testSchema)).toThrow(
      /Malformed JSON/
    );
  });

  it('should throw an error on schema validation mismatch', () => {
    const invalidType = '{"name":"MissingScore"}';
    expect(() => GeminiResponseParser.parseAndValidate(invalidType, testSchema)).toThrow(
      /Response failed schema validation/
    );
  });
});

