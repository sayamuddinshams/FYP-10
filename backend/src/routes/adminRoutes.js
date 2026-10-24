import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/overview', adminController.getOverview);
router.get('/counts', adminController.getCounts);
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.saveSettings);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
