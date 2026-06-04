import React from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { Device } from '../api/devices'
import type { ProjectRoom } from '../api/rooms'

type Props = {
  visible: boolean
  device: Device | null
  rooms: ProjectRoom[]
  onClose: () => void
  onPickRoom: (room: ProjectRoom) => void
}

export function RoomMapperSheet({ visible, device, rooms, onClose, onPickRoom }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.bgElevated,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 18,
            maxHeight: '72%',
          }}
        >
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            Associar divisão
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>
            {device?.name ?? 'Dispositivo'}
          </Text>

          <ScrollView style={{ marginTop: 14 }}>
            {rooms.map((room) => (
              <Pressable
                key={room.id}
                onPress={() => onPickRoom(room)}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 14,
                  borderRadius: 16,
                  backgroundColor: colors.card,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '700' }}>{room.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={{ marginTop: 8, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 18 }}
          >
            <Text style={{ color: colors.textMuted }}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}