// frontend/src/hooks/useDevices.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { Device } from '../types/domains';

export function useDevices() {
  return useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: () =>
      apiClient.get<Device[]>('/api/devices').then((r) => r.data),
    staleTime: 0,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

export function useSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: () =>
      apiClient.get<Record<string, unknown>>('/api/summary').then((r) => r.data),
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}