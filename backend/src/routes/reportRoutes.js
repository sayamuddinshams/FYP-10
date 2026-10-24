import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Authenticated users can file reports
router.post('/', reportController.createReport);

// Admin moderation
router.get('/', authorize('admin'), reportController.getReports);
router.patch('/:id', authorize('admin'), reportController.updateReport);

export default router;
