import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useSmarthomeData } from '../hooks/useSmarthomeData';
import { AddDeviceModal } from '../components/AddDeviceModal';
import { OutletCard } from '../components/dashboard/OutletCard';
import { DeviceDetailSheet } from '../components/DeviceDetailSheet';

export default function Dashboard() {
  const { devices } = useSmarthomeData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [timeStr, setTimeStr] = useState('');

  const deviceList = devices.data || [];
  // Se algum estiver online e ligado, ou apenas online (lógica do seu home.html)
  const isOnline = deviceList.some((d: any) => d.online); 

  useEffect(() => {
    // Atualiza o relógio a cada segundo como no seu script antigo
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER CLASSICO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Smart Home Dashboard <Text style={{ color: isOnline ? '#e8af34' : '#797876' }}>{isOnline ? '🟡' : '⚪'}</Text>
          </Text>
          <Text style={styles.subtitle}>Última atualização às {timeStr}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addBtnText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* GRELHA RÁPIDA DE DISPOSITIVOS */}
      <ScrollView 
        contentContainerStyle={styles.grid}
        refreshControl={<RefreshControl refreshing={devices.isFetching} onRefresh={devices.refetch} tintColor="#4f98a3" />}
      >
        {deviceList.map((device: any) => (
          <OutletCard 
            key={device.id} 
            device={device} 
            onPress={() => setSelectedDevice(device)} 
          />
        ))}
      </ScrollView>

      {/* MODAIS */}
      <AddDeviceModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
      {selectedDevice && (
        <DeviceDetailSheet device={selectedDevice} onClose={() => setSelectedDevice(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171614' }, // Cores do seu antigo CSS dark theme
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: '#393836'
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#cdccca', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#797876' },
  addBtn: { backgroundColor: '#4f98a3', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, gap: 15, justifyContent: 'space-between' },
});