import request from './request';

export function getOrders(params?: any) {
  return request.get('/orders', { params });
}

export function getOrder(id: number) {
  return request.get(`/orders/${id}`);
}

export function createOrder(data: any) {
  return request.post('/orders', data);
}

export function refundOrder(id: number, data: any) {
  return request.post(`/orders/${id}/refund`, data);
}

export function getReconciliation(params?: any) {
  return request.get('/reconciliation', { params });
}
