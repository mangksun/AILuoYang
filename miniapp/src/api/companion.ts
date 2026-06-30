import { request } from './request'

export interface CompanionChatParams {
  message: string
  latitude: number
  longitude: number
  chat_history?: Array<{ role: string; content: string }>
  nearbyPOI?: {
    foods: Array<{ name: string; address: string; distance: string; type: string }>
    spots: Array<{ name: string; address: string; distance: string; type: string }>
    hotels: Array<{ name: string; address: string; distance: string; type: string }>
    shopping: Array<{ name: string; address: string; distance: string; type: string }>
  }
}

export interface CompanionChatResult {
  reply: string
  chatLogId: number | null
  nearby: {
    attractions: NearbyPOI[]
    foods: NearbyPOI[]
  }
}

export interface NearbyPOI {
  id: string
  name: string
  category: string
  description: string
  address: string
  phone?: string
  businessHours?: string
  images?: string[]
  latitude: number
  longitude: number
  distance: number
}

export interface NearbyParams {
  type: 'attraction' | 'food' | 'rest' | 'shopping'
  latitude: number
  longitude: number
  radius?: number
  limit?: number
}

export interface NearbyResult {
  list: NearbyPOI[]
  total: number
  type: string
}

// 伴游对话
export function companionChat(data: CompanionChatParams) {
  return request<CompanionChatResult>('/ai/companion/chat', {
    method: 'POST',
    data,
  })
}

// 查询附近POI
export function getNearbyPOI(params: NearbyParams) {
  return request<NearbyResult>('/ai/companion/nearby', {
    method: 'GET',
    params,
  })
}

// 逆地理编码
export function reverseGeocode(params: { latitude: number; longitude: number }) {
  return request<{ address: string; district: string; province: string; city: string }>(
    '/ai/companion/reverse-geocode',
    { method: 'GET', params }
  )
}
