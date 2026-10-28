import { Request, Response } from 'express';
import { storage } from '../storage/InMemoryStorage.js';
import { eventBus, ProgressEventPayload } from './VerificationEventBus.js';
import { logger } from '../utils/logger.js';

export class SseController {
  static async stream(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!storage.isValidId(id)) {
      res.status(400).json({
        success: false,
        code: 'INVALID_ID',
        message: 'Invalid verification ID format',
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    res.write(`event: connected\ndata: ${JSON.stringify({ verificationId: id, status: 'connected' })}\n\n`);

    try {
      // Replay chronological persisted events from in-memory storage for seamless reconnects
      const historicalEvents = storage.getEventsByVerificationId(id);

      for (const ev of historicalEvents) {
        res.write(
          `event: ${ev.eventType}\ndata: ${JSON.stringify({
            verificationId: id,
            eventType: ev.eventType,
            message: ev.message,
            timestamp: ev.createdAt.toISOString(),
            metadata: ev.metadata,
          })}\n\n`
        );
      }
    } catch (err) {
      logger.error({ err, verificationId: id }, 'Error retrieving historical events for SSE');
    }

    // Subscribe to live events
    const listener = (payload: ProgressEventPayload) => {
      res.write(
        `event: ${payload.eventType}\ndata: ${JSON.stringify(payload)}\n\n`
      );
    };

    eventBus.subscribe(id, listener);

    // Heartbeat every 15s to keep connection alive through proxies
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeatInterval);
      eventBus.unsubscribe(id, listener);
      res.end();
    });
  }
}
