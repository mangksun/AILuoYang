import { AxiosResponse } from 'axios';

export function unwrap<T = any>(response: AxiosResponse): T {
  const { code, message, data } = response.data;
  if (code !== 0) {
    throw new Error(message || '服务调用失败');
  }
  return data;
}
