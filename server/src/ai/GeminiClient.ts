import { GoogleGenerativeAI } from '@google/generative-ai';
import { ZodSchema } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { GeminiResponseParser } from './GeminiResponseParser.js';

export interface AiClient {
  generateStructuredJson<T>(
    userPrompt: string,
    systemInstruction: string,
    schema: ZodSchema<T>
  ): Promise<T>;
}

export class GeminiClient implements AiClient {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || env.GEMINI_API_KEY;
    if (key && key !== 'replace_with_your_key') {
      this.genAI = new GoogleGenerativeAI(key);
    }
    this.modelName = modelName || env.GEMINI_MODEL;
  }

  async generateStructuredJson<T>(
    userPrompt: string,
    systemInstruction: string,
    schema: ZodSchema<T>
  ): Promise<T> {
    if (!this.genAI) {
      throw new Error(
        'GEMINI_API_KEY is not configured. Set a valid API key in server/.env or configure a provider.'
      );
    }

    const retries = 2;
    let delay = 1000;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        logger.debug({ model: this.modelName, attempt }, 'Calling Gemini API');

        const model = this.genAI.getGenerativeModel({
          model: this.modelName,
          systemInstruction: systemInstruction,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        // Timeout wrapper
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out')), env.GEMINI_TIMEOUT_MS)
        );

        const resultPromise = model.generateContent(userPrompt);
        const result = await Promise.race([resultPromise, timeoutPromise]);
        const responseText = result.response.text();

        return GeminiResponseParser.parseAndValidate(responseText, schema);
      } catch (err: any) {
        const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
        const isTransient = isRateLimit || err.status >= 500 || (err.message && err.message.includes('timeout'));

        if (isTransient && attempt < retries) {
          const jitter = Math.random() * 500;
          logger.warn({ attempt, delay, err: err.message }, 'Gemini call failed with transient error; retrying...');
          await new Promise((res) => setTimeout(res, delay + jitter));
          delay *= 2;
          continue;
        }

        logger.error({ err: err.message, model: this.modelName }, 'Gemini API call terminated with error');
        throw err;
      }
    }

    throw new Error('Gemini API call failed after retries.');
  }
}

