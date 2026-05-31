import request from './request';

export function getCheckRecords(params?: any) {
  return request.get('/check-records', { params });
}

export function getVerifications(params?: any) {
  return request.get('/verifications', { params });
}

export function submitCheck(data: any) {
  return request.post('/check', data);
}
