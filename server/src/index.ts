import { app } from './app.js';
import { env } from './config/env.js';
import { verificationService } from './services/VerificationService.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    logger.info('Starting FactVerify AI Server (In-Memory Storage Mode)...');

    // Recover unfinished jobs if any exist in in-memory state
    await verificationService.recoverUnfinishedJobs();

    const server = app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Storage: In-Memory Map Collections (No external database required)`);
      logger.info(`API Base URL: http://localhost:${env.PORT}/api/v1`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info({ signal }, 'Received shutdown signal. Closing server...');
      server.close(() => {
        logger.info('HTTP server closed cleanly.');
        process.exit(0);
      });

      // Force shutdown after 5s if graceful close hangs
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.fatal({ error }, 'Fatal error during server startup');
    process.exit(1);
  }
}

startServer();
