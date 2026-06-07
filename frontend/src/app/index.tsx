import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSmarthomeData } from '../hooks/useSmarthomeData';
import { AddDeviceModal } from '../components/AddDeviceModal';
import { OutletCard } from '../components/dashboard/OutletCard';
import { DeviceDetailSheet } from '../components/DeviceDetailSheet';

export default function Dashboard() {
  const router = useRouter();
  const { devices } = useSmarthomeData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [timeStr, setTimeStr] = useState('');

  const deviceList = devices.data || [];
  const isOnline = deviceList.some((d: any) => d.online);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            Smart Home Dashboard{' '}
            <Text style={{ color: isOnline ? '#e8af34' : '#797876' }}>{isOnline ? '🟡' : '⚪'}</Text>
          </Text>
          <Text style={styles.subtitle}>Última actualização às {timeStr}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBtnText}>+ Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* GRELHA DE DISPOSITIVOS */}
      <ScrollView
        contentContainerStyle={styles.grid}
        refreshControl={
          <RefreshControl
            refreshing={devices.isFetching}
            onRefresh={devices.refetch}
            tintColor="#4f98a3"
          />
        }
      >
        {deviceList.length === 0 && !devices.isLoading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyTitle}>Nenhum dispositivo</Text>
            <Text style={styles.emptyDesc}>Adiciona o teu primeiro dispositivo com o botão + Adicionar</Text>
          </View>
        )}
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
        <DeviceDetailSheet
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171614' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#393836'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#cdccca', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#797876' },
  headerActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  settingsBtn: {
    backgroundColor: '#201f1d',
    width: 40, height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#393836'
  },
  settingsBtnText: { fontSize: 20 },
  addBtn: { backgroundColor: '#4f98a3', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, gap: 15, justifyContent: 'space-between' },
  emptyState: { width: '100%', paddingVertical: 60, alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { color: '#cdccca', fontSize: 18, fontWeight: 'bold' },
  emptyDesc: { color: '#797876', fontSize: 14, textAlign: 'center', maxWidth: 280 },
});
