import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { uploadMiddleware, uploadImage } from '../controllers/upload';

const router = Router();

router.post('/', authMiddleware, uploadMiddleware, uploadImage);

export default router;
