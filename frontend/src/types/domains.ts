export type DeviceType = 'light' | 'blind' | 'outlet' | 'climate' | 'sensor'
export type Vendor = 'tapo' | 'shelly' | 'sonoff' | 'generic'
export type EstadoMapeamento = 'matched' | 'unmatched' | 'manual'
export type AlertsSection = 'info' | 'warning' | 'critical'

export interface _3DPoint {
  x: number
  y: number
  z: number
}

export interface Device {
  id: string
  name: string
  type: DeviceType
  vendor: Vendor
  room_id: string
  state: Record<string, unknown>
  position: _3DPoint
  online: boolean
  created_at: string
  vendor_room_name?: string | null
  project_room_id?: string | null
  mapping_status: EstadoMapeamento
}

export interface CreateDeviceInput {
  name: string
  type: DeviceType
  vendor: Vendor
  room_id: string
  state?: Record<string, unknown>
  position?: _3DPoint
  vendor_room_name?: string | null
  project_room_id?: string | null
  mapping_status?: EstadoMapeamento
}

export interface UpdateDeviceInput {
  name?: string
  type?: DeviceType
  vendor?: Vendor
  room_id?: string
  state?: Record<string, unknown>
  position?: _3DPoint
  online?: boolean
  vendor_room_name?: string | null
  project_room_id?: string | null
  mapping_status?: EstadoMapeamento
}

export interface Division {
  id: string
  name: string
  x: number
  y: number
  width: number
  depth: number
  height: number
  color: string
}

export interface RoomMapping {
  id: string
  vendor: Vendor
  vendor_room_name: string
  project_room_id: string
  match_mode: 'auto' | 'manual'
  updated_at: string
}

export interface AlertRule {
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

export interface CreateAlertRuleInput {
  device_id: string
  name: string
  metric: string
  operator: string
  threshold: number
  enabled?: boolean
  notify?: boolean
}

export interface AlertEvent {
  id: string
  device_id: string
  rule_id?: string | null
  title: string
  message: string
  severity: AlertsSection
  acknowledged: boolean
  created_at: string
}

export interface AppSettings {
  flask_server_url: string
  flask_api_key: string
  house_name: string
  language: string
  voice_assistant_enabled: boolean
  alexa_enabled: boolean
}

export interface HouseSummary {
  rooms_count: number
  devices_count: number
  mapped_devices_count: number
  unmapped_devices_count: number
  online_count: number
  lights_on: number
  total_power_w: number
  avg_temperature_c?: number | null
  alerts_unacked: number
}

export interface ComsuptionPoint {
  t: string
  power_w: number
}

export interface DeviceComsuption {
  device_id: string
  hours: number
  points: ComsuptionPoint[]
  total_kwh: number
}