import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import noteRoutes from './note.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/notes', noteRoutes);

export default router;