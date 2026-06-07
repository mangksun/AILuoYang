import crypto from 'crypto';

export interface WxSession {
  openid: string;
  unionid?: string;
}

export async function code2Session(code: string): Promise<WxSession> {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    return {
      openid: `mock_${crypto.createHash('sha256').update(code).digest('hex').slice(0, 24)}`,
    };
  }

  throw new Error('微信 code2session 尚未配置真实调用');
}
