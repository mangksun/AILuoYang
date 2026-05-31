import { Router } from 'express';
import * as controller from '../controllers/user';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, controller.list);
router.put('/:id', authMiddleware, controller.update);

export default router;
