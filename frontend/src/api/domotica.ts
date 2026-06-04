import {
  requestJson,
} from './client';
import type {
  AtualizarDispositivoInput,
  ConfiguracaoApp,
  ConsumoDispositivo,
  CriarDispositivoInput,
  CriarRegraAlertaInput,
  Dispositivo,
  Division,
  EventoAlerta,
  MapeamentoDivisao,
  RegraAlerta,
  ResumoCasa,
} from '../types/domains';

export const domoticaApi = {
  health: () => requestJson<{ status: string; database: string; devices_file: string; room_mappings_file: string }>('/api/health'),
  rooms: () => requestJson<Division[]>('/api/rooms'),
  projectRooms: () => requestJson<Division[]>('/api/project-rooms'),
  roomMappings: () => requestJson<MapeamentoDivisao[]>('/api/room-mappings'),
  createRoomMapping: (body: MapeamentoDivisao) =>
    requestJson<MapeamentoDivisao>('/api/room-mappings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  devices: () => requestJson<Dispositivo[]>('/api/devices'),
  device: (deviceId: string) => requestJson<Dispositivo>(`/api/devices/${encodeURIComponent(deviceId)}`),
  createDevice: (body: CriarDispositivoInput) =>
    requestJson<Dispositivo>('/api/devices', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateDevice: (deviceId: string, body: AtualizarDispositivoInput) =>
    requestJson<Dispositivo>(`/api/devices/${encodeURIComponent(deviceId)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteDevice: (deviceId: string) =>
    requestJson<{ ok: boolean }>(`/api/devices/${encodeURIComponent(deviceId)}`, {
      method: 'DELETE',
    }),
  toggleDevice: (deviceId: string) =>
    requestJson<Dispositivo>(`/api/devices/${encodeURIComponent(deviceId)}/toggle`, {
      method: 'POST',
    }),
  deviceConsumption: (deviceId: string, hours = 24) =>
    requestJson<ConsumoDispositivo>(
      `/api/devices/${encodeURIComponent(deviceId)}/consumption?hours=${hours}`
    ),

  alertRules: (deviceId?: string) =>
    requestJson<RegraAlerta[]>(
      deviceId ? `/api/alert-rules?device_id=${encodeURIComponent(deviceId)}` : '/api/alert-rules'
    ),
  createAlertRule: (body: CriarRegraAlertaInput) =>
    requestJson<RegraAlerta>('/api/alert-rules', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteAlertRule: (ruleId: string) =>
    requestJson<{ ok: boolean }>(`/api/alert-rules/${encodeURIComponent(ruleId)}`, {
      method: 'DELETE',
    }),

  alerts: () => requestJson<EventoAlerta[]>('/api/alerts'),
  config: () => requestJson<ConfiguracaoApp>('/api/config'),
  updateConfig: (body: ConfiguracaoApp) =>
    requestJson<ConfiguracaoApp>('/api/config', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  summary: () => requestJson<ResumoCasa>('/api/summary'),
};