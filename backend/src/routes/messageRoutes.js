import { Router } from 'express';
import * as messageController from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', messageController.getConversations);
router.post('/open', messageController.openConversation);
router.get('/:id', messageController.getConversation);
router.post('/:id', messageController.sendMessage);
router.patch('/:id/read', messageController.markRead);

export default router;
