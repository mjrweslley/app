import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { Device } from '../api/devices'
import type { ProjectRoom } from '../api/rooms'

type Props = {
  rooms: ProjectRoom[]
  devices: Device[]
  onSelectRoom?: (room: ProjectRoom) => void
  onSelectDevice?: (device: Device) => void
}

function isDeviceOn(device: Device): boolean {
  if (device.type === 'blind') return (device.state?.position ?? 0) > 0
  return Boolean(device.state?.on)
}

export function HouseMap({ rooms, devices, onSelectRoom, onSelectDevice }: Props) {
  return (
    <View
      style={{
        borderRadius: 28,
        padding: 16,
        backgroundColor: colors.bgElevated,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 10 }}>
        Mapa da casa
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {rooms.map((room) => {
          const roomDevices = devices.filter((d) => d.project_room_id === room.id)
          const active = roomDevices.some((d) => isDeviceOn(d))

          return (
            <Pressable
              key={room.id}
              onPress={() => onSelectRoom?.(room)}
              style={{
                width: 170,
                minHeight: 112,
                borderRadius: 22,
                padding: 14,
                backgroundColor: room.color ?? colors.cardAlt,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{room.name}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.78)', marginTop: 6 }}>
                {roomDevices.length} dispositivos
              </Text>
              <Text
                style={{
                  color: active ? '#86efac' : 'rgba(255,255,255,0.55)',
                  marginTop: 6,
                }}
              >
                {active ? 'Ambiente activo' : 'Ambiente calmo'}
              </Text>

              {roomDevices.slice(0, 2).map((device) => (
                <Pressable
                  key={device.id}
                  onPress={() => onSelectDevice?.(device)}
                  style={{ marginTop: 6 }}
                >
                  <Text numberOfLines={1} style={{ color: '#fff', fontSize: 12 }}>
                    {device.name}
                  </Text>
                </Pressable>
              ))}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}