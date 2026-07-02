import { request } from './request';

export interface TicketType {
  id: number;
  groupId: number;
  name: string;
  price: string | number;
  validDays: number;
  usableDays: number;
  totalUses: number;
  gateUses: number;
  projectLimits: Array<{ projectId: number; maxUses: number }>;
  status: string;
  expireDate?: string;
  purchaseLimit?: number;
  needReservation: boolean;
  needApproval: boolean;
  totalStock?: number | null;
  soldStock?: number;
  description?: string;
  group?: { id: number; name: string; sortOrder: number; status: string };
}

export interface MiniappOrder {
  id: number;
  orderNo: string;
  userId: number;
  ticketTypeId: number;
  quantity: number;
  visitDate?: string;
  visitorCategory?: string;
  contactName?: string;
  contactPhone?: string;
  totalAmount: string | number;
  payAmount: string | number;
  payMethod: string;
  payStatus: string;
  channel: string;
  status: string;
  verification?: { status: string } | null;
  qrcodePayload?: Record<string, any>;
}

export function getTickets(params?: Record<string, any>) {
  return request<{ list: TicketType[]; total?: number; page?: number; pageSize?: number }>('/miniapp/tickets', { params });
}

export function getTicket(id: number) {
  return request<TicketType>(`/miniapp/tickets/${id}`);
}

export function createOrder(data: { ticketTypeId: number; quantity: number; visitDate?: string; visitorCategory?: string; contactName?: string; contactPhone?: string }) {
  return request<{ order: MiniappOrder; payment: Record<string, string> }>('/miniapp/orders', {
    method: 'POST',
    data,
  });
}

export function getOrders(params?: Record<string, any>) {
  return request<{ list: MiniappOrder[]; total: number; page: number; pageSize: number }>('/miniapp/orders', { params });
}

export function getOrder(id: number) {
  return request<MiniappOrder>(`/miniapp/orders/${id}`);
}

export function payOrder(id: number) {
  return request<MiniappOrder>(`/miniapp/orders/${id}/pay`, { method: 'POST' });
}

export function staffCheck(data: { orderId: number; checkType?: string }) {
  return request<any>('/miniapp/orders/staff-check', { method: 'POST', data });
}
