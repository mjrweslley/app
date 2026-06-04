import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import type { DetailRange } from './DeviceDetailSheet'

type Props = {
  value: DetailRange
  onChange: (value: DetailRange) => void
}

const tabs: { key: DetailRange; label: string }[] = [
  { key: 'hourly', label: 'Hora' },
  { key: 'daily', label: 'Dia' },
  { key: 'weekly', label: 'Semana' },
  { key: 'monthly', label: 'Mês' },
]

export function TimeRangeTabs({ value, onChange }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        padding: 6,
        borderRadius: 18,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.key === value
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 14,
              backgroundColor: active ? colors.cardAlt : 'transparent',
              borderWidth: active ? 1 : 0,
              borderColor: active ? colors.border : 'transparent',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: active ? colors.text : colors.textMuted,
                fontWeight: active ? '800' : '600',
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}