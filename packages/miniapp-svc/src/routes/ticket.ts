import { Router } from 'express';
import * as controller from '../controllers/ticket';

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);

export default router;
