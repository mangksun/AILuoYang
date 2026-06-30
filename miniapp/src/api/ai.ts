import { buildUrl, request } from './request';

export interface AiAction {
  type: string;
  name?: string;
  longitude?: number;
  latitude?: number;
  amapPoiId?: string;
  mode?: string;
  projectId?: number;
  projectName?: string;
  ticketTypeId?: number;
  ticketName?: string;
  price?: string | number;
  date?: string;
  ticketCount?: number;
}

export interface ChatResponse {
  conversationId: number;
  reply: string;
  intent?: string;
  actions?: AiAction[];
}

export function sendChat(data: { conversationId?: number; message: string; location?: { longitude: number; latitude: number } }) {
  return request<ChatResponse>('/ai/chat', {
    method: 'POST',
    data,
  });
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface TicketBookingCard {
  card_type: 'ticket_booking';
  spot_id?: string | number;
  spot_name: string;
  ticket_type_id?: number;
  ticket_type_name?: string;
  price?: string | number;
  currency?: string;
  date?: string;
  ticket_count?: number;
}

export type ChatStreamPacket =
  | { type: 'text'; content: string }
  | { type: 'card'; data: TicketBookingCard }
  | { type: string; [key: string]: any };

function decodeChunk(data: ArrayBuffer) {
  const GlobalTextDecoder = (globalThis as any).TextDecoder;
  if (GlobalTextDecoder) {
    return new GlobalTextDecoder('utf-8').decode(data);
  }

  const bytes = new Uint8Array(data);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return decodeURIComponent(escape(binary));
}

function parseSseBuffer(buffer: string, onPacket: (packet: ChatStreamPacket) => void) {
  const events = buffer.split(/\n\n/);
  const rest = events.pop() || '';

  for (const event of events) {
    const dataLines = event
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim());

    if (!dataLines.length) continue;

    const data = dataLines.join('\n');
    if (!data || data === '[DONE]') continue;

    onPacket(JSON.parse(data));
  }

  return rest;
}

export function sendChatStream(
  data: { userInput: string; chatHistory: ChatHistoryItem[] },
  handlers: {
    onPacket: (packet: ChatStreamPacket) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
  },
) {
  const token = uni.getStorageSync('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let buffer = '';
  let settled = false;

  const task = uni.request({
    url: buildUrl('/ai/chat/stream'),
    method: 'POST',
    data: {
      user_input: data.userInput,
      chat_history: data.chatHistory,
    },
    header: headers,
    enableChunked: true,
    success: (response: UniApp.RequestSuccessCallbackResult) => {
      if (response.statusCode >= 400) {
        const body = response.data as any;
        handlers.onError?.(new Error(body?.message || 'AI 服务暂时不可用'));
        return;
      }

      if (typeof response.data === 'string') {
        try {
          buffer = parseSseBuffer(buffer + response.data, handlers.onPacket);
        } catch (error: any) {
          handlers.onError?.(new Error(error.message || 'AI 响应解析失败'));
        }
      }
    },
    fail: (error: UniApp.GeneralCallbackResult) => {
      handlers.onError?.(new Error(error.errMsg || 'AI 请求失败'));
    },
    complete: () => {
      if (!settled) {
        settled = true;
        handlers.onComplete?.();
      }
    },
  } as any) as UniApp.RequestTask;

  const chunkTask = task as UniApp.RequestTask & {
    onChunkReceived?: (callback: (response: { data: ArrayBuffer }) => void) => void;
  };

  chunkTask.onChunkReceived?.((response) => {
    try {
      buffer = parseSseBuffer(buffer + decodeChunk(response.data), handlers.onPacket);
    } catch (error: any) {
      handlers.onError?.(new Error(error.message || 'AI 响应解析失败'));
    }
  });

  return task;
}

export interface ItineraryRequest {
  districts: string[];
  startDate?: string;
  endDate?: string;
  peopleCount: number;
  preferences: string[];
  budget?: number;
  days?: number;
}

export interface ItineraryPlan {
  planId?: number;
  summary?: string;
  estimatedCost?: number;
  days: Array<{
    day: number;
    title?: string;
    items: Array<{
      time?: string;
      timeRange?: string;
      projectId?: number;
      projectName?: string;
      spotName?: string;
      durationMinutes?: number;
      ticketPrice?: number;
      reason?: string;
      tips?: string;
    }>;
  }>;
  recommendedTickets?: Array<{
    ticketTypeId: number;
    name: string;
    quantity: number;
    price: string | number;
    total: string | number;
  }>;
}

export interface TravelogueResponse {
  title: string;
  content: string;
  style?: string;
  spots?: string[];
}

export function generateTravelogue(data: { spots: string[]; style?: string; experience?: string }) {
  return request<TravelogueResponse>('/ai/travelogue/generate', {
    method: 'POST',
    data: {
      spots: data.spots || [],
      style: data.style || '口语化',
      experience: data.experience || '',
    },
  });
}

export function generateItinerary(data: ItineraryRequest) {
  const payload: Record<string, any> = {
    districts: data.districts || [],
    peopleCount: data.peopleCount,
    preferences: data.preferences || [],
    days: data.days || 1,
  };
  if (data.startDate) payload.startDate = data.startDate;
  if (data.endDate) payload.endDate = data.endDate;
  if (data.budget !== undefined && data.budget !== null) payload.budget = data.budget;
  return request<ItineraryPlan>('/ai/itinerary/plans', {
    method: 'POST',
    data: payload,
  });
}

export interface ChatLogItem {
  id: number;
  user_input: string;
  ai_reply: string;
  intent: string | null;
  created_at: string;
}

export interface ChatLogPage {
  list: ChatLogItem[];
  total: number;
  page: number;
  pageSize: number;
}

export function getMyChatLogs(page = 1, pageSize = 20) {
  return request<ChatLogPage>('/ai/chat-logs', {
    params: { page, pageSize },
  });
}
