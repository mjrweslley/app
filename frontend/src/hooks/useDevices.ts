// frontend/src/hooks/useDevices.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { Device } from '../types';

export function useDevices() {
  return useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: () => apiClient.get('/api/devices').then(r => r.data),
    staleTime: 0,           // sempre considera stale → fetch imediato no mount
    refetchInterval: 5000,  // polling a cada 5 segundos
    refetchIntervalInBackground: true,
    refetchOnMount: 'always', // <-- CHAVE: força fetch logo no mount
    refetchOnWindowFocus: false,
  });
}

export function useSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: () => apiClient.get('/api/summary').then(r => r.data),
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}