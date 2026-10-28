import { Router } from 'express';
import { HealthController } from '../controllers/HealthController.js';
import { verificationRoutes } from './verificationRoutes.js';

const apiRouter = Router();

apiRouter.get('/health', HealthController.getHealth);
apiRouter.use('/verifications', verificationRoutes);

export { apiRouter };

