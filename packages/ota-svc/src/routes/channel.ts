import { Router } from 'express';
import * as controller from '../controllers/channel';

const router = Router();

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);

export default router;
