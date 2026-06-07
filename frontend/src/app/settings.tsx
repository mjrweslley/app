// frontend/src/app/settings.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Switch, TouchableOpacity, TextInput, Alert
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';
import { useSettingsStore } from '../stores/settingsStore';

export default function SettingsScreen() {
  const {
    notificationsEnabled,
    alertThresholdW,
    setNotificationsEnabled,
    setAlertThreshold,
  } = useSettingsStore();

  const [thresholdInput, setThresholdInput] = useState(String(alertThresholdW));

  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: () => apiClient.get<Record<string, unknown>>('/api/summary').then((r) => r.data),
    staleTime: 30_000,
  });

  function saveThreshold() {
    const val = parseFloat(thresholdInput);
    if (!isNaN(val) && val > 0) {
      setAlertThreshold(val);
      Alert.alert('Guardado', `Limite de alerta definido para ${val} W`);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Definições</Text>

      {/* Utilizador actual */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Text style={styles.iconEmoji}>👤</Text>
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Utilizador</Text>
            <Text style={styles.rowValue}>
              {summary?.user ?? 'Administrador'}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Text style={styles.iconEmoji}>🏠</Text>
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Dispositivos activos</Text>
            <Text style={styles.rowValue}>
              {summary?.devices_on ?? '--'} / {summary?.total_devices ?? '--'}
            </Text>
          </View>
        </View>
      </View>

      {/* Notificações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações e Alertas</Text>

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Alertas activos</Text>
            <Text style={styles.rowSubtitle}>
              Receber notificação quando consumo exceder limite
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#393836', true: '#4f98a3' }}
            thumbColor={notificationsEnabled ? '#171614' : '#5a5957'}
          />
        </View>

        {notificationsEnabled && (
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Limite de consumo (W)</Text>
              <Text style={styles.rowSubtitle}>Alerta quando um dispositivo exceder este valor</Text>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={thresholdInput}
                onChangeText={setThresholdInput}
                keyboardType="numeric"
                onBlur={saveThreshold}
                returnKeyType="done"
                onSubmitEditing={saveThreshold}
              />
              <Text style={styles.inputUnit}>W</Text>
            </View>
          </View>
        )}
      </View>

      {/* Servidor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servidor</Text>
        <ServerSettings />
      </View>

      {/* Info da app */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Versão da aplicação</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function ServerSettings() {
  const { serverUrl, setServerUrl } = useSettingsStore();
  const [input, setInput] = useState(serverUrl);
  const [status, setStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');

  async function testConnection() {
    setStatus('testing');
    try {
      const res = await fetch(`${input}/api/summary`, { signal: AbortSignal.timeout(3000) });
      setStatus(res.ok ? 'ok' : 'error');
    } catch {
      setStatus('error');
    }
  }

  function save() {
    setServerUrl(input);
    Alert.alert('Guardado', `Servidor: ${input}`);
  }

  const statusColor = { idle: '#797876', testing: '#d19900', ok: '#6daa45', error: '#dd6974' };
  const statusLabel = { idle: '—', testing: 'A testar...', ok: 'Online', error: 'Sem resposta' };

  return (
    <>
      <View style={styles.row}>
        <View style={styles.rowContent}>
          <Text style={styles.rowLabel}>URL do servidor</Text>
          <TextInput
            style={styles.urlInput}
            value={input}
            onChangeText={setInput}
            placeholder="http://192.168.1.x:8081"
            placeholderTextColor="#5a5957"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
      </View>
      <View style={styles.serverActions}>
        <TouchableOpacity style={styles.btnSecondary} onPress={testConnection}>
          <Text style={styles.btnSecondaryTxt}>Testar ligação</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={save}>
          <Text style={styles.btnPrimaryTxt}>Guardar</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.statusTxt, { color: statusColor[status] }]}>
        {statusLabel[status]}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171614' },
  content: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 28, fontWeight: '700', color: '#cdccca', marginBottom: 24 },
  section: {
    backgroundColor: '#1c1b19', borderRadius: 16,
    borderWidth: 1, borderColor: '#262523', marginBottom: 20, overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '600', color: '#5a5957', textTransform: 'uppercase',
    letterSpacing: 1, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#262523',
  },
  rowIcon: { width: 32, marginRight: 12 },
  iconEmoji: { fontSize: 18 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, color: '#cdccca', fontWeight: '500' },
  rowSubtitle: { fontSize: 12, color: '#797876', marginTop: 2 },
  rowValue: { fontSize: 13, color: '#4f98a3', marginTop: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  input: {
    backgroundColor: '#262523', color: '#cdccca', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6, fontSize: 15, minWidth: 80, textAlign: 'right',
  },
  inputUnit: { fontSize: 13, color: '#797876' },
  urlInput: {
    backgroundColor: '#262523', color: '#cdccca', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, marginTop: 6,
  },
  serverActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 14 },
  btnSecondary: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: '#262523', borderWidth: 1, borderColor: '#393836',
  },
  btnSecondaryTxt: { color: '#cdccca', fontSize: 14, fontWeight: '600' },
  btnPrimary: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
    backgroundColor: '#4f98a3',
  },
  btnPrimaryTxt: { color: '#171614', fontSize: 14, fontWeight: '700' },
  statusTxt: { fontSize: 12, textAlign: 'center', paddingBottom: 14 },
});