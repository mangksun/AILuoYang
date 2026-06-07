import { Router } from 'express';
import * as controller from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', controller.login);
router.get('/profile', authMiddleware, controller.profile);

export default router;
