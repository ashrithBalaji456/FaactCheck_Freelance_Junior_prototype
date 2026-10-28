import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(
    {
      err: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    },
    'Request error caught by global handler'
  );

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const code = err.code || (err.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');

  res.status(statusCode).json({
    success: false,
    code,
    message: err.isOperational ? err.message : 'An unexpected error occurred. Please try again.',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
}

