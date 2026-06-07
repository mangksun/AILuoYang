import { Router } from 'express';
import * as controller from '../controllers/order';

const router = Router();

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/:id/mark-paid', controller.markPaid);
router.post('/:id/refund', controller.refund);

export default router;
