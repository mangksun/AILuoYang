import axios from 'axios';
import { unwrap } from '../utils/unwrap';

const CHECK_SVC_URL = process.env.CHECK_SVC_URL || 'http://localhost:3004';

export async function createVerification(data: { orderId: number }) {
  const response = await axios.post(`${CHECK_SVC_URL}/api/verifications`, data);
  return unwrap(response);
}

export async function listVerifications(params: any) {
  const response = await axios.get(`${CHECK_SVC_URL}/api/verifications`, { params });
  return unwrap(response);
}
