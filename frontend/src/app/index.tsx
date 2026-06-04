import React, { useMemo, useState } from 'react'
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
import { DeviceDetailSheet, type DetailRange } from '../components/DeviceDetailSheet'
import { AddDeviceModal } from '../components/AddDeviceModal'

export default function HomeScreen() {
  const queryClient = useQueryClient()
  const { width } = useWindowDimensions()
  const { rooms, devices, summary } = useSmarthomeData()
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<ProjectRoom | null>(null)
  const [mapperOpen, setMapperOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [range, setRange] = useState<DetailRange>('hourly')

  const roomList = rooms.data ?? []
  const deviceList = devices.data ?? []
  const summaryData = summary.data
  const mappedCount = summaryData?.mapped_devices_count ?? 0
  const unmappedCount = summaryData?.unmapped_devices_count ?? 0
  const isTablet = width >= 900
  const projectRoomOptions = useMemo(() => roomList, [roomList])

  const consumptionQuery = useQuery({
    queryKey: ['device-consumption', selectedDevice?.id, range],
    queryFn: () => devicesApi.consumption(selectedDevice!.id, 24),
    enabled: !!selectedDevice?.id && detailOpen,
  })

  const rulesQuery = useQuery({
    queryKey: ['alert-rules', selectedDevice?.id],
    queryFn: () => devicesApi.alertRules(selectedDevice?.id),
    enabled: !!selectedDevice?.id && detailOpen,
  })

  async function mapDeviceToRoom(device: Device, room: ProjectRoom) {
    await mappingsApi.create({
      vendor: device.vendor,
      vendor_room_name: device.vendor_room_name ?? device.room_id,
      project_room_id: room.id,
      match_mode: 'manual',
    })
    await queryClient.invalidateQueries({ queryKey: ['room-mappings'] })
    await queryClient.invalidateQueries({ queryKey: ['devices'] })
    await queryClient.invalidateQueries({ queryKey: ['summary'] })
    setSelectedDevice(null)
    setMapperOpen(false)
  }

  async function createRule() {
    if (!selectedDevice) return
    await devicesApi.createAlertRule({
      device_id: selectedDevice.id,
      name: `Regra ${selectedDevice.name}`,
      metric: 'power',
      operator: '>',
      threshold: 1200,
      enabled: true,
      notify: true,
    })
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
          {/* Cabeçalho com o botão + */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>SmartHome</Text>
            
            <Pressable 
              onPress={() => setAddModalOpen(true)}
              style={{ backgroundColor: colors.cardAlt, padding: 10, borderRadius: 99, borderWidth: 1, borderColor: colors.border }}
            >
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>＋ Nova</Text>
            </Pressable>
          </View>
          
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>Ambiente escuro, calmo e pronto para 24/7.</Text>
        </GlassCard>

        <View style={{ flexDirection: isTablet ? 'row' : 'column', gap: 16 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <SvgHouseMap
              rooms={roomList}
              devices={deviceList}
              onPressRoom={setSelectedRoom}
              onPressDevice={(device) => {
                setSelectedDevice(device)
                setMapperOpen(true)
                setDetailOpen(true)
                setRange('hourly')
              }}
            />
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <UnassignedDevicesPanel
              devices={deviceList}
              onMapDevice={(device) => {
                setSelectedDevice(device)
                setMapperOpen(true)
                setDetailOpen(true)
                setRange('hourly')
              }}
            />

            {selectedDevice && (
              <GlassCard style={{ marginTop: 16, padding: 16 }}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>{selectedDevice.name}</Text>
                <Text style={{ color: colors.textMuted, marginTop: 4 }}>Vendor room: {selectedDevice.vendor_room_name ?? '—'}</Text>
                <Text style={{ color: colors.textMuted, marginTop: 2 }}>Project room: {selectedDevice.project_room_id ?? '—'}</Text>

                <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {projectRoomOptions.map((room) => (
                    <Pressable
                      key={room.id}
                      onPress={() => mapDeviceToRoom(selectedDevice, room)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 999,
                        backgroundColor: colors.cardAlt,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text style={{ color: colors.text }}>{room.name}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  onPress={() => setDetailOpen(true)}
                  style={{
                    marginTop: 14,
                    paddingVertical: 12,
                    borderRadius: 16,
                    backgroundColor: colors.cardAlt,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
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

      <RoomMapperSheet
        visible={mapperOpen}
        device={selectedDevice}
        rooms={roomList}
        onClose={() => setMapperOpen(false)}
        onPickRoom={(room) => selectedDevice && mapDeviceToRoom(selectedDevice, room)}
      />

      <DeviceDetailSheet
        visible={detailOpen}
        device={selectedDevice}
        consumption={consumptionQuery.data ?? null}
        rules={rulesQuery.data ?? []}
        range={range}
        onRangeChange={setRange}
        onClose={() => setDetailOpen(false)}
        onCreateRule={createRule}
        onDeleteRule={deleteRule}
      />
    <AddDeviceModal 
        visible={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
      />
    </SafeAreaView>
  )
}