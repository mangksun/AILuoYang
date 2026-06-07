import { Router } from 'express';
import * as controller from '../controllers/ticketType';

const router = Router();

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.post('/:id/reserve-stock', controller.reserveStock);
router.put('/:id/disable', controller.disable);

export default router;
