import request from './request';

export function getUsers(params?: any) {
  return request.get('/users', { params });
}

export function updateUser(id: number, data: any) {
  return request.put(`/users/${id}`, data);
}

export function getMerchants(params?: any) {
  return request.get('/merchants', { params });
}

export function createMerchant(data: any) {
  return request.post('/merchants', data);
}

export function updateMerchantConfig(id: number, data: any) {
  return request.put(`/merchants/${id}/config`, data);
}

export function getMiniappUsers(params?: any) {
  return request.get('/miniapp/admin/users', { params });
}

export function updateMiniappUser(id: number, data: any) {
  return request.put(`/miniapp/admin/users/${id}`, data);
}
