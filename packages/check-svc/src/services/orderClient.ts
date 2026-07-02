import axios from 'axios';

const ORDER_SVC_URL = process.env.ORDER_SVC_URL || 'http://localhost:3002';

export async function getOrder(id: number) {
  try {
    const response = await axios.get(`${ORDER_SVC_URL}/api/orders/${id}`);
    return response.data?.data || response.data;
  } catch {
    return null;
  }
}
