import { Router } from 'express';
import * as controller from '../controllers/ticketGroup';

const router = Router();

router.post('/', controller.create);
router.get('/', controller.list);
router.put('/:id', controller.update);

export default router;
