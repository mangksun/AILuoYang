import axios from 'axios';
import { unwrap } from '../utils/unwrap';

const TICKET_SVC_URL = process.env.TICKET_SVC_URL || 'http://localhost:3001';

export async function listTicketTypes(params: any) {
  const response = await axios.get(`${TICKET_SVC_URL}/api/ticket-types`, { params });
  return unwrap(response);
}

export async function getTicketType(id: number) {
  const response = await axios.get(`${TICKET_SVC_URL}/api/ticket-types/${id}`);
  return unwrap(response);
}

export async function reserveTicketStock(id: number, quantity: number) {
  const response = await axios.post(`${TICKET_SVC_URL}/api/ticket-types/${id}/reserve-stock`, { quantity });
  return unwrap(response);
}
