import request from './request';

// 会员卡类型
export function getMemberCardTypes(params?: any) {
  return request.get('/member-card-types', { params });
}

export function createMemberCardType(data: any) {
  return request.post('/member-card-types', data);
}

export function updateMemberCardType(id: number, data: any) {
  return request.put(`/member-card-types/${id}`, data);
}

// 会员卡
export function getMemberCards(params?: any) {
  return request.get('/member-cards', { params });
}

export function getMemberCard(id: number) {
  return request.get(`/member-cards/${id}`);
}

export function createMemberCard(data: any) {
  return request.post('/member-cards', data);
}

export function freezeMemberCard(id: number) {
  return request.put(`/member-cards/${id}/freeze`);
}

export function activateMemberCard(id: number) {
  return request.put(`/member-cards/${id}/activate`);
}
