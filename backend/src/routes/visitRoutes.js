import { Router } from 'express';
import * as visitController from '../controllers/visitController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { createVisitSchema, updateVisitStatusSchema } from '../validators/visitValidator.js';

const router = Router();

// All visit routes require authentication
router.use(authenticate);

router.get('/my', visitController.getMyVisits);
router.get('/all', authorize('admin'), visitController.getAllVisits);
router.get('/:id', visitController.getVisitById);

router.post('/', validate(createVisitSchema), visitController.createVisit);
router.put('/:id/status', validate(updateVisitStatusSchema), visitController.updateVisitStatus);
router.delete('/:id', visitController.cancelVisit);

export default router;
