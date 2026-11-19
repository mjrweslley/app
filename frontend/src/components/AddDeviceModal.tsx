import React, { useState } from 'react'
import { Modal, View, Text, Pressable, ActivityIndicator, Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { colors } from '../theme/colors'
import { request } from '../api/client'

type Props = { visible: boolean; onClose: () => void }

export function AddDeviceModal({ visible, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  async function handlePairing() {
    setLoading(true)
    try {
      await request('/zigbee/permit-join', { method: 'POST', body: JSON.stringify({ duration: 120 }) })
      Alert.alert('Emparelhamento Zigbee ativo', 'O Hub abriu uma janela de 120 segundos. Coloca o dispositivo em modo de associação e aguarda a descoberta.')
      await queryClient.invalidateQueries({ queryKey: ['devices'] })
      await queryClient.invalidateQueries({ queryKey: ['summary'] })
      onClose()
    } catch (error) {
      Alert.alert('Falha no emparelhamento', error instanceof Error ? error.message : 'Verifica a ligação ao Hub.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: colors.card, padding: 24, borderRadius: 24, width: '90%', maxWidth: 420, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 12 }}>Adicionar dispositivo Zigbee</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 21, marginBottom: 20 }}>
            O Hub permite o emparelhamento durante 120 segundos. Coloca o dispositivo Zigbee em modo de associação. Não é necessária uma conta eWeLink.
          </Text>
          <Pressable onPress={handlePairing} disabled={loading} style={{ backgroundColor: colors.accentStrong, padding: 16, borderRadius: 12, alignItems: 'center', opacity: loading ? 0.7 : 1 }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Iniciar emparelhamento</Text>}
          </Pressable>
          <Pressable onPress={onClose} style={{ marginTop: 16, alignItems: 'center', padding: 8 }}>
            <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
