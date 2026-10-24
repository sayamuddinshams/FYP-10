import { Router } from 'express';
import * as propertyController from '../controllers/propertyController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { createPropertySchema, updatePropertySchema } from '../validators/propertyValidator.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, propertyController.getProperties);
router.get('/featured', propertyController.getFeatured);
router.get('/stats', propertyController.getStats);
router.get('/my', authenticate, authorize('owner', 'admin'), propertyController.getMyProperties);
router.get('/:id', optionalAuth, propertyController.getPropertyById);
router.get('/:id/related', propertyController.getRelated);
router.post('/:id/view', propertyController.recordView);

// Protected routes (Owner / Admin)
router.post(
  '/',
  authenticate,
  authorize('owner', 'admin'),
  validate(createPropertySchema),
  propertyController.createProperty
);

router.put(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  validate(updatePropertySchema),
  propertyController.updateProperty
);

router.patch(
  '/:id/toggle-pause',
  authenticate,
  authorize('owner', 'admin'),
  propertyController.togglePause
);

router.delete(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  propertyController.deleteProperty
);

export default router;
