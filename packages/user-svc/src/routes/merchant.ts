import { Router } from 'express';
import * as controller from '../controllers/merchant';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, controller.create);
router.get('/', authMiddleware, controller.list);
router.put('/:id/config', authMiddleware, controller.updateConfig);

export default router;
