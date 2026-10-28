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

    // Build ordered list of candidate models for automated fallback
    const candidateModels = Array.from(
      new Set([
        this.modelName,
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-flash-latest',
        'gemini-2.5-flash',
      ])
    );

    let lastError: any = null;

    for (const currentModel of candidateModels) {
      const retries = 1;
      let delay = 1000;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          logger.debug({ model: currentModel, attempt }, 'Calling Gemini API');

          const model = this.genAI.getGenerativeModel({
            model: currentModel,
            systemInstruction: systemInstruction,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          // Timeout wrapper
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Gemini API call timed out on ${currentModel}`)), env.GEMINI_TIMEOUT_MS)
          );

          const resultPromise = model.generateContent(userPrompt);
          const result = await Promise.race([resultPromise, timeoutPromise]);
          const responseText = result.response.text();

          const parsed = GeminiResponseParser.parseAndValidate(responseText, schema);
          if (currentModel !== this.modelName) {
            logger.info({ originalModel: this.modelName, activeModel: currentModel }, 'Gemini model fallback succeeded');
          }
          return parsed;
        } catch (err: any) {
          lastError = err;
          const msg = (err.message || '').toLowerCase();
          const isRateLimit = err.status === 429 || msg.includes('429') || msg.includes('quota');
          const isCapacityOr503 =
            err.status === 503 ||
            msg.includes('503') ||
            msg.includes('high demand') ||
            msg.includes('service unavailable') ||
            msg.includes('overloaded');
          const isServerError =
            (typeof err.status === 'number' && err.status >= 500) ||
            msg.includes('500') ||
            msg.includes('502') ||
            msg.includes('504');
          const isModelUnavailable =
            err.status === 404 ||
            msg.includes('404') ||
            msg.includes('not found') ||
            msg.includes('no longer available');
          const isTimeout = msg.includes('timed out');

          const isTransient = isRateLimit || isCapacityOr503 || isServerError || isTimeout;

          // If capacity is overloaded or model unavailable, immediately break to try next model in fallback cascade
          if (isCapacityOr503 || isModelUnavailable) {
            logger.warn(
              { model: currentModel, err: err.message },
              'Gemini model overloaded (503/404); executing automated fallback to next model...'
            );
            break;
          }

          if (isTransient && attempt < retries) {
            const jitter = Math.random() * 500;
            logger.warn({ model: currentModel, attempt, delay, err: err.message }, 'Gemini call failed with transient error; retrying...');
            await new Promise((res) => setTimeout(res, delay + jitter));
            delay *= 2;
            continue;
          }

          logger.warn({ model: currentModel, err: err.message }, 'Gemini model attempt failed; trying next fallback candidate');
          break; // Move to next candidate model
        }
      }
    }

    logger.error({ err: lastError?.message, candidateModels }, 'All Gemini candidate models failed');
    throw lastError || new Error('All Gemini candidate models failed after retries and fallbacks.');
  }
}

