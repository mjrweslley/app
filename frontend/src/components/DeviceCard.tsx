// frontend/src/components/DeviceCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Device } from '../types';

interface Props {
  device: Device;
  onPress: (device: Device) => void;
  onLongPress: (device: Device) => void;
}

export function DeviceCard({ device, onPress, onLongPress }: Props) {
  const isOn = device.state === true || device.state === 'on';

  return (
    <TouchableOpacity
      style={[styles.card, isOn && styles.cardOn]}
      onPress={() => onPress(device)}
      onLongPress={() => onLongPress(device)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.dot, isOn ? styles.dotOn : styles.dotOff]} />
        <Text style={styles.status}>{isOn ? 'Ligado' : 'Desligado'}</Text>
      </View>

      {/* Nome completo — sem truncagem */}
      <Text
        style={styles.name}
        numberOfLines={2}        // máx 2 linhas, sem cortar com "..."
        ellipsizeMode="tail"
        adjustsFontSizeToFit     // reduz fonte se precisar
        minimumFontScale={0.8}
      >
        {device.name}
      </Text>

      {device.power !== undefined && (
        <Text style={styles.power}>{device.power.toFixed(1)} W</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1b19',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardOn: {
    borderColor: 'rgba(79,152,163,0.4)',
    backgroundColor: '#1e2526',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotOn: { backgroundColor: '#4f98a3' },
  dotOff: { backgroundColor: '#5a5957' },
  status: {
    fontSize: 11,
    color: '#797876',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#cdccca',
    lineHeight: 20,
    marginBottom: 8,
    flexShrink: 1,
  },
  power: {
    fontSize: 13,
    color: '#4f98a3',
    fontVariant: ['tabular-nums'],
  },
});