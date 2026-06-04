# Frontend Audit Report\n\n\n\n## src/app/_layout.tsx\n\nimport { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
\n\n## src/app/index.tsx\n\nimport React, { useMemo, useState } from 'react'
import { SafeAreaView, ScrollView, Text, View, Pressable, useWindowDimensions } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { devicesApi, type Device } from '../api/devices'
import { mappingsApi } from '../api/mappings'
import { type ProjectRoom } from '../api/rooms'
import { useSmarthomeData } from '../hooks/useSmarthomeData'
import { colors } from '../theme/colors'
import { GlassCard } from '../components/GlassCard'
import { QuickStatsBar } from '../components/QuickStatsBar'
import { SvgHouseMap } from '../components/SvgHouseMap'
import { UnassignedDevicesPanel } from '../components/UnassignedDevicesPanel'
import { RoomMapperSheet } from '../components/RoomMapperSheet'
import { DeviceDetailSheet } from '../components/DeviceDetailSheet'

export default function HomeScreen() {
  const queryClient = useQueryClient()
  const { width } = useWindowDimensions()
  const { rooms, devices, summary } = useSmarthomeData()
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<ProjectRoom | null>(null)
  const [mapperOpen, setMapperOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const roomList = rooms.data ?? []
  const deviceList = devices.data ?? []
  const summaryData = summary.data
  const mappedCount = summaryData?.mapped_devices_count ?? 0
  const unmappedCount = summaryData?.unmapped_devices_count ?? 0
  const isTablet = width >= 900
  const projectRoomOptions = useMemo(() => roomList, [roomList])

  const consumptionQuery = useQuery({
    queryKey: ['device-consumption', selectedDevice?.id],
    queryFn: () => devicesApi.consumption(selectedDevice!.id, 24),
    enabled: !!selectedDevice?.id && detailOpen,
  })
  const rulesQuery = useQuery({
    queryKey: ['alert-rules', selectedDevice?.id],
    queryFn: () => devicesApi.alertRules(selectedDevice!.id),
    enabled: !!selectedDevice?.id && detailOpen,
  })

  async function mapDeviceToRoom(device: Device, room: ProjectRoom) {
    await mappingsApi.create({ vendor: device.vendor, vendor_room_name: device.vendor_room_name ?? device.room_id, project_room_id: room.id, match_mode: 'manual' })
    await queryClient.invalidateQueries({ queryKey: ['room-mappings'] })
    await queryClient.invalidateQueries({ queryKey: ['devices'] })
    await queryClient.invalidateQueries({ queryKey: ['summary'] })
    setSelectedDevice(null)
    setMapperOpen(false)
  }

  async function createRule() {
    if (!selectedDevice) return
    await devicesApi.createAlertRule({ device_id: selectedDevice.id, name: `Regra ${selectedDevice.name}`, metric: 'power', operator: '>', threshold: 1200, enabled: true, notify: true })
    await queryClient.invalidateQueries({ queryKey: ['alert-rules', selectedDevice.id] })
  }

  async function deleteRule(id: string) {
    await devicesApi.deleteAlertRule(id)
    if (selectedDevice?.id) await queryClient.invalidateQueries({ queryKey: ['alert-rules', selectedDevice.id] })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        <GlassCard style={{ padding: 18, marginBottom: 14 }}>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>SmartHome</Text>
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>Ambiente escuro, calmo e pronto para 24/7.</Text>
          <View style={{ marginTop: 14 }}>
            <QuickStatsBar mapped={mappedCount} unmapped={unmappedCount} online={summaryData?.online_count ?? 0} watts={summaryData?.total_power_w ?? 0} />
          </View>
        </GlassCard>

        <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 16 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <SvgHouseMap rooms={roomList} devices={deviceList} onPressRoom={setSelectedRoom} onPressDevice={(device) => { setSelectedDevice(device); setMapperOpen(true); setDetailOpen(true) }} />
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <UnassignedDevicesPanel devices={deviceList} onMapDevice={(device) => { setSelectedDevice(device); setMapperOpen(true); setDetailOpen(true) }} />

            {selectedDevice && (
              <GlassCard style={{ marginTop: 16, padding: 16 }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{selectedDevice.name}</Text>
                <Text style={{ color: colors.textMuted, marginTop: 4 }}>Vendor room: {selectedDevice.vendor_room_name ?? '—'}</Text>
                <Text style={{ color: colors.textMuted, marginTop: 2 }}>Project room: {selectedDevice.project_room_id ?? '—'}</Text>
                <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {projectRoomOptions.map((room) => (
                    <Pressable key={room.id} onPress={() => mapDeviceToRoom(selectedDevice, room)} style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border }}>
                      <Text style={{ color: colors.text }}>{room.name}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={() => setDetailOpen(true)} style={{ marginTop: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '700' }}>Abrir detalhes</Text>
                </Pressable>
              </GlassCard>
            )}

            {selectedRoom && (
              <GlassCard style={{ marginTop: 16, padding: 16 }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{selectedRoom.name}</Text>
                <Text style={{ color: colors.textMuted, marginTop: 4 }}>Room do projecto seleccionada.</Text>
              </GlassCard>
            )}
          </View>
        </View>
      </ScrollView>

      <RoomMapperSheet visible={mapperOpen} device={selectedDevice} rooms={roomList} onClose={() => setMapperOpen(false)} onPickRoom={(room) => selectedDevice && mapDeviceToRoom(selectedDevice, room)} />
      <DeviceDetailSheet visible={detailOpen} device={selectedDevice} consumption={consumptionQuery.data ?? null} rules={rulesQuery.data ?? []} onClose={() => setDetailOpen(false)} onCreateRule={createRule} onDeleteRule={deleteRule} />
    </SafeAreaView>
  )
}
\n\n## src/api/client.ts\n\nconst API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8081/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export { API_BASE_URL, request }
\n\n## src/api.ts\n\nconst BASE = process.env.EXPO_PUBLIC_API_BASE_URL || "";

export type DeviceType = "light" | "blind" | "outlet" | "climate" | "sensor";
export type Vendor = "tapo" | "shelly" | "sonoff" | "generic";
export type RuleOperator = ">" | "<" | "=" | ">=" | "<=" | "!=";

export type Position3D = { x: number; y: number; z: number };

export type DeviceState = Record<string, any>;

export type Device = {
  id: string;
  name: string;
  type: DeviceType;
  vendor: Vendor;
  room_id: string;
  state: DeviceState;
  position: Position3D;
  online: boolean;
  created_at: string;
};

export type Room = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  color: string;
};

export type AlertRule = {
  id: string;
  device_id: string;
  name: string;
  metric: string;
  operator: RuleOperator;
  threshold: number;
  enabled: boolean;
  notify: boolean;
  created_at: string;
};

export type AlertEvent = {
  id: string;
  device_id: string;
  rule_id?: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  acknowledged: boolean;
  created_at: string;
};

export type AppConfig = {
  flask_server_url: string;
  flask_api_key: string;
  house_name: string;
  language: string;
  voice_assistant_enabled: boolean;
  alexa_enabled: boolean;
};

export type Summary = {
  rooms_count: number;
  devices_count: number;
  online_count: number;
  lights_on: number;
  total_power_w: number;
  avg_temperature_c: number | null;
  alerts_unacked: number;
};

export type ConsumptionPoint = {
  t: string;
  power_w: number;
};

export type ConsumptionResponse = {
  device_id: string;
  hours: number;
  points: ConsumptionPoint[];
  total_kwh: number;
};

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  listRooms: () => request<Room[]>("/rooms"),

  listDevices: () => request<Device[]>("/devices"),
  getDevice: (id: string) => request<Device>(`/devices/${id}`),
  toggleDevice: (id: string) =>
    request<Device>(`/devices/${id}/toggle`, { method: "POST" }),
  updateDevice: (id: string, body: Partial<Device>) =>
    request<Device>(`/devices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  createDevice: (body: {
    name: string;
    type: DeviceType;
    vendor: Vendor;
    room_id: string;
    state?: DeviceState;
    position?: Position3D;
  }) =>
    request<Device>("/devices", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteDevice: (id: string) =>
    request<{ ok: boolean }>(`/devices/${id}`, { method: "DELETE" }),

  consumption: (id: string, hours = 24) =>
    request<ConsumptionResponse>(`/devices/${id}/consumption?hours=${hours}`),

  listAlertRules: (deviceId?: string) =>
    request<AlertRule[]>(
      `/alert-rules${deviceId ? `?device_id=${deviceId}` : ""}`
    ),
  createAlertRule: (body: Omit<AlertRule, "id" | "created_at">) =>
    request<AlertRule>("/alert-rules", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteAlertRule: (id: string) =>
    request<{ ok: boolean }>(`/alert-rules/${id}`, { method: "DELETE" }),

  listAlerts: () => request<AlertEvent[]>("/alerts"),

  getConfig: () => request<AppConfig>("/config"),
  updateConfig: (body: AppConfig) =>
    request<AppConfig>("/config", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  summary: () => request<Summary>("/summary"),
};\n\n## src/api/devices.ts\n\nimport { request } from './client'
export type Device = { id: string; name: string; type: 'light' | 'blind' | 'outlet' | 'climate' | 'sensor'; vendor: 'tapo' | 'shelly' | 'sonoff' | 'generic'; room_id: string; state: Record<string, any>; position: { x: number; y: number; z: number }; online: boolean; created_at: string; vendor_room_name?: string | null; project_room_id?: string | null; mapping_status?: 'matched' | 'unmatched' | 'manual' }
export type Summary = { rooms_count: number; devices_count: number; mapped_devices_count: number; unmapped_devices_count: number; online_count: number; lights_on: number; total_power_w: number; avg_temperature_c: number | null; alerts_unacked: number }
export type ConsumptionPoint = { t: string; power_w: number }
export type ConsumptionResponse = { device_id: string; hours: number; points: ConsumptionPoint[]; total_kwh: number }
export type AlertRule = { id: string; device_id: string; name: string; metric: string; operator: string; threshold: number; enabled: boolean; notify: boolean; created_at: string }
export type AlertEvent = { id: string; device_id: string; severity: 'info' | 'warning' | 'critical'; title: string; body: string; acked: boolean; created_at: string }
export type AlertRuleCreate = { device_id: string; name: string; metric: string; operator: string; threshold: number; enabled?: boolean; notify?: boolean }
export const devicesApi = {
  list: () => request<Device[]>('/devices'),
  summary: () => request<Summary>('/summary'),
  get: (id: string) => request<Device>(`/devices/${encodeURIComponent(id)}`),
  consumption: (id: string, hours = 24) => request<ConsumptionResponse>(`/devices/${encodeURIComponent(id)}/consumption?hours=${hours}`),
  alertRules: (id: string) => request<AlertRule[]>(`/alert-rules?device_id=${encodeURIComponent(id)}`),
  createAlertRule: (body: AlertRuleCreate) => request<AlertRule>('/alert-rules', { method: 'POST', body: JSON.stringify(body) }),
  deleteAlertRule: (id: string) => request<{ ok: boolean }>(`/alert-rules/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  alerts: () => request<AlertEvent[]>('/alerts'),
  ackAlert: (id: string) => request<{ ok: boolean }>(`/alerts/${encodeURIComponent(id)}/ack`, { method: 'POST' }),
}
\n\n## src/api/mappings.ts\n\nimport { request } from './client'
export type RoomMapping = { id: string; vendor: 'tapo' | 'shelly' | 'sonoff' | 'generic'; vendor_room_name: string; project_room_id: string; match_mode: 'auto' | 'manual'; updated_at: string }
export type RoomMappingCreate = { vendor: 'tapo' | 'shelly' | 'sonoff' | 'generic'; vendor_room_name: string; project_room_id: string; match_mode?: 'auto' | 'manual' }
export const mappingsApi = {
  list: () => request<RoomMapping[]>('/room-mappings'),
  create: (body: RoomMappingCreate) => request<RoomMapping>('/room-mappings', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id: string) => request<{ ok: boolean }>(`/room-mappings/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
\n\n## src/api/rooms.ts\n\nimport { request } from './client'
export type ProjectRoom = { id: string; name: string; x?: number; y?: number; width?: number; depth?: number; height?: number; color?: string }
export const roomsApi = { list: () => request<ProjectRoom[]>('/project-rooms') }
\n\n## src/hooks/useSmarthomeData.ts\n\nimport { useQuery } from '@tanstack/react-query'
import { devicesApi } from '../api/devices'
import { mappingsApi } from '../api/mappings'
import { roomsApi } from '../api/rooms'
export function useSmarthomeData() {
  const rooms = useQuery({ queryKey: ['project-rooms'], queryFn: roomsApi.list })
  const devices = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list })
  const summary = useQuery({ queryKey: ['summary'], queryFn: devicesApi.summary })
  const mappings = useQuery({ queryKey: ['room-mappings'], queryFn: mappingsApi.list })
  return { rooms, devices, summary, mappings }
}
\n\n## src/hooks/useDashboardQueries.ts\n\nimport { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, Device, Summary } from '../api';

export function useSummaryQuery() {
  return useQuery<Summary>({
    queryKey: ['summary'],
    queryFn: api.summary,
    refetchInterval: 10000,
  });
}

export function useDevicesQuery() {
  return useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: api.listDevices,
    refetchInterval: 5000,
  });
}

export function useToggleDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => api.toggleDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });
}
\n\n## src/stores/useDashboardStore.ts\n\nimport { create } from 'zustand';

type DashboardViewMode = 'house-3d' | 'room-focus' | 'device-panel';

type DashboardState = {
  selectedDeviceId: string | null;
  selectedRoomId: string | null;
  viewMode: DashboardViewMode;
  setSelectedDeviceId: (id: string | null) => void;
  setSelectedRoomId: (id: string | null) => void;
  setViewMode: (mode: DashboardViewMode) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedDeviceId: null,
  selectedRoomId: null,
  viewMode: 'house-3d',
  setSelectedDeviceId: (id) => set({ selectedDeviceId: id }),
  setSelectedRoomId: (id) => set({ selectedRoomId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
\n\n## src/components/SvgHouseMap.tsx\n\nimport React from 'react'
import { Pressable, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { Device } from '../api/devices'
import type { ProjectRoom } from '../api/rooms'
export function SvgHouseMap({ rooms, devices, onPressRoom, onPressDevice }: { rooms: ProjectRoom[]; devices: Device[]; onPressRoom: (room: ProjectRoom) => void; onPressDevice: (device: Device) => void }) {
  return <View style={{ borderRadius: 28, padding: 16, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 10 }}>Mapa da casa</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{rooms.map((room) => { const roomDevices = devices.filter((d) => d.project_room_id === room.id); const active = roomDevices.some((d) => d.type === 'light' ? d.state?.on : false); return <Pressable key={room.id} onPress={() => onPressRoom(room)} style={{ width: 170, minHeight: 112, borderRadius: 22, padding: 14, backgroundColor: room.color ?? colors.cardAlt, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}><Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{room.name}</Text><Text style={{ color: 'rgba(255,255,255,0.78)', marginTop: 6 }}>{roomDevices.length} dispositivos</Text><Text style={{ color: active ? '#86efac' : 'rgba(255,255,255,0.55)', marginTop: 6 }}>{active ? 'Ambiente activo' : 'Ambiente calmo'}</Text>{roomDevices.slice(0, 2).map((device) => <Pressable key={device.id} onPress={() => onPressDevice(device)} style={{ marginTop: 6 }}><Text numberOfLines={1} style={{ color: '#fff', fontSize: 12 }}>{device.name}</Text></Pressable>)}</Pressable> })}</View></View>
}
\n\n## src/components/RoomMapperSheet.tsx\n\nimport React from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { Device } from '../api/devices'
import type { ProjectRoom } from '../api/rooms'
export function RoomMapperSheet({ visible, device, rooms, onClose, onPickRoom }: { visible: boolean; device: Device | null; rooms: ProjectRoom[]; onClose: () => void; onPickRoom: (room: ProjectRoom) => void }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}><View style={{ backgroundColor: colors.bgElevated, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, maxHeight: '72%' }}><Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Associar divisão</Text><Text style={{ color: colors.textMuted, marginTop: 4 }}>{device?.name ?? 'Dispositivo'}</Text><ScrollView style={{ marginTop: 14 }}>{rooms.map((room) => <Pressable key={room.id} onPress={() => onPickRoom(room)} style={{ paddingVertical: 14, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.card, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.text, fontWeight: '700' }}>{room.name}</Text></Pressable>)}</ScrollView><Pressable onPress={onClose} style={{ marginTop: 8, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 18 }}><Text style={{ color: colors.textMuted }}>Fechar</Text></Pressable></View></View></Modal>
}
\n\n## src/components/DeviceDetailSheet.tsx\n\nimport React from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { AlertRule, ConsumptionResponse, Device } from '../api/devices'
import { DeviceTrendsCard } from './DeviceTrendsCard'
import { TimeRangeTabs } from './TimeRangeTabs'
export function DeviceDetailSheet({ visible, device, consumption, rules, range, onRangeChange, onClose, onCreateRule, onDeleteRule }: { visible: boolean; device: Device | null; consumption: ConsumptionResponse | null; rules: AlertRule[]; range: 'hourly' | 'daily' | 'weekly' | 'monthly'; onRangeChange: (v: 'hourly' | 'daily' | 'weekly' | 'monthly') => void; onClose: () => void; onCreateRule: () => void; onDeleteRule: (id: string) => void }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}><View style={{ backgroundColor: colors.bgElevated, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, maxHeight: '90%' }}><Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{device?.name ?? 'Dispositivo'}</Text><Text style={{ color: colors.textMuted, marginTop: 4 }}>{device?.vendor_room_name ?? 'Sem room do vendor'} · {device?.project_room_id ?? 'Sem divisão'}</Text><View style={{ marginTop: 12 }}><TimeRangeTabs value={range} onChange={onRangeChange} /></View><ScrollView style={{ marginTop: 14 }}><DeviceTrendsCard mode={range} consumption={consumption} /><View style={{ marginTop: 14, borderRadius: 20, padding: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.text, fontWeight: '800' }}>Automações</Text><Text style={{ color: colors.textMuted, marginTop: 4 }}>Regras associadas ao dispositivo.</Text><View style={{ marginTop: 12, gap: 10 }}>{rules.length === 0 ? <Text style={{ color: colors.textSoft }}>Sem regras configuradas.</Text> : rules.map((rule) => <View key={rule.id} style={{ padding: 12, borderRadius: 16, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.text, fontWeight: '700' }}>{rule.name}</Text><Text style={{ color: colors.textMuted, marginTop: 3 }}>{rule.metric} {rule.operator} {rule.threshold}</Text><Pressable onPress={() => onDeleteRule(rule.id)} style={{ marginTop: 8 }}><Text style={{ color: colors.danger, fontWeight: '700' }}>Remover regra</Text></Pressable></View>)}</View><Pressable onPress={onCreateRule} style={{ marginTop: 12, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.text, textAlign: 'center', fontWeight: '700' }}>Nova regra</Text></Pressable></View></ScrollView><Pressable onPress={onClose} style={{ marginTop: 12, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 18 }}><Text style={{ color: colors.textMuted }}>Fechar</Text></Pressable></View></View></Modal>
}
\n\n## src/components/UnassignedDevicesPanel.tsx\n\nimport React from 'react'
import { Pressable, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { Device } from '../api/devices'
export function UnassignedDevicesPanel({ devices, onMapDevice }: { devices: Device[]; onMapDevice: (device: Device) => void }) {
  const unassigned = devices.filter((d) => !d.project_room_id)
  return <View style={{ marginTop: 16, borderRadius: 24, padding: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Sem divisão atribuída</Text><Text style={{ color: colors.textMuted, marginTop: 4 }}>{unassigned.length} dispositivos aguardam associação</Text>{unassigned.length === 0 ? <Text style={{ color: colors.textSoft, marginTop: 10 }}>Tudo devidamente organizado.</Text> : unassigned.map((device) => <View key={device.id} style={{ marginTop: 12, padding: 14, borderRadius: 18, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.text, fontWeight: '700' }}>{device.name}</Text><Text style={{ color: colors.textMuted, marginTop: 3 }}>{device.vendor_room_name ?? 'Sem room do vendor'}</Text><Pressable onPress={() => onMapDevice(device)} style={{ marginTop: 10 }}><Text style={{ color: colors.accentStrong, fontWeight: '700' }}>Associar divisão</Text></Pressable></View>)}</View>
}
\n\n## src/components/QuickStatsBar.tsx\n\nimport React from 'react'
import { Text, View } from 'react-native'
import { colors } from '../theme/colors'
export function QuickStatsBar({ mapped, unmapped, online, watts }: { mapped: number; unmapped: number; online: number; watts: number }) {
  const items = [['Mapeados', String(mapped)], ['Sem divisão', String(unmapped)], ['Online', String(online)], ['Potência', `${Math.round(watts)} W`]]
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{items.map(([label, value]) => <View key={label} style={{ minWidth: 120, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.textMuted, fontSize: 12 }}>{label}</Text><Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{value}</Text></View>)}</View>
}
\n\n## src/components/GlassCard.tsx\n\nimport React from 'react'
import { View } from 'react-native'
import { colors } from '../theme/colors'
export function GlassCard({ children, style }: any) {
  return <View style={[{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } }, style]}>{children}</View>
}
\n\n## src/types/domains.ts\n\nexport type TipoDispositivo = 'light' | 'blind' | 'outlet' | 'climate' | 'sensor';
export type Fabricante = 'tapo' | 'shelly' | 'sonoff' | 'generic';
export type EstadoMapeamento = 'matched' | 'unmatched' | 'manual';
export type SeccaoAlerta = 'info' | 'warning' | 'critical';

export interface Ponto3D {
  x: number;
  y: number;
  z: number;
}

export interface Dispositivo {
  id: string;
  name: string;
  type: TipoDispositivo;
  vendor: Fabricante;
  room_id: string;
  state: Record<string, unknown>;
  position: Ponto3D;
  online: boolean;
  created_at: string;
  vendor_room_name?: string | null;
  project_room_id?: string | null;
  mapping_status: EstadoMapeamento;
}

export interface CriarDispositivoInput {
  name: string;
  type: TipoDispositivo;
  vendor: Fabricante;
  room_id: string;
  state?: Record<string, unknown>;
  position?: Ponto3D;
  vendor_room_name?: string | null;
  project_room_id?: string | null;
  mapping_status?: EstadoMapeamento;
}

export interface ActualizarDispositivoInput {
  name?: string;
  type?: TipoDispositivo;
  vendor?: Fabricante;
  room_id?: string;
  state?: Record<string, unknown>;
  position?: Ponto3D;
  online?: boolean;
  vendor_room_name?: string | null;
  project_room_id?: string | null;
  mapping_status?: EstadoMapeamento;
}

export interface Division {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  color: string;
}

export interface MapeamentoDivisao {
  id: string;
  vendor: Fabricante;
  vendor_room_name: string;
  project_room_id: string;
  match_mode: 'auto' | 'manual';
  updated_at: string;
}

export interface RegraAlerta {
  id: string;
  device_id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  enabled: boolean;
  notify: boolean;
  created_at: string;
}

export interface CriarRegraAlertaInput {
  device_id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  enabled?: boolean;
  notify?: boolean;
}

export interface EventoAlerta {
  id: string;
  device_id: string;
  rule_id?: string | null;
  title: string;
  message: string;
  severity: SeccaoAlerta;
  acknowledged: boolean;
  created_at: string;
}

export interface ConfiguracaoApp {
  flask_server_url: string;
  flask_api_key: string;
  house_name: string;
  language: string;
  voice_assistant_enabled: boolean;
  alexa_enabled: boolean;
}

export interface ResumoCasa {
  rooms_count: number;
  devices_count: number;
  mapped_devices_count: number;
  unmapped_devices_count: number;
  online_count: number;
  lights_on: number;
  total_power_w: number;
  avg_temperature_c?: number | null;
  alerts_unacked: number;
}

export interface PontoConsumo {
  t: string;
  power_w: number;
}

export interface ConsumoDispositivo {
  device_id: string;
  hours: number;
  points: PontoConsumo[];
  total_kwh: number;
}\n\n## src/theme.ts\n\nexport const colors = {
  bg: "#0A0A0A",
  bgSecondary: "#141414",
  bgTertiary: "#1C1C1C",
  glass: "rgba(255,255,255,0.05)",
  glassStrong: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "#FFFFFF",
  textMuted: "#A1A1AA",
  textDim: "#71717A",
  amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,0.15)",
  blue: "#3B82F6",
  blueSoft: "rgba(59,130,246,0.15)",
  green: "#10B981",
  greenSoft: "rgba(16,185,129,0.15)",
  red: "#EF4444",
  redSoft: "rgba(239,68,68,0.15)",
  purple: "#8B5CF6",
  gray: "#3F3F46",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: "700" as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  small: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 1.2 },
  label: { fontSize: 12, fontWeight: "500" as const },
};

export function colorForType(type: string, on?: boolean): string {
  if (type === "light") return on ? colors.amber : colors.gray;
  if (type === "outlet") return on ? colors.green : colors.gray;
  if (type === "blind") return colors.blue;
  if (type === "climate") return colors.blue;
  if (type === "sensor") return colors.purple;
  return colors.gray;
}\n\n## src/theme/colors.ts\n\nexport const colors = {
  bg: '#05070a',
  bgElevated: '#0b0f14',
  card: '#111827',
  cardAlt: '#1f2937',
  border: 'rgba(255,255,255,0.08)',
  text: '#f9fafb',
  textMuted: '#9ca3af',
  textSoft: '#d1d5db',
  accent: '#60a5fa',
  accentStrong: '#93c5fd',
  success: '#34d399',
  warning: '#f59e0b',
  danger: '#fb7185',
}
\n\n## src/utils/map-device.ts\n\nimport { Device, Room } from "@/src/api";
import { ROOM_ZONES } from "@/src/utils/room-zones";

export type DeviceMarker = {
  id: string;
  roomId: string;
  x: number;
  y: number;
  isOn: boolean;
  online: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getDeviceIsOn(device: Device): boolean {
  if (device.type === "blind") {
    return (device.state?.position ?? 0) > 0;
  }
  return Boolean(device.state?.on);
}

export function projectDeviceToRoomZone(
  device: Device,
  rooms: Room[],
): DeviceMarker {
  const zone = ROOM_ZONES.find((z) => z.roomId === device.room_id);
  const room = rooms.find((r) => r.id === device.room_id);

  if (!zone) {
    return {
      id: device.id,
      roomId: device.room_id,
      x: 100,
      y: 100,
      isOn: getDeviceIsOn(device),
      online: device.online,
    };
  }

  if (zone.bounds && room && device.position) {
    const relX =
      room.width > 0 ? (device.position.x - room.x) / room.width : 0.5;
    const relY =
      room.depth > 0 ? (device.position.z - room.y) / room.depth : 0.5;

    return {
      id: device.id,
      roomId: device.room_id,
      x: zone.bounds.x + clamp(relX, 0, 1) * zone.bounds.width,
      y: zone.bounds.y + clamp(relY, 0, 1) * zone.bounds.height,
      isOn: getDeviceIsOn(device),
      online: device.online,
    };
  }

  return {
    id: device.id,
    roomId: device.room_id,
    x: zone.center.x,
    y: zone.center.y,
    isOn: getDeviceIsOn(device),
    online: device.online,
  };
}
\n\n## src/utils/room-zones.ts\n\nexport type RoomZone = {
  roomId: string;
  label: string;
  center: { x: number; y: number };
  bounds?: { x: number; y: number; width: number; height: number };
};

export const ROOM_ZONES: RoomZone[] = [
  {
    roomId: "balcony",
    label: "Varanda",
    center: { x: 130, y: 120 },
    bounds: { x: 70, y: 80, width: 120, height: 80 },
  },
  {
    roomId: "kitchen",
    label: "Cozinha",
    center: { x: 280, y: 130 },
    bounds: { x: 210, y: 80, width: 140, height: 100 },
  },
  {
    roomId: "livingroom",
    label: "Sala",
    center: { x: 500, y: 170 },
    bounds: { x: 380, y: 90, width: 240, height: 150 },
  },
  {
    roomId: "bedroomone",
    label: "Quarto 1",
    center: { x: 170, y: 300 },
    bounds: { x: 90, y: 240, width: 160, height: 120 },
  },
  {
    roomId: "bedroomonewardrobe",
    label: "GR Quarto 1",
    center: { x: 310, y: 280 },
    bounds: { x: 265, y: 240, width: 90, height: 80 },
  },
  {
    roomId: "bedroomtwo",
    label: "Quarto 2",
    center: { x: 170, y: 430 },
    bounds: { x: 90, y: 370, width: 160, height: 120 },
  },
  {
    roomId: "suite",
    label: "Suite",
    center: { x: 510, y: 340 },
    bounds: { x: 410, y: 270, width: 200, height: 140 },
  },
  {
    roomId: "suitewardrobe",
    label: "GR Suite",
    center: { x: 650, y: 320 },
    bounds: { x: 610, y: 285, width: 90, height: 75 },
  },
  {
    roomId: "bathroomsuite",
    label: "BWC Suite",
    center: { x: 650, y: 410 },
    bounds: { x: 610, y: 375, width: 90, height: 70 },
  },
  {
    roomId: "bathroomsocial",
    label: "BWC Social",
    center: { x: 370, y: 285 },
    bounds: { x: 335, y: 245, width: 80, height: 80 },
  },
  {
    roomId: "circulation",
    label: "Circulação",
    center: { x: 370, y: 390 },
    bounds: { x: 330, y: 320, width: 90, height: 150 },
  },
];
