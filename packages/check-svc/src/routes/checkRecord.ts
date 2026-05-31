import { Router } from 'express';
import * as controller from '../controllers/checkRecord';

const router = Router();

router.get('/', controller.list);

export default router;
