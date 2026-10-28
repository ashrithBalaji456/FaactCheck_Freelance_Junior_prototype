import { Router } from 'express';
import { VerificationController } from '../controllers/VerificationController.js';
import { SseController } from '../events/SseController.js';
import { verificationRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Submission
router.post('/', verificationRateLimiter, VerificationController.create);

// Listing, search, and filtering
router.get('/', VerificationController.list);
router.get('/search', VerificationController.search);
router.get('/verdict/:verdict', VerificationController.filterByVerdict);

// Single verification retrieval and deletion
router.get('/:id', VerificationController.getById);
router.delete('/:id', VerificationController.delete);

// Granular sub-resource endpoints
router.get('/:id/evidence', VerificationController.getEvidence);
router.get('/:id/debate', VerificationController.getDebate);
router.get('/:id/events', VerificationController.getEvents);

// Real-time Server-Sent Events stream
router.get('/:id/events/stream', SseController.stream);

export const verificationRoutes = router;

