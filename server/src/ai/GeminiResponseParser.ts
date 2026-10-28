import { z, ZodSchema } from 'zod';
import { logger } from '../utils/logger.js';

export class GeminiResponseParser {
  /**
   * Cleans model output, extracts JSON from markdown blocks, and validates against Zod schema.
   */
  static parseAndValidate<T>(rawText: string, schema: ZodSchema<T>): T {
    let cleanText = rawText.trim();

    // Strip markdown code fences if model enclosed JSON in ```json ... ```
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleanText);
    } catch (parseError: any) {
      logger.error({ rawText, parseError: parseError.message }, 'Failed to parse JSON from Gemini response');
      throw new Error(`Malformed JSON in model response: ${parseError.message}`);
    }

    const validationResult = schema.safeParse(parsedJson);
    if (!validationResult.success) {
      logger.error({ errors: validationResult.error.errors, parsedJson }, 'Model JSON failed schema validation');
      throw new Error(
        `Response failed schema validation: ${validationResult.error.errors.map((e) => e.message).join(', ')}`
      );
    }

    return validationResult.data;
  }
}

