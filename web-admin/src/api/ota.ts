import request from './request';

// OTA渠道
export function getOtaChannels(params?: any) {
  return request.get('/ota/channels', { params });
}

export function createOtaChannel(data: any) {
  return request.post('/ota/channels', data);
}

// 产品映射
export function getOtaMappings(params?: any) {
  return request.get('/ota/mappings', { params });
}

export function createOtaMapping(data: any) {
  return request.post('/ota/mappings', data);
}

// OTA核销
export function verifyOtaCode(data: any) {
  return request.post('/ota/verify', data);
}

// OTA对账
export function getOtaReconciliation(params?: any) {
  return request.get('/ota/reconciliation', { params });
}

// 手动同步
export function syncOtaStatus(data: any) {
  return request.post('/ota/sync', data);
}
