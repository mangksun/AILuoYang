import { Router } from 'express';
import * as controller from '../controllers/reconciliation';

const router = Router();

router.get('/', controller.list);
router.get('/export', controller.exportData);

export default router;
