import React from 'react'
import { Text, View } from 'react-native'
import { colors } from '../theme/colors'

type Props = {
  mapped: number
  unmapped: number
  online: number
  watts: number
}

export function QuickStatsBar({ mapped, unmapped, online, watts }: Props) {
  const items = [
    ['Mapeados', String(mapped)],
    ['Sem divisão', String(unmapped)],
    ['Online', String(online)],
    ['Potência', `${Math.round(watts)} W`],
  ] as const

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {items.map(([label, value]) => (
        <View
          key={label}
          style={{
            minWidth: 120,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 18,
            backgroundColor: colors.cardAlt,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>{label}</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  )
}