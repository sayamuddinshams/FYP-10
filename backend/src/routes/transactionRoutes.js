import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/my', transactionController.getMyTransactions);
router.get('/owner-summary', authorize('owner', 'admin'), transactionController.getOwnerEarningsSummary);
router.get('/admin-summary', authorize('admin'), transactionController.getAdminFinanceSummary);
router.post('/', transactionController.createTransaction);
router.patch('/:id/payout', authorize('admin'), transactionController.updatePayout);

export default router;
