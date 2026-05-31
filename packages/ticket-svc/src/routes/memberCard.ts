import { Router } from 'express';
import * as controller from '../controllers/memberCard';

const router = Router();

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.put('/:id/freeze', controller.freeze);
router.put('/:id/activate', controller.activate);

export default router;
