import request from './request';

export function login(username: string, password: string) {
  return request.post('/auth/login', { username, password });
}

export function getUserInfo() {
  return request.get('/users/me');
}
