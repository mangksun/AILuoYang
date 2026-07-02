import { request } from './request';

export interface MiniappUser {
  id: number;
  openid: string;
  phone?: string;
  nickname?: string;
  avatarUrl?: string;
  role: string;
  status: string;
}

export function login(data: { code: string; nickname?: string; avatarUrl?: string }) {
  return request<{ token: string; user: MiniappUser }>('/miniapp/auth/login', {
    method: 'POST',
    data,
    auth: false,
  });
}

export function getProfile() {
  return request<MiniappUser>('/miniapp/auth/profile');
}

export function updateProfile(data: { nickname?: string; avatarUrl?: string }) {
  return request<MiniappUser>('/miniapp/auth/profile', {
    method: 'PUT',
    data,
  });
}
