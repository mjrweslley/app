import React from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { AlertRule, ConsumptionResponse, Device } from '../api/devices'
import { DeviceTrendsCard } from './DeviceTrendsCard'
import { TimeRangeTabs } from './TimeRangeTabs'

export type DetailRange = 'hourly' | 'daily' | 'weekly' | 'monthly'

export function DeviceDetailSheet({
  visible,
  device,
  consumption,
  rules,
  range,
  onRangeChange,
  onClose,
  onCreateRule,
  onDeleteRule,
}: {
  visible: boolean
  device: Device | null
  consumption: ConsumptionResponse | null
  rules: AlertRule[]
  range: DetailRange
  onRangeChange: (v: DetailRange) => void
  onClose: () => void
  onCreateRule: () => void
  onDeleteRule: (id: string) => void
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: colors.bgElevated, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, maxHeight: '90%' }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{device?.name ?? 'Dispositivo'}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>
            {device?.vendor_room_name ?? 'Sem room do vendor'} · {device?.project_room_id ?? 'Sem divisão'}
          </Text>

          <View style={{ marginTop: 12 }}>
            <TimeRangeTabs value={range} onChange={onRangeChange} />
          </View>

          <ScrollView style={{ marginTop: 14 }}>
            <DeviceTrendsCard mode={range} consumption={consumption} />

            <View style={{ marginTop: 14, borderRadius: 20, padding: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.text, fontWeight: '800' }}>Automações</Text>
              <Text style={{ color: colors.textMuted, marginTop: 4 }}>Regras associadas ao dispositivo.</Text>

              <View style={{ marginTop: 12, gap: 10 }}>
                {rules.length === 0 ? (
                  <Text style={{ color: colors.textSoft }}>Sem regras configuradas.</Text>
                ) : (
                  rules.map((rule) => (
                    <View
                      key={rule.id}
                      style={{ padding: 12, borderRadius: 16, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border }}
                    >
                      <Text style={{ color: colors.text, fontWeight: '700' }}>{rule.name}</Text>
                      <Text style={{ color: colors.textMuted, marginTop: 3 }}>
                        {rule.metric} {rule.operator} {rule.threshold}
                      </Text>
                      <Pressable onPress={() => onDeleteRule(rule.id)} style={{ marginTop: 8 }}>
                        <Text style={{ color: colors.danger, fontWeight: '700' }}>Remover regra</Text>
                      </Pressable>
                    </View>
                  ))
                )}
              </View>

              <Pressable
                onPress={onCreateRule}
                style={{
                  marginTop: 12,
                  paddingVertical: 12,
                  borderRadius: 16,
                  backgroundColor: colors.cardAlt,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, textAlign: 'center', fontWeight: '700' }}>Nova regra</Text>
              </Pressable>
            </View>
          </ScrollView>

          <Pressable onPress={onClose} style={{ marginTop: 12, alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 18 }}>
            <Text style={{ color: colors.textMuted }}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}