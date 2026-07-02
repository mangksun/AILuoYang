import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadToOSS, getExt } from '../utils/oss';

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上传图片文件'));
    }
  },
}).single('file');

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ code: 400, message: '请选择要上传的文件', data: null });
      return;
    }

    const dir = (req.body.dir as string) || 'uploads';
    const ext = getExt(file.originalname);
    const url = await uploadToOSS(file.buffer, ext, dir);

    res.json({ code: 0, message: '上传成功', data: { url } });
  } catch (err) {
    next(err);
  }
}
