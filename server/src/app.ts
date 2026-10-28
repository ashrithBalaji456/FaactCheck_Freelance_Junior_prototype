import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

export const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req, res, next) => {
  logger.debug({ method: req.method, url: req.url }, 'Incoming HTTP Request');
  next();
});

// Primary API Router mounted at /api/v1
app.use('/api/v1', apiRouter);

// Global Error Handler
app.use(errorHandler);

