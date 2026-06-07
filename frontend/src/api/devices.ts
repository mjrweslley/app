import { request } from './client'

export type Device = {
  id: string
  name: string
  type: 'light' | 'blind' | 'outlet' | 'climate' | 'sensor'
  vendor: 'tapo' | 'shelly' | 'sonoff' | 'generic'
  room_id: string
  state: Record<string, any>
  position: { x: number; y: number; z: number }
  online: boolean
  created_at: string
  vendor_room_name?: string | null
  project_room_id?: string | null
  mapping_status?: 'matched' | 'unmatched' | 'manual'
}

export type DeviceCreate = {
  ip: string
  name?: string | null
  type?: 'light' | 'blind' | 'outlet' | 'climate' | 'sensor'
  vendor?: 'tapo' | 'shelly' | 'sonoff' | 'generic'
  room_id?: string | null
  state?: Record<string, any> | null
  position?: { x: number; y: number; z: number } | null
  vendor_room_name?: string | null
  project_room_id?: string | null
  mapping_status?: 'matched' | 'unmatched' | 'manual'
}

export type DevicePatch = Partial<Omit<Device, 'id' | 'created_at'>>

export type Summary = {
  rooms_count: number
  devices_count: number
  mapped_devices_count: number
  unmapped_devices_count: number
  online_count: number
  lights_on: number
  total_power_w: number
  avg_temperature_c: number | null
  alerts_unacked: number
}

export type ConsumptionPoint = { t: string; power_w: number }
export type ConsumptionResponse = { device_id: string; hours: number; points: ConsumptionPoint[]; total_kwh: number }

// Tipo para histórico de gráfico (igual ao plug.html antigo)
export type HistoryResponse = {
  labels: string[]
  data: number[]
}

export type AlertRule = {
  id: string
  device_id: string
  name: string
  metric: string
  operator: string
  threshold: number
  enabled: boolean
  notify: boolean
  created_at: string
}

export type AlertEvent = {
  id: string
  device_id: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  acknowledged: boolean
  created_at: string
}

export type AlertRuleCreate = {
  device_id: string
  name: string
  metric: string
  operator: string
  threshold: number
  enabled?: boolean
  notify?: boolean
}

export const devicesApi = {
  // ── LEITURAS ──
  list: () => request<Device[]>('/devices'),
  summary: () => request<Summary>('/summary'),
  get: (id: string) => request<Device>(`/devices/${encodeURIComponent(id)}`),
  
  // ── HISTÓRICO PARA GRÁFICO (compatível com plug.html) ──
  // viewType: 'H' = horário, 'D' = diário, 'W' = semanal, 'M' = mensal
  history: (id: string, viewType: 'H' | 'D' | 'W' | 'M') =>
    request<HistoryResponse>(`/devices/${encodeURIComponent(id)}/history/${viewType}`),

  // ── AÇÕES DE CONTROLO E GESTÃO ──
  create: (body: DeviceCreate) => 
    request<Device>('/devices', { method: 'POST', body: JSON.stringify(body) }),
  
  update: (id: string, body: DevicePatch) => 
    request<Device>(`/devices/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  
  delete: (id: string) => 
    request<{ ok: boolean }>(`/devices/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  
  toggle: (id: string) => 
    request<Device>(`/devices/${encodeURIComponent(id)}/toggle`, { method: 'POST' }),

  // ── OUTROS ──
  consumption: (id: string, hours = 24) =>
    request<ConsumptionResponse>(`/devices/${encodeURIComponent(id)}/consumption?hours=${hours}`),
  
  alertRules: (id?: string) =>
    request<AlertRule[]>(`/alert-rules${id ? `?device_id=${encodeURIComponent(id)}` : ''}`),
  
  createAlertRule: (body: AlertRuleCreate) =>
    request<AlertRule>('/alert-rules', { method: 'POST', body: JSON.stringify(body) }),
  
  deleteAlertRule: (id: string) =>
    request<{ ok: boolean }>(`/alert-rules/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  
  alerts: () => request<AlertEvent[]>('/alerts'),
  
  ackAlert: (id: string) =>
    request<{ ok: boolean }>(`/alerts/${encodeURIComponent(id)}/ack`, { method: 'POST' }),

  updateState: (id: string, state: { on: boolean }) => 
    request<{ ok: boolean }>(`/devices/${encodeURIComponent(id)}/state`, { 
      method: 'PATCH',
      body: JSON.stringify(state)
    }),
}
