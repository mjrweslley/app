import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Switch, TouchableOpacity,
  ScrollView, Alert, TextInput
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { devicesApi } from '../api/devices';
import { API_BASE_URL } from '../api/client';

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [alertSound, setAlertSound] = useState(false);

  // Lê o summary para mostrar métricas gerais
  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: devicesApi.summary,
  });

  const handleClearAlerts = () => {
    Alert.alert(
      'Limpar Alertas',
      'Confirmar o reconhecimento de todos os alertas pendentes?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar', style: 'destructive',
          onPress: () => Alert.alert('Feito', 'Alertas reconhecidos.'),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* TÍTULO */}
      <Text style={styles.pageTitle}>Definições</Text>

      {/* ── SECÇÃO: SERVIDOR ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>LIGAÇÃO AO SERVIDOR</Text>
        <View style={styles.card}>
          <Row label="Endereço API" value={API_BASE_URL} mono />
          <Divider />
          <Row label="Estado" value={summary ? 'Online ✓' : 'A verificar…'}
            valueColor={summary ? '#6daa45' : '#797876'} />
        </View>
      </View>

      {/* ── SECÇÃO: SISTEMA ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SISTEMA</Text>
        <View style={styles.card}>
          <Row label="Dispositivos totais" value={String(summary?.devices_count ?? '—')} />
          <Divider />
          <Row label="Dispositivos online" value={String(summary?.online_count ?? '—')} />
          <Divider />
          <Row label="Potência total actual" value={`${summary?.total_power_w?.toFixed(1) ?? '0'} W`} />
          <Divider />
          <Row label="Alertas não reconhecidos" value={String(summary?.alerts_unacked ?? '0')}
            valueColor={(summary?.alerts_unacked ?? 0) > 0 ? '#dd6974' : '#6daa45'} />
        </View>
      </View>

      {/* ── SECÇÃO: NOTIFICAÇÕES ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>NOTIFICAÇÕES</Text>
        <View style={styles.card}>
          <SwitchRow
            label="Alertas activos"
            description="Receber notificações quando um alerta é disparado"
            value={notificationsEnabled}
            onChange={setNotificationsEnabled}
          />
          <Divider />
          <SwitchRow
            label="Som nos alertas"
            description="Reproduzir som ao receber um alerta crítico"
            value={alertSound}
            onChange={setAlertSound}
          />
        </View>
      </View>

      {/* ── SECÇÃO: AÇÕES ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>AÇÕES</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleClearAlerts}>
            <Text style={styles.actionLabel}>Reconhecer todos os alertas</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SECÇÃO: SOBRE ── */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>SOBRE</Text>
        <View style={styles.card}>
          <Row label="Versão" value="1.0.0" />
          <Divider />
          <Row label="Plataforma" value="React Native Expo" />
          <Divider />
          <Row label="Backend" value="Flask + SQLite" />
        </View>
      </View>

    </ScrollView>
  );
}

// ── Sub-componentes ──

function Row({ label, value, mono = false, valueColor }: {
  label: string; value: string; mono?: boolean; valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.mono, valueColor ? { color: valueColor } : null]}
        numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SwitchRow({ label, description, value, onChange }: {
  label: string; description: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#393836', true: '#227f8b' }}
        thumbColor={value ? '#4f98a3' : '#797876'}
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171614' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 24 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#cdccca', marginBottom: 4 },

  section: { gap: 8 },
  sectionLabel: { fontSize: 11, color: '#5a5957', fontWeight: '700', letterSpacing: 1.2, paddingLeft: 4 },
  card: { backgroundColor: '#1c1b19', borderRadius: 10, borderWidth: 1, borderColor: '#393836', overflow: 'hidden' },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel: { color: '#cdccca', fontSize: 15 },
  rowDesc: { color: '#5a5957', fontSize: 12, marginTop: 2 },
  rowValue: { color: '#797876', fontSize: 14, maxWidth: '55%', textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 12, color: '#4f98a3' },

  switchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  actionLabel: { color: '#dd6974', fontSize: 15, fontWeight: '600' },
  actionArrow: { color: '#797876', fontSize: 16 },

  divider: { height: 1, backgroundColor: '#262523', marginLeft: 16 },
});
