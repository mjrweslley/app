import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ScrollView, ActivityIndicator, Dimensions
} from 'react-native';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { devicesApi, type HistoryResponse } from '../api/devices';

type ViewType = 'H' | 'D' | 'W' | 'M';

const TAB_LABELS: { key: ViewType; label: string }[] = [
  { key: 'H', label: 'Hora' },
  { key: 'D', label: 'Dia' },
  { key: 'W', label: 'Semana' },
  { key: 'M', label: 'Mês' },
];

const CHART_HEIGHT = 120;
const CHART_WIDTH = Dimensions.get('window').width - 80; // margem

function BarChart({ labels, data }: HistoryResponse) {
  if (!data || data.length === 0) {
    return (
      <View style={chartStyles.empty}>
        <Text style={chartStyles.emptyText}>Sem dados para este período</Text>
      </View>
    );
  }

  const max = Math.max(...data, 0.001);
  const barWidth = Math.max(8, (CHART_WIDTH / data.length) - 4);

  return (
    <View style={chartStyles.wrapper}>
      {/* Barras */}
      <View style={chartStyles.barsRow}>
        {data.map((val, i) => {
          const heightPct = val / max;
          const barH = Math.max(2, heightPct * CHART_HEIGHT);
          return (
            <View key={i} style={[chartStyles.barContainer, { width: barWidth }]}>
              <View
                style={[
                  chartStyles.bar,
                  { height: barH, backgroundColor: '#4f98a3' }
                ]}
              />
            </View>
          );
        })}
      </View>
      {/* Labels eixo X — mostrar só cada N para não sobrepor */}
      <View style={chartStyles.labelsRow}>
        {labels.map((lbl, i) => {
          const step = Math.ceil(labels.length / 6);
          if (i % step !== 0 && i !== labels.length - 1) return <View key={i} style={{ width: barWidth + 4 }} />;
          return (
            <Text key={i} style={[chartStyles.xLabel, { width: barWidth + 4 }]} numberOfLines={1}>
              {lbl}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrapper: { paddingVertical: 8 },
  barsRow: {
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barContainer: { alignItems: 'center', justifyContent: 'flex-end' },
  bar: { borderRadius: 3, width: '100%' },
  labelsRow: { flexDirection: 'row', marginTop: 6, gap: 4 },
  xLabel: { color: '#797876', fontSize: 10, textAlign: 'center' },
  empty: { height: CHART_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#5a5957', fontSize: 13 },
});

// ─────────────────────────────────────────────

export function DeviceDetailSheet({ device, onClose }: { device: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewType>('H');

  const state = device.state || {};
  const isOn = state.on;
  const isOffline = !device.online;

  // Fetch do histórico para o gráfico (como plug.html)
  const { data: historyData, isFetching: historyLoading } = useQuery<HistoryResponse>({
    queryKey: ['device-history', device.id, activeTab],
    queryFn: () => devicesApi.history(device.id, activeTab),
    enabled: !!device.id,
    staleTime: 30000,
    placeholderData: { labels: [], data: [] },
  });

  const total = historyData?.data?.reduce((a, b) => a + b, 0) ?? 0;

  const togglePower = async () => {
    if (isOffline) return;
    setLoading(true);
    try {
      await devicesApi.updateState(device.id, { on: !isOn });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    } catch {
      // silent — o estado actualiza no próximo poll de 5s
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>{device.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body}>

          {/* BOTÃO GIGANTE */}
          <TouchableOpacity
            style={[styles.bigButton, {
              backgroundColor: isOffline ? '#393836' : (isOn ? '#4f98a3' : '#201f1d')
            }]}
            onPress={togglePower}
            disabled={loading || isOffline}
          >
            {loading
              ? <ActivityIndicator size="large" color="#fff" />
              : <Text style={styles.bigButtonText}>
                  {isOffline ? 'OFFLINE' : (isOn ? 'LIGADO' : 'DESLIGADO')}
                </Text>
            }
          </TouchableOpacity>

          {/* ESTATÍSTICAS RÁPIDAS */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Potência Atual</Text>
              <Text style={styles.statValue}>{state.power_w?.toFixed(1) ?? '0'} W</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Consumo Hoje</Text>
              <Text style={styles.statValue}>{state.energy_kwh?.toFixed(3) ?? '0'} kWh</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Tempo Ligado</Text>
              <Text style={styles.statValue}>-- h</Text>
            </View>
          </View>

          {/* GRÁFICO DE ENERGIA (como plug.html) */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Consumo de Energia</Text>

            {/* Tabs H / D / W / M */}
            <View style={styles.tabRow}>
              {TAB_LABELS.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.tabBtn, activeTab === key && styles.tabBtnActive]}
                  onPress={() => setActiveTab(key)}
                >
                  <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Área do gráfico */}
            <View style={styles.chartArea}>
              {historyLoading
                ? <ActivityIndicator size="small" color="#4f98a3" style={{ height: CHART_HEIGHT }} />
                : <BarChart labels={historyData?.labels ?? []} data={historyData?.data ?? []} />
              }
            </View>

            {/* Total acumulado */}
            <Text style={styles.totalText}>
              Total acumulado: {total.toFixed(3)} kWh
            </Text>
          </View>

          {/* ALERTAS */}
          <View style={styles.alertsContainer}>
            <Text style={styles.sectionTitle}>Alertas Configurados</Text>
            <TouchableOpacity style={styles.addAlertBtn}>
              <Text style={styles.addAlertText}>+ Adicionar Novo Alerta</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171614' },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#393836'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#cdccca', flex: 1, marginLeft: 12 },
  backBtn: { padding: 8, backgroundColor: '#201f1d', borderRadius: 6 },
  backText: { color: '#cdccca' },
  body: { padding: 20, gap: 20 },

  bigButton: {
    height: 120, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#393836'
  },
  bigButtonText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  statBox: {
    flex: 1, backgroundColor: '#1c1b19', padding: 15,
    borderRadius: 8, borderWidth: 1, borderColor: '#393836', alignItems: 'center'
  },
  statLabel: { color: '#797876', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  statValue: { color: '#cdccca', fontSize: 18, fontWeight: 'bold' },

  // Gráfico
  chartSection: {
    backgroundColor: '#1c1b19',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#393836',
    padding: 16,
  },
  sectionTitle: { color: '#cdccca', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#201f1d',
    borderWidth: 1, borderColor: '#393836'
  },
  tabBtnActive: { backgroundColor: '#4f98a3', borderColor: '#4f98a3' },
  tabText: { color: '#797876', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  chartArea: { minHeight: CHART_HEIGHT + 30 },
  totalText: { color: '#797876', fontSize: 13, marginTop: 8, textAlign: 'right' },

  // Alertas
  alertsContainer: { marginTop: 4 },
  addAlertBtn: {
    backgroundColor: '#201f1d', padding: 15, borderRadius: 8,
    borderWidth: 1, borderColor: '#393836', alignItems: 'center', borderStyle: 'dashed'
  },
  addAlertText: { color: '#4f98a3', fontWeight: 'bold' }
});
