import { Router } from 'express';
import * as adController from '../controllers/adController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// Public routes
router.get('/active', adController.getActiveAds);
router.post('/:id/interact', adController.recordInteraction);

// Admin routes
router.get('/', authenticate, authorize('admin'), adController.getAllAds);
router.post('/', authenticate, authorize('admin'), adController.createAd);
router.put('/:id', authenticate, authorize('admin'), adController.updateAd);
router.delete('/:id', authenticate, authorize('admin'), adController.deleteAd);

export default router;
