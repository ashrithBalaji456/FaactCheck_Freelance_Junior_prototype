import { Request, Response } from 'express';
import { storage } from '../storage/InMemoryStorage.js';

export class HealthController {
  static getHealth(req: Request, res: Response) {
    const stats = storage.getStats();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: 'in-memory',
      storage: {
        type: 'in-memory',
        status: 'ready',
        records: stats,
      },
      service: 'FactVerify AI API',
      version: '1.0.0',
    });
  }
}
