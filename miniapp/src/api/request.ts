export const API_BASE_URL = 'http://10.70.119.141:3000/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  data?: Record<string, any>;
  params?: Record<string, any>;
  auth?: boolean;
}

export function buildUrl(path: string, params?: Record<string, any>) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalized}`;
  if (!params) return url;

  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `${url}?${query}` : url;
}

export async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = uni.getStorageSync('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: buildUrl(path, options.params),
      method: options.method || 'GET',
      data: options.data,
      header: headers,
      success: (response) => {
        const body = response.data as any;
        if (body?.code === 0) {
          resolve(body.data as T);
          return;
        }

        if (response.statusCode === 401 || body?.code === 401) {
          uni.removeStorageSync('token');
          uni.removeStorageSync('user');
          uni.$emit('auth:expired');
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
        }

        reject(new Error(body?.message || '请求失败'));
      },
      fail: (error) => reject(error),
    });
  });
}


