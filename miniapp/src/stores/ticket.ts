import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as ticketApi from '@/api/ticket';
import type { MiniappOrder, TicketType } from '@/api/ticket';

export const useTicketStore = defineStore('ticket', () => {
  const tickets = ref<TicketType[]>([]);
  const orders = ref<MiniappOrder[]>([]);
  const loading = ref(false);

  async function fetchTickets(params?: Record<string, any>) {
    loading.value = true;
    try {
      const data = await ticketApi.getTickets(params);
      tickets.value = data.list || [];
      return tickets.value;
    } finally {
      loading.value = false;
    }
  }

  async function createTicketOrder(
    ticketTypeId: number,
    quantity = 1,
    extra: { visitDate?: string; visitorCategory?: string; contactName?: string; contactPhone?: string } = {},
  ) {
    const data = await ticketApi.createOrder({ ticketTypeId, quantity, ...extra });
    return data;
  }

  async function fetchOrders() {
    const data = await ticketApi.getOrders({ page: 1, pageSize: 20 });
    orders.value = data.list || [];
    return orders.value;
  }

  return { tickets, orders, loading, fetchTickets, createTicketOrder, fetchOrders };
});
