import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { devicesApi } from '../api/devices';

export function DeviceDetailSheet({ device, onClose }: { device: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const state = device.state || {};
  const isOn = state.on;
  const isOffline = !device.online;

  // Lógica do botão gigante
  const togglePower = async () => {
    if (isOffline) return;
    setLoading(true);
    try {
      // Requer endpoint de toggle no seu devicesApi. Ex: POST /api/devices/{id}/toggle
      await devicesApi.updateState(device.id, { on: !isOn }); 
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    } catch (e) {
      alert("Falha ao comunicar com a tomada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>{device.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          
          {/* BOTÃO GIGANTE (Como no plug.html) */}
          <TouchableOpacity 
            style={[styles.bigButton, { backgroundColor: isOffline ? '#393836' : (isOn ? '#4f98a3' : '#201f1d') }]} 
            onPress={togglePower}
            disabled={loading || isOffline}
          >
            {loading ? <ActivityIndicator size="large" color="#fff" /> : 
              <Text style={styles.bigButtonText}>
                {isOffline ? 'OFFLINE' : (isOn ? 'LIGADO' : 'DESLIGADO')}
              </Text>
            }
          </TouchableOpacity>

          {/* ESTATÍSTICAS RÁPIDAS (As 3 caixas do topo do plug.html) */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Potência Atual</Text>
              <Text style={styles.statValue}>{state.power_w?.toFixed(1) || 0} W</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Consumo Hoje</Text>
              <Text style={styles.statValue}>{state.energy_kwh?.toFixed(3) || 0} kWh</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Tempo Ligado</Text>
              <Text style={styles.statValue}>-- h</Text>
            </View>
          </View>

          {/* SECÇÃO ALERTAS (Como no plug.html) */}
          <View style={styles.alertsContainer}>
            <Text style={styles.sectionTitle}>Alertas Configurados</Text>
            <TouchableOpacity style={styles.addAlertBtn}>
              <Text style={styles.addAlertText}>+ Adicionar Novo Alerta</Text>
            </TouchableOpacity>
            {/* O design prevê expansão aqui para listar alertas */}
          </View>

        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171614' },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#393836' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#cdccca' },
  backBtn: { padding: 8, backgroundColor: '#201f1d', borderRadius: 6 },
  backText: { color: '#cdccca' },
  body: { padding: 20, gap: 20 },
  
  bigButton: { height: 120, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#393836' },
  bigButtonText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  statBox: { flex: 1, backgroundColor: '#1c1b19', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#393836', alignItems: 'center' },
  statLabel: { color: '#797876', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  statValue: { color: '#cdccca', fontSize: 18, fontWeight: 'bold' },

  alertsContainer: { marginTop: 20 },
  sectionTitle: { color: '#cdccca', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  addAlertBtn: { backgroundColor: '#201f1d', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#393836', alignItems: 'center', borderStyle: 'dashed' },
  addAlertText: { color: '#4f98a3', fontWeight: 'bold' }
});