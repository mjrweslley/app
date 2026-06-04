import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { domoticaApi } from '../api/domotica';
import type {
  AtualizarDispositivoInput,
  CriarDispositivoInput,
  CriarRegraAlertaInput,
} from '../types/domains';

export function useResumoCasa() {
  return useQuery({
    queryKey: ['resumo-casa'],
    queryFn: domoticaApi.summary,
  });
}

export function useDispositivos() {
  return useQuery({
    queryKey: ['dispositivos'],
    queryFn: domoticaApi.devices,
  });
}

export function useDispositivo(deviceId: string) {
  return useQuery({
    queryKey: ['dispositivo', deviceId],
    queryFn: () => domoticaApi.device(deviceId),
    enabled: !!deviceId,
  });
}

export function useConsumoDispositivo(deviceId: string, hours = 24) {
  return useQuery({
    queryKey: ['consumo-dispositivo', deviceId, hours],
    queryFn: () => domoticaApi.deviceConsumption(deviceId, hours),
    enabled: !!deviceId,
  });
}

export function useAlertas() {
  return useQuery({
    queryKey: ['alertas'],
    queryFn: domoticaApi.alerts,
  });
}

export function useRegrasAlerta(deviceId?: string) {
  return useQuery({
    queryKey: ['regras-alerta', deviceId ?? 'todas'],
    queryFn: () => domoticaApi.alertRules(deviceId),
  });
}

export function useConfiguracao() {
  return useQuery({
    queryKey: ['configuracao'],
    queryFn: domoticaApi.config,
  });
}

export function useToggleDispositivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) => domoticaApi.toggleDevice(deviceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispositivos'] });
      qc.invalidateQueries({ queryKey: ['resumo-casa'] });
    },
  });
}

export function useCriarDispositivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CriarDispositivoInput) => domoticaApi.createDevice(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispositivos'] });
      qc.invalidateQueries({ queryKey: ['resumo-casa'] });
    },
  });
}

export function useActualizarDispositivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, body }: { deviceId: string; body: AtualizarDispositivoInput }) =>
      domoticaApi.updateDevice(deviceId, body),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['dispositivos'] });
      qc.invalidateQueries({ queryKey: ['dispositivo', variables.deviceId] });
      qc.invalidateQueries({ queryKey: ['resumo-casa'] });
    },
  });
}

export function useCriarRegraAlerta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CriarRegraAlertaInput) => domoticaApi.createAlertRule(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['regras-alerta'] });
      qc.invalidateQueries({ queryKey: ['alertas'] });
    },
  });
}