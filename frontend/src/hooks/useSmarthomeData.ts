import { useQuery, useQueryClient } from '@tanstack/react-query';
import { devicesApi, type Device } from '../api/devices';
import { mappingsApi } from '../api/mappings';
import { roomsApi } from '../api/rooms';

// Constante de configuração para o ciclo de vida dos dados (em ms)
const REFRESH_INTERVAL = 30000; // 30 segundos
const STALE_TIME = 10000;        // 10 segundos

export function useSmarthomeData() {
  const queryClient = useQueryClient();

  // O uso de 'initialData' garante que o dashboard nunca fica em estado 
  // de "loading eterno" para o utilizador, apresentando uma UI vazia em vez de um spinner.
  
  const rooms = useQuery({ 
    queryKey: ['project-rooms'], 
    queryFn: roomsApi.list,
    initialData: [],
    staleTime: STALE_TIME
  });

  const devices = useQuery({ 
    queryKey: ['devices'], 
    queryFn: devicesApi.list,
    initialData: [],
    refetchInterval: REFRESH_INTERVAL,
    staleTime: STALE_TIME
  });

  const summary = useQuery({ 
    queryKey: ['summary'], 
    queryFn: devicesApi.summary,
    // O summary não tem initialData array, então usamos um objeto de fallback seguro
    initialData: {
      rooms_count: 0, devices_count: 0, mapped_devices_count: 0,
      unmapped_devices_count: 0, online_count: 0, lights_on: 0,
      total_power_w: 0, avg_temperature_c: null, alerts_unacked: 0
    },
    refetchInterval: REFRESH_INTERVAL
  });

  const mappings = useQuery({ 
    queryKey: ['room-mappings'], 
    queryFn: mappingsApi.list,
    initialData: [],
    staleTime: STALE_TIME
  });

  // Utilitário para forçar sincronização global manual (ex: botão "Sync" ou "Add")
  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['project-rooms'] }),
      queryClient.invalidateQueries({ queryKey: ['devices'] }),
      queryClient.invalidateQueries({ queryKey: ['summary'] }),
      queryClient.invalidateQueries({ queryKey: ['room-mappings'] }),
    ]);
  };

  return { 
    rooms, 
    devices, 
    summary, 
    mappings, 
    refetchAll,
    // Estado unificado para facilitar o controlo de UI no HomeScreen
    isLoading: rooms.isLoading || devices.isLoading || summary.isLoading,
    isError: rooms.isError || devices.isError
  };
}