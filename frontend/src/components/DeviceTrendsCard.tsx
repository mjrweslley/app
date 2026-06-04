import React from 'react'
import { Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { ConsumptionResponse } from '../api/devices'
import type { DetailRange } from './DeviceDetailSheet'

type Props = {
  mode: DetailRange
  consumption: ConsumptionResponse | null
}

export function DeviceTrendsCard({ mode, consumption }: Props) {
  const points = consumption?.points ?? []
  const totalKwh = consumption?.total_kwh ?? 0

  return (
    <View
      style={{
        borderRadius: 20,
        padding: 14,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>
        Consumos
      </Text>
      <Text style={{ color: colors.textMuted, marginTop: 4 }}>
        Vista {mode} · {points.length} pontos
      </Text>

      <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textSoft }}>Energia total</Text>
        <Text style={{ color: colors.text, fontWeight: '700' }}>
          {totalKwh.toFixed(2)} kWh
        </Text>
      </View>

      <View style={{ marginTop: 12, gap: 8 }}>
        {points.slice(-6).map((point) => (
          <View
            key={point.t}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 14,
              backgroundColor: colors.cardAlt,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textMuted }}>{point.t}</Text>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{Math.round(point.power_w)} W</Text>
          </View>
        ))}

        {points.length === 0 && (
          <Text style={{ color: colors.textSoft, marginTop: 6 }}>
            Sem dados de consumo para esta divisão temporal.
          </Text>
        )}
      </View>
    </View>
  )
}