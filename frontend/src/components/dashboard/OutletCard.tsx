import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { devicesApi } from '../../api/devices';

export function OutletCard({ device, onPress }: { device: any, onPress: () => void }) {
  const queryClient = useQueryClient();
  const state = device.state || {};
  const isOffline = !device.online;
  const isOn = state.on;

  const handleDelete = () => {
    Alert.alert('Remover', `Remover o dispositivo "${device.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Remover', style: 'destructive', 
        onPress: async () => {
          try {
            await devicesApi.delete(device.id);
            queryClient.invalidateQueries({ queryKey: ['devices'] });
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível remover.');
          }
        }
      }
    ]);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        {/* FIX: nome completo sem truncar — flex:1 + flexShrink para comprimir correctamente */}
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={2}>{device.name}</Text>
          <Text style={styles.ip} numberOfLines={1}>{device.vendor_device_id}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsArea}>
        <Text style={[styles.statusText, { color: isOffline ? '#797876' : (isOn ? '#6daa45' : '#e8af34') }]}>
          {isOffline ? 'OFFLINE' : (isOn ? 'LIGADO' : 'DESLIGADO')}
        </Text>
        <Text style={styles.power}>{state.power_w?.toFixed(1) ?? '0'} W</Text>
        <Text style={styles.energy}>{state.energy_kwh?.toFixed(3) ?? '0'} kWh</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { 
    width: '47%', 
    backgroundColor: '#1c1b19', 
    borderRadius: 8, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#393836' 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 15,
    gap: 8,
  },
  // FIX: flex:1 permite que o texto ocupe toda a largura disponível antes do botão ✕
  nameContainer: { flex: 1 },
  name: { color: '#cdccca', fontWeight: 'bold', fontSize: 15, lineHeight: 20 },
  ip: { color: '#797876', fontSize: 11, marginTop: 3 },
  deleteBtn: { paddingTop: 2 },
  deleteText: { color: '#d163a7', fontSize: 16, fontWeight: 'bold' },
  statsArea: { gap: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  power: { color: '#cdccca', fontSize: 22, fontWeight: 'bold' },
  energy: { color: '#797876', fontSize: 14 }
});
