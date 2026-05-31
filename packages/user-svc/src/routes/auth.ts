import { Router } from 'express';
import * as controller from '../controllers/auth';

const router = Router();

router.post('/login', controller.login);

export default router;
