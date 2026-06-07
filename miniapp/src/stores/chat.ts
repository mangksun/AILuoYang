import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as aiApi from '@/api/ai';
import type { AiAction, ChatHistoryItem, TicketBookingCard } from '@/api/ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: AiAction[];
}

export const useChatStore = defineStore('chat', () => {
  const conversationId = ref<number>();
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);

  function buildChatHistory(): ChatHistoryItem[] {
    return messages.value
      .filter((message) => message.content.trim())
      .slice(-20)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));
  }

  function toTicketAction(card: TicketBookingCard): AiAction {
    return {
      type: 'show_ticket',
      ticketTypeId: card.ticket_type_id,
      ticketName: card.ticket_type_name || card.spot_name,
      price: card.price,
      date: card.date,
      ticketCount: card.ticket_count || 1,
    };
  }

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading.value) return null;

    const chatHistory = buildChatHistory();
    const assistantMessage: ChatMessage = {
      id: `${Date.now()}_a`,
      role: 'assistant',
      content: '',
      actions: [],
    };

    messages.value.push({ id: `${Date.now()}_u`, role: 'user', content: trimmed });
    messages.value.push(assistantMessage);
    loading.value = true;

    return new Promise<{ reply: string; actions: AiAction[] }>((resolve, reject) => {
      let completed = false;

      function finish() {
        if (completed) return;
        completed = true;
        loading.value = false;

        if (!assistantMessage.content && !assistantMessage.actions?.length) {
          assistantMessage.content = '我刚刚没有收到有效回复，请稍后再试。';
        }

        resolve({
          reply: assistantMessage.content,
          actions: assistantMessage.actions || [],
        });
      }

      aiApi.sendChatStream(
        {
          userInput: trimmed,
          chatHistory,
        },
        {
          onPacket: (packet) => {
            if (packet.type === 'text' && typeof packet.content === 'string') {
              assistantMessage.content += packet.content;
              return;
            }

            if (packet.type === 'card' && packet.data?.card_type === 'ticket_booking') {
              assistantMessage.actions = [...(assistantMessage.actions || []), toTicketAction(packet.data)];
              if (!assistantMessage.content) {
                assistantMessage.content = `已为你找到${packet.data.ticket_type_name || packet.data.spot_name}，可以继续查看并下单。`;
              }
            }
          },
          onError: (error) => {
            completed = true;
            loading.value = false;
            assistantMessage.content = assistantMessage.content || 'AI 服务暂时不可用，请稍后再试。';
            reject(error);
          },
          onComplete: finish,
        },
      );
    });
  }

  function appendGuide(text: string) {
    return send(text);
  }

  return { conversationId, messages, loading, send, appendGuide };
});
