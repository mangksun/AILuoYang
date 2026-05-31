import { Router } from 'express';
import * as controller from '../controllers/reconciliation';

const router = Router();

router.get('/', controller.list);

export default router;
