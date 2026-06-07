import request from './request';

export function getAiOverview() {
  return request.get('/ai/admin/overview');
}

export function getAiChatLogs(params?: any) {
  return request.get('/ai/admin/chat-logs', { params });
}

export function getAiFeedback(params?: any) {
  return request.get('/ai/admin/feedback', { params });
}

export function createAiFeedback(data: any) {
  return request.post('/ai/admin/feedback', data);
}

export function getAiInspirations(params?: any) {
  return request.get('/ai/admin/inspirations', { params });
}

export function createAiInspiration(data: any) {
  return request.post('/ai/admin/inspirations', data);
}

export function updateAiInspiration(id: number, data: any) {
  return request.put(`/ai/admin/inspirations/${id}`, data);
}

export function getAiPersona() {
  return request.get('/ai/admin/persona');
}

export function updateAiPersona(data: any) {
  return request.put('/ai/admin/persona', data);
}

export function getAiKnowledge(params?: any) {
  return request.get('/ai/admin/knowledge', { params });
}

export function createAiKnowledge(data: any) {
  return request.post('/ai/admin/knowledge', data);
}

export function updateAiKnowledge(id: number, data: any) {
  return request.put(`/ai/admin/knowledge/${id}`, data);
}
