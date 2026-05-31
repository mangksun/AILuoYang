import { Router } from 'express';
import * as controller from '../controllers/check';

const router = Router();

router.post('/', controller.check);
router.post('/identity-verify', controller.identityVerify);

export default router;
