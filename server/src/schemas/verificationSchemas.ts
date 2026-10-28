import { z } from 'zod';
import { isSafePublicUrl } from '../utils/urlValidator.js';

export const createVerificationSchema = z.object({
  claim: z
    .string({ required_error: 'Claim is required' })
    .trim()
    .min(5, 'Claim must be at least 5 characters long')
    .max(1000, 'Claim cannot exceed 1000 characters'),
  sourceUrl: z
    .string()
    .trim()
    .refine((val) => val === '' || isSafePublicUrl(val), {
      message: 'Source URL must be a valid public HTTP or HTTPS URL',
    })
    .nullable()
    .optional(),
  debateRounds: z
    .number({ invalid_type_error: 'debateRounds must be an integer' })
    .int('debateRounds must be an integer')
    .min(1, 'Minimum debate rounds is 1')
    .max(5, 'Maximum debate rounds is 5')
    .default(2),
});

export const listVerificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(['createdAt', 'completedAt', 'claim', 'verdict']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const searchVerificationQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query cannot be empty').max(100),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const verdictParamSchema = z.object({
  verdict: z.enum(['TRUE', 'FALSE', 'PARTIALLY_TRUE', 'UNCERTAIN']),
});

