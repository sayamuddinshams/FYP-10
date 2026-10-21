import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// Public user/owner profiles
router.get('/owners', userController.getOwners);
router.get('/:id', userController.getUserById);

// Admin user management
router.get('/', authenticate, authorize('admin'), userController.getUsers);
router.patch('/:id/status', authenticate, authorize('admin'), userController.updateUserStatus);
router.patch('/:id/verification', authenticate, authorize('admin'), userController.updateUserVerification);

export default router;
