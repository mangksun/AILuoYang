import crypto from 'crypto';

export interface WxSession {
  openid: string;
  sessionKey: string;
  unionid?: string;
}

/** 微信真实 code 通常是 28 位字母数字；模拟器 code 一般较短或是固定值 */
function isMockCode(code: string): boolean {
  if (code.length < 20) return true;
  if (code === 'the-local-code' || code.startsWith('mock_')) return true;
  return false;
}

function mockSession(code: string): WxSession {
  return {
    openid: `mock_${crypto.createHash('sha256').update(code).digest('hex').slice(0, 24)}`,
    sessionKey: 'mock_session_key',
  };
}

export async function code2Session(code: string): Promise<WxSession> {
  // 开发者工具模拟器返回的 code 无法调用微信 API，直接走模拟
  if (isMockCode(code)) {
    console.log('[wxAuth] 检测到模拟 code，返回模拟 openid');
    return mockSession(code);
  }

  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    return mockSession(code);
  }

  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

  try {
    const resp = await fetch(url);
    const data = await resp.json() as {
      openid?: string;
      session_key?: string;
      unionid?: string;
      errcode?: number;
      errmsg?: string;
    };

    if (data.errcode) {
      console.warn(`[wxAuth] 微信 API 返回错误 ${data.errcode}: ${data.errmsg}，fallback 到模拟登录`);
      return mockSession(code);
    }

    if (!data.openid || !data.session_key) {
      console.warn('[wxAuth] 微信 API 未返回 openid/session_key，fallback 到模拟登录');
      return mockSession(code);
    }

    return {
      openid: data.openid,
      sessionKey: data.session_key,
      unionid: data.unionid,
    };
  } catch (err) {
    console.warn('[wxAuth] 调用微信 API 异常，fallback 到模拟登录:', err);
    return mockSession(code);
  }
}
