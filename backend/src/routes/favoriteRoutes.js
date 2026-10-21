import { Router } from 'express';
import * as favoriteController from '../controllers/favoriteController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', favoriteController.getFavorites);
router.post('/toggle', favoriteController.toggleFavorite);

export default router;
