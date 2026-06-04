export type TipoDispositivo = 'light' | 'blind' | 'outlet' | 'climate' | 'sensor'
export type Fabricante = 'tapo' | 'shelly' | 'sonoff' | 'generic'
export type EstadoMapeamento = 'matched' | 'unmatched' | 'manual'
export type SeccaoAlerta = 'info' | 'warning' | 'critical'

export interface Ponto3D {
  x: number
  y: number
  z: number
}

export interface Dispositivo {
  id: string
  name: string
  type: TipoDispositivo
  vendor: Fabricante
  room_id: string
  state: Record<string, unknown>
  position: Ponto3D
  online: boolean
  created_at: string
  vendor_room_name?: string | null
  project_room_id?: string | null
  mapping_status: EstadoMapeamento
}

export interface CriarDispositivoInput {
  name: string
  type: TipoDispositivo
  vendor: Fabricante
  room_id: string
  state?: Record<string, unknown>
  position?: Ponto3D
  vendor_room_name?: string | null
  project_room_id?: string | null
  mapping_status?: EstadoMapeamento
}

export interface ActualizarDispositivoInput {
  name?: string
  type?: TipoDispositivo
  vendor?: Fabricante
  room_id?: string
  state?: Record<string, unknown>
  position?: Ponto3D
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

export interface MapeamentoDivisao {
  id: string
  vendor: Fabricante
  vendor_room_name: string
  project_room_id: string
  match_mode: 'auto' | 'manual'
  updated_at: string
}

export interface RegraAlerta {
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

export interface CriarRegraAlertaInput {
  device_id: string
  name: string
  metric: string
  operator: string
  threshold: number
  enabled?: boolean
  notify?: boolean
}

export interface EventoAlerta {
  id: string
  device_id: string
  rule_id?: string | null
  title: string
  message: string
  severity: SeccaoAlerta
  acknowledged: boolean
  created_at: string
}

export interface ConfiguracaoApp {
  flask_server_url: string
  flask_api_key: string
  house_name: string
  language: string
  voice_assistant_enabled: boolean
  alexa_enabled: boolean
}

export interface ResumoCasa {
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

export interface PontoConsumo {
  t: string
  power_w: number
}

export interface ConsumoDispositivo {
  device_id: string
  hours: number
  points: PontoConsumo[]
  total_kwh: number
}