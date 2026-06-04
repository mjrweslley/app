import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { AlertEvent } from '../api/devices'
export function AlertPanel({ alerts, onAck }: { alerts: AlertEvent[]; onAck: (id: string) => void }) {
  return <View style={{ marginTop: 16, borderRadius: 24, padding: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>Alertas</Text><Text style={{ color: colors.textMuted, marginTop: 4 }}>{alerts.length} eventos recentes</Text>{alerts.length === 0 ? <Text style={{ color: colors.textSoft, marginTop: 10 }}>Sem alertas pendentes.</Text> : alerts.map((a) => <View key={a.id} style={{ marginTop: 12, padding: 14, borderRadius: 18, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border }}><Text style={{ color: a.severity === 'critical' ? colors.danger : a.severity === 'warning' ? colors.warning : colors.accentStrong, fontWeight: '800' }}>{a.title}</Text><Text style={{ color: colors.textMuted, marginTop: 4 }}>{a.body}</Text><Pressable onPress={() => onAck(a.id)} style={{ marginTop: 10 }}><Text style={{ color: colors.success, fontWeight: '700' }}>Reconhecer</Text></Pressable></View>)}</View>
}
