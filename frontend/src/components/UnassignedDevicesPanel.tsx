import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { Device } from '../api/devices'

type Props = {
  devices: Device[]
  onMapDevice: (device: Device) => void
}

export function UnassignedDevicesPanel({ devices, onMapDevice }: Props) {
  const unassigned = devices.filter((d) => !d.project_room_id)

  return (
    <View
      style={{
        marginTop: 16,
        borderRadius: 24,
        padding: 16,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
        Sem divisão atribuída
      </Text>
      <Text style={{ color: colors.textMuted, marginTop: 4 }}>
        {unassigned.length} dispositivos aguardam associação
      </Text>

      {unassigned.length === 0 ? (
        <Text style={{ color: colors.textSoft, marginTop: 10 }}>
          Tudo devidamente organizado.
        </Text>
      ) : (
        unassigned.map((device) => (
          <View
            key={device.id}
            style={{
              marginTop: 12,
              padding: 14,
              borderRadius: 18,
              backgroundColor: colors.cardAlt,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>{device.name}</Text>
            <Text style={{ color: colors.textMuted, marginTop: 3 }}>
              {device.vendor_room_name ?? 'Sem room do vendor'}
            </Text>
            <Pressable onPress={() => onMapDevice(device)} style={{ marginTop: 10 }}>
              <Text style={{ color: colors.accentStrong, fontWeight: '700' }}>
                Associar divisão
              </Text>
            </Pressable>
          </View>
        ))
      )}
    </View>
  )
}