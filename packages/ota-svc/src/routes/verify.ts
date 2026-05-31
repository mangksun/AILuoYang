import { Router } from 'express';
import * as controller from '../controllers/verify';

const router = Router();

router.post('/', controller.verify);

export default router;
