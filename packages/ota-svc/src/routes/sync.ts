import { Router } from 'express';
import * as controller from '../controllers/sync';

const router = Router();

router.post('/', controller.sync);

export default router;
