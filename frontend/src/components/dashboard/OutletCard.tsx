import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { devicesApi } from '../../api/devices'; // Certifique-se que o caminho está correto

export function OutletCard({ device, onPress }: { device: any, onPress: () => void }) {
  const queryClient = useQueryClient();
  const state = device.state || {};
  const isOffline = !device.online;
  const isOn = state.on;

  const handleDelete = () => {
    Alert.alert('Remover', `Remover a tomada ${device.vendor_device_id}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Remover', style: 'destructive', 
        onPress: async () => {
          try {
            await devicesApi.delete(device.id); // Requer que tenha esta função no devicesApi
            queryClient.invalidateQueries({ queryKey: ['devices'] });
          } catch (e) {
            Alert.alert("Erro", "Não foi possível remover.");
          }
        }
      }
    ]);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.name} numberOfLines={1}>{device.name}</Text>
          <Text style={styles.ip}>{device.vendor_device_id}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsArea}>
        <Text style={[styles.statusText, { color: isOffline ? '#797876' : (isOn ? '#6daa45' : '#e8af34') }]}>
          {isOffline ? 'OFFLINE' : (isOn ? 'LIGADO' : 'DESLIGADO')}
        </Text>
        <Text style={styles.power}>{state.power_w?.toFixed(1) || 0} W</Text>
        <Text style={styles.energy}>{state.energy_kwh?.toFixed(3) || 0} kWh</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: '47%', backgroundColor: '#1c1b19', borderRadius: 8, padding: 15, borderWidth: 1, borderColor: '#393836' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  name: { color: '#cdccca', fontWeight: 'bold', fontSize: 16, width: 120 },
  ip: { color: '#797876', fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 4 },
  deleteText: { color: '#d163a7', fontSize: 16, fontWeight: 'bold' },
  statsArea: { gap: 4 },
  statusText: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  power: { color: '#cdccca', fontSize: 22, fontWeight: 'bold' },
  energy: { color: '#797876', fontSize: 14 }
});