import { Router } from 'express';
import * as controller from '../controllers/project';

const router = Router();

router.post('/', controller.create);
router.get('/', controller.list);
router.put('/:id', controller.update);

export default router;
