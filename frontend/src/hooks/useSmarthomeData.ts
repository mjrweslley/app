import { useQuery, useQueryClient } from '@tanstack/react-query';
import { devicesApi, type Device } from '../api/devices';
import { mappingsApi } from '../api/mappings';
import { roomsApi } from '../api/rooms';

// FIX: staleTime=0 garante fetch imediato no mount;
// refetchInterval curto mantém estado actualizado a cada 5s
const REFRESH_INTERVAL = 5000;  // 5 segundos
const STALE_TIME = 0;           // sem cache stale — fetch imediato ao montar

export function useSmarthomeData() {
  const queryClient = useQueryClient();

  const rooms = useQuery({ 
    queryKey: ['project-rooms'], 
    queryFn: roomsApi.list,
    initialData: [],
    staleTime: 30000 // rooms mudam pouco
  });

  const devices = useQuery({ 
    queryKey: ['devices'], 
    queryFn: devicesApi.list,
    initialData: [],
    refetchInterval: REFRESH_INTERVAL,
    staleTime: STALE_TIME,
    refetchIntervalInBackground: false,
  });

  const summary = useQuery({ 
    queryKey: ['summary'], 
    queryFn: devicesApi.summary,
    initialData: {
      rooms_count: 0, devices_count: 0, mapped_devices_count: 0,
      unmapped_devices_count: 0, online_count: 0, lights_on: 0,
      total_power_w: 0, avg_temperature_c: null, alerts_unacked: 0
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: STALE_TIME,
    refetchIntervalInBackground: false,
  });

  const mappings = useQuery({ 
    queryKey: ['room-mappings'], 
    queryFn: mappingsApi.list,
    initialData: [],
    staleTime: 30000
  });

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
    isLoading: rooms.isLoading || devices.isLoading || summary.isLoading,
    isError: rooms.isError || devices.isError
  };
}
