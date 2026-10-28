import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const verificationRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded. Please wait before submitting additional verification requests.',
    timestamp: new Date().toISOString(),
  },
});

