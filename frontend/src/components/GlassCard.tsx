import React from 'react'
import { View } from 'react-native'
import { colors } from '../theme/colors'

export function GlassCard({ children, style }: { children?: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}