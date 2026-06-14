import crypto from 'crypto';

export interface WxSession {
  openid: string;
  sessionKey: string;
  unionid?: string;
}

export async function code2Session(code: string): Promise<WxSession> {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    return {
      openid: `mock_${crypto.createHash('sha256').update(code).digest('hex').slice(0, 24)}`,
      sessionKey: 'mock_session_key',
    };
  }

  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

  const resp = await fetch(url);
  const data = await resp.json() as {
    openid?: string;
    session_key?: string;
    unionid?: string;
    errcode?: number;
    errmsg?: string;
  };

  if (data.errcode) {
    throw new Error(`微信登录失败: ${data.errcode} ${data.errmsg}`);
  }

  if (!data.openid || !data.session_key) {
    throw new Error('微信登录失败: 未返回 openid 或 session_key');
  }

  return {
    openid: data.openid,
    sessionKey: data.session_key,
    unionid: data.unionid,
  };
}
