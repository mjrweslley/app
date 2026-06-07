// frontend/src/components/DeviceDetailSheet.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, ActivityIndicator
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { Device } from '../index';
// Se usares Victory Native:
// import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';

type TabType = 'H' | 'D' | 'W' | 'M';

interface HistoryData {
  labels: string[];
  data: number[];
}

interface Props {
  device: Device | null;
  visible: boolean;
  onClose: () => void;
}

export function DeviceDetailSheet({ device, visible, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('H');

  const { data: history } = useQuery<HistoryData>({
    queryKey: ['device-history', device?.id, activeTab],
    queryFn: async (): Promise<HistoryData> => {
      const r = await apiClient.get<HistoryData>(
        `/api/devices/${device?.id}/history/${activeTab}`
      );
      return r.data;
    },
    enabled: !!device && visible,
  });

  const total = history?.data?.reduce((a, b) => a + b, 0) ?? 0;

  const tabs: { key: TabType; label: string }[] = [
    { key: 'H', label: 'Hora' },
    { key: 'D', label: 'Dia' },
    { key: 'W', label: 'Semana' },
    { key: 'M', label: 'Mês' },
  ];

  if (!device) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{device.name}</Text>
            <Text style={styles.subtitle}>{device.room}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Estado actual */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Estado</Text>
              <Text style={[styles.statValue, { color: device.state ? '#4f98a3' : '#797876' }]}>
                {device.state ? 'Ligado' : 'Desligado'}
              </Text>
            </View>
            {device.power !== undefined && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Potência actual</Text>
                <Text style={styles.statValue}>{device.power.toFixed(1)} W</Text>
              </View>
            )}
            {device.energy !== undefined && (
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Acumulado hoje</Text>
                <Text style={styles.statValue}>{device.energy.toFixed(3)} kWh</Text>
              </View>
            )}
          </View>

          {/* Tabs do gráfico */}
          <View style={styles.tabRow}>
            {tabs.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, activeTab === t.key && styles.tabActive]}
                onPress={() => setActiveTab(t.key)}
              >
                <Text style={[styles.tabTxt, activeTab === t.key && styles.tabTxtActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Gráfico */}
          <View style={styles.chartContainer}>
            {historyLoading ? (
              <ActivityIndicator color="#4f98a3" style={{ marginTop: 40 }} />
            ) : history && history.data.length > 0 ? (
              <>
                {/* Implementação com barras simples (sem lib externa) */}
                <SimpleBarChart labels={history.labels} data={history.data} />
                <Text style={styles.totalText}>
                  Total acumulado: {total.toFixed(2)} kWh
                </Text>
              </>
            ) : (
              <Text style={styles.emptyChart}>Sem dados para este período</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

/* Gráfico de barras simples em RN puro — substitui por VictoryNative se quiseres */
function SimpleBarChart({ labels, data }: { labels: string[]; data: number[] }) {
  const max = Math.max(...data, 0.001);
  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.bars}>
        {data.map((val, i) => (
          <View key={i} style={chartStyles.barWrapper}>
            <View style={[chartStyles.bar, { height: `${(val / max) * 100}%` }]} />
            <Text style={chartStyles.label} numberOfLines={1}>{labels[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { height: 180, paddingTop: 8 },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 4, paddingBottom: 20 },
  barWrapper: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  bar: { width: '70%', backgroundColor: '#4f98a3', borderRadius: 4, minHeight: 2 },
  label: { fontSize: 9, color: '#797876', marginTop: 4, textAlign: 'center' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171614' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 20, paddingTop: 24, borderBottomWidth: 1, borderBottomColor: '#262523',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#cdccca' },
  subtitle: { fontSize: 13, color: '#797876', marginTop: 2 },
  closeBtn: { padding: 8 },
  closeTxt: { fontSize: 16, color: '#797876' },
  scroll: { flex: 1 },
  statsRow: { flexDirection: 'row', gap: 12, padding: 20, paddingBottom: 0 },
  statCard: {
    flex: 1, backgroundColor: '#1c1b19', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#262523',
  },
  statLabel: { fontSize: 11, color: '#5a5957', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 18, fontWeight: '600', color: '#cdccca' },
  tabRow: { flexDirection: 'row', gap: 8, padding: 20, paddingBottom: 8 },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
    backgroundColor: '#1c1b19', borderWidth: 1, borderColor: '#262523',
  },
  tabActive: { backgroundColor: '#4f98a3', borderColor: '#4f98a3' },
  tabTxt: { fontSize: 13, color: '#797876', fontWeight: '500' },
  tabTxtActive: { color: '#171614', fontWeight: '700' },
  chartContainer: { marginHorizontal: 20, marginTop: 8, minHeight: 200 },
  totalText: { fontSize: 13, color: '#797876', textAlign: 'center', marginTop: 8 },
  emptyChart: { color: '#5a5957', textAlign: 'center', marginTop: 40, fontSize: 14 },
});