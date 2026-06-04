import { request } from './client'

export type RoomMapping = {
  id: string
  vendor: 'tapo' | 'shelly' | 'sonoff' | 'generic'
  vendor_room_name: string
  project_room_id: string
  match_mode: 'auto' | 'manual'
  updated_at: string
}

export type RoomMappingCreate = {
  vendor: 'tapo' | 'shelly' | 'sonoff' | 'generic'
  vendor_room_name: string
  project_room_id: string
  match_mode?: 'auto' | 'manual'
}

export const mappingsApi = {
  list: () => request<RoomMapping[]>('/room-mappings'),
  create: (body: RoomMappingCreate) =>
    request<RoomMapping>('/room-mappings', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id: string) =>
    request<{ ok: boolean }>(`/room-mappings/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}