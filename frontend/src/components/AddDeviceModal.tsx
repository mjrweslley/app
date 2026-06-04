// src/components/AddDeviceModal.tsx
import React, { useState } from 'react'
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { colors } from '../theme/colors'
import { devicesApi } from '../api/devices'

type Props = {
  visible: boolean
  onClose: () => void
}

export function AddDeviceModal({ visible, onClose }: Props) {
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  async function handleSave() {
    if (!ip.trim()) return
    setLoading(true)
    try {
      // 1. Delegar a criação totalmente à API (HTTP POST)
      await devicesApi.create({ 
        ip: ip.trim(), 
        type: 'outlet', 
        vendor: 'tapo' 
      })
      
      // 2. Invalidar a cache para forçar um "Refetch" automático e limpar o estado do Frontend
      await queryClient.invalidateQueries({ queryKey: ['devices'] })
      await queryClient.invalidateQueries({ queryKey: ['summary'] })
      
      setIp('')
      onClose()
    } catch (error: any) {
      // 3. AQUI ESTÁ A ALTERAÇÃO: Mostrar o erro exato devolvido pelo backend
      const errorMessage = error.response?.data?.detail || 'Não foi possível contactar o Backend ou a Tomada.';
      Alert.alert('Erro ao Adicionar', errorMessage);
    } finally {
      setLoading(false)
    }
  }

  return (
    // ... O seu JSX de apresentação (View, TextInput, etc) mantém-se igual ...
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: colors.card, padding: 24, borderRadius: 24, width: '90%', maxWidth: 400, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 16 }}>
            🔌 Adicionar Tomada
          </Text>
          
          <TextInput
            style={{ backgroundColor: colors.bg, color: colors.text, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16, fontSize: 16 }}
            placeholder="IP da tomada (ex: 192.168.1.200)"
            placeholderTextColor={colors.textMuted}
            value={ip}
            onChangeText={setIp}
            autoCapitalize="none"
            keyboardType="numeric"
          />

          <Pressable
            onPress={handleSave}
            disabled={loading}
            style={{ backgroundColor: colors.accentStrong, padding: 16, borderRadius: 12, alignItems: 'center', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Ligar e Guardar</Text>}
          </Pressable>

          <Pressable onPress={onClose} style={{ marginTop: 16, alignItems: 'center', padding: 8 }}>
            <Text style={{ color: colors.textMuted, fontWeight: '600' }}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}