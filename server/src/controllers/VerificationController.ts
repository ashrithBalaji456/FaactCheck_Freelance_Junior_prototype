import { Request, Response } from 'express';
import { storage } from '../storage/InMemoryStorage.js';
import { verificationService } from '../services/VerificationService.js';
import {
  createVerificationSchema,
  listVerificationQuerySchema,
  searchVerificationQuerySchema,
  verdictParamSchema,
} from '../schemas/verificationSchemas.js';
import { logger } from '../utils/logger.js';

export class VerificationController {
  // 1. POST /api/v1/verifications
  static async create(req: Request, res: Response): Promise<void> {
    const parseResult = createVerificationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid verification submission payload',
        errors: parseResult.error.errors,
      });
      return;
    }

    const { claim, sourceUrl, debateRounds } = parseResult.data;

    try {
      const verification = storage.createVerification({
        claim,
        sourceUrl: sourceUrl || null,
        debateRounds,
        status: 'PENDING',
      });

      // Hand off to non-blocking background queue
      verificationService.enqueue(verification.id);

      res.status(202).json({
        success: true,
        data: {
          id: verification.id,
          claim: verification.claim,
          status: verification.status,
          statusUrl: `/api/v1/verifications/${verification.id}`,
          eventsUrl: `/api/v1/verifications/${verification.id}/events/stream`,
        },
      });
    } catch (err: any) {
      logger.error({ err }, 'Failed to create verification record in storage');
      res.status(500).json({
        success: false,
        code: 'CREATION_ERROR',
        message: 'Failed to initiate verification request',
      });
    }
  }

  // 2. GET /api/v1/verifications/:id
  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!storage.isValidId(id)) {
      res.status(400).json({
        success: false,
        code: 'INVALID_ID',
        message: 'Invalid verification ID format',
      });
      return;
    }

    const verification = storage.getVerification(id);
    if (!verification) {
      res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Verification report not found',
      });
      return;
    }

    const evidence = storage.getEvidenceByVerificationId(id);
    const argumentsList = storage.getArgumentsByVerificationId(id);

    res.json({
      success: true,
      data: {
        id: verification.id,
        _id: verification._id,
        claim: verification.claim,
        normalizedClaim: verification.normalizedClaim,
        sourceUrl: verification.sourceUrl,
        status: verification.status,
        verdict: verification.verdict,
        confidenceScore: verification.confidenceScore,
        summary: verification.summary,
        explanation: verification.explanation,
        failureCode: verification.failureCode,
        failureMessage: verification.failureMessage,
        debateRounds: verification.debateRounds,
        evidence,
        arguments: argumentsList,
        factCheckerReport: verification.factCheckerReport,
        judgeReport: verification.judgeReport,
        processingDurationMs: verification.processingDurationMs,
        createdAt: verification.createdAt,
        updatedAt: verification.updatedAt,
        completedAt: verification.completedAt,
      },
    });
  }

  // 3. GET /api/v1/verifications
  static async list(req: Request, res: Response): Promise<void> {
    const parseResult = listVerificationQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        code: 'INVALID_QUERY',
        message: 'Invalid pagination query parameters',
        errors: parseResult.error.errors,
      });
      return;
    }

    const { page, limit, sort, order } = parseResult.data;
    const result = storage.listVerifications({ page, limit, sort, order });

    res.json({
      success: true,
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  }

  // 4. GET /api/v1/verifications/search?q=...
  static async search(req: Request, res: Response): Promise<void> {
    const parseResult = searchVerificationQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        code: 'INVALID_SEARCH',
        message: 'Invalid search query parameters',
        errors: parseResult.error.errors,
      });
      return;
    }

    const { q, page, limit } = parseResult.data;
    const result = storage.searchVerifications({ query: q, page, limit });

    res.json({
      success: true,
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  }

  // 5. GET /api/v1/verifications/verdict/:verdict
  static async filterByVerdict(req: Request, res: Response): Promise<void> {
    const paramResult = verdictParamSchema.safeParse(req.params);
    if (!paramResult.success) {
      res.status(400).json({
        success: false,
        code: 'INVALID_VERDICT',
        message: 'Invalid verdict. Must be one of: TRUE, FALSE, PARTIALLY_TRUE, UNCERTAIN',
      });
      return;
    }

    const { verdict } = paramResult.data;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    const result = storage.filterVerificationsByVerdict({ verdict, page, limit });

    res.json({
      success: true,
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  }

  // 6. GET /api/v1/verifications/:id/evidence
  static async getEvidence(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!storage.isValidId(id)) {
      res.status(400).json({ success: false, code: 'INVALID_ID', message: 'Invalid ID format' });
      return;
    }

    const verification = storage.getVerification(id);
    if (!verification) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Verification not found' });
      return;
    }

    const evidence = storage.getEvidenceByVerificationId(id);
    res.json({ success: true, data: evidence });
  }

  // 7. GET /api/v1/verifications/:id/debate
  static async getDebate(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!storage.isValidId(id)) {
      res.status(400).json({ success: false, code: 'INVALID_ID', message: 'Invalid ID format' });
      return;
    }

    const verification = storage.getVerification(id);
    if (!verification) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Verification not found' });
      return;
    }

    const args = storage.getArgumentsByVerificationId(id);
    res.json({ success: true, data: args });
  }

  // 8. GET /api/v1/verifications/:id/events
  static async getEvents(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!storage.isValidId(id)) {
      res.status(400).json({ success: false, code: 'INVALID_ID', message: 'Invalid ID format' });
      return;
    }

    const verification = storage.getVerification(id);
    if (!verification) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Verification not found' });
      return;
    }

    const events = storage.getEventsByVerificationId(id);
    res.json({ success: true, data: events });
  }

  // 9. DELETE /api/v1/verifications/:id
  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!storage.isValidId(id)) {
      res.status(400).json({ success: false, code: 'INVALID_ID', message: 'Invalid ID format' });
      return;
    }

    const deleted = storage.deleteVerification(id);
    if (!deleted) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Verification record not found' });
      return;
    }

    logger.info({ verificationId: id }, 'Verification and associated records deleted from in-memory storage');
    res.status(204).send();
  }
}
