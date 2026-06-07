import axios from 'axios';
import { unwrap } from '../utils/unwrap';

const ORDER_SVC_URL = process.env.ORDER_SVC_URL || 'http://localhost:3002';

export async function createOrder(data: any) {
  const response = await axios.post(`${ORDER_SVC_URL}/api/orders`, data);
  return unwrap(response);
}

export async function listOrders(params: any) {
  const response = await axios.get(`${ORDER_SVC_URL}/api/orders`, { params });
  return unwrap(response);
}

export async function getOrder(id: number) {
  const response = await axios.get(`${ORDER_SVC_URL}/api/orders/${id}`);
  return unwrap(response);
}

export async function markPaid(orderId: number, data: any) {
  const response = await axios.post(`${ORDER_SVC_URL}/api/orders/${orderId}/mark-paid`, data);
  return unwrap(response);
}
