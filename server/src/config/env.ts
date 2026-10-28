import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  TAVILY_API_KEY: z.string().optional(),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  MAX_DEBATE_ROUNDS: z.coerce.number().default(3),
  DEFAULT_DEBATE_ROUNDS: z.coerce.number().default(2),
  MAX_SEARCH_RESULTS: z.coerce.number().default(8),
  MAX_SEARCH_QUERIES: z.coerce.number().default(6),
  GEMINI_TIMEOUT_MS: z.coerce.number().default(30000),
  SEARCH_TIMEOUT_MS: z.coerce.number().default(15000),
  VERIFICATION_TIMEOUT_MS: z.coerce.number().default(180000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),
});

export const env = envSchema.parse(process.env);
