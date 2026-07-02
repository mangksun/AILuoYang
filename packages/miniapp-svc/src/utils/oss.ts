// eslint-disable-next-line @typescript-eslint/no-var-requires
const OSS = require('ali-oss');
import path from 'path';

const client = new OSS({
  endpoint: process.env.OSS_ENDPOINT,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
  bucket: process.env.OSS_BUCKET,
});

/**
 * 上传文件到阿里云 OSS
 * @param buffer   文件内容
 * @param ext      文件扩展名，如 .jpg、.png
 * @param dir      存储目录，如 avatars
 * @returns        文件的公开访问 URL
 */
export async function uploadToOSS(buffer: Buffer, ext: string, dir = 'uploads'): Promise<string> {
  const filename = `${dir}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const result = await client.put(filename, buffer);
  return result.url;
}

/**
 * 从文件名提取扩展名
 */
export function getExt(filename: string): string {
  const ext = path.extname(filename);
  return ext || '.bin';
}
