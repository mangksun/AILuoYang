import { Router } from 'express';
import * as controller from '../controllers/payment';

const router = Router();

router.post('/wechat/callback', controller.wechatCallback);

export default router;
