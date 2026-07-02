import { Router } from 'express';
import * as controller from '../controllers/order';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, controller.create);
router.get('/', authMiddleware, controller.list);
router.get('/:id', authMiddleware, controller.getById);
router.post('/:id/pay', authMiddleware, controller.pay);
router.post('/staff-check', authMiddleware, controller.staffCheck);

export default router;
