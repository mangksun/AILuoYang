import request from './request';

// 票种分组
export function getTicketGroups() {
  return request.get('/ticket-groups');
}

export function createTicketGroup(data: any) {
  return request.post('/ticket-groups', data);
}

export function updateTicketGroup(id: number, data: any) {
  return request.put(`/ticket-groups/${id}`, data);
}

// 票种
export function getTicketTypes(params?: any) {
  return request.get('/ticket-types', { params });
}

export function getTicketType(id: number) {
  return request.get(`/ticket-types/${id}`);
}

export function createTicketType(data: any) {
  return request.post('/ticket-types', data);
}

export function updateTicketType(id: number, data: any) {
  return request.put(`/ticket-types/${id}`, data);
}

export function disableTicketType(id: number) {
  return request.put(`/ticket-types/${id}/disable`);
}

// 项目
export function getProjects(params?: any) {
  return request.get('/projects', { params });
}

export function createProject(data: any) {
  return request.post('/projects', data);
}

export function updateProject(id: number, data: any) {
  return request.put(`/projects/${id}`, data);
}
