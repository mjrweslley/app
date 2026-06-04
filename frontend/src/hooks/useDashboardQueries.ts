import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { devicesApi } from '../api/devices'
import type { Device, Summary } from '../api/devices'

export function useSummaryQuery() {
  return useQuery<Summary>({
    queryKey: ['summary'],
    queryFn: devicesApi.summary,
    refetchInterval: 10000,
  })
}

export function useDevicesQuery() {
  return useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: devicesApi.list,
    refetchInterval: 5000,
  })
}

export function useToggleDeviceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deviceId: string) => devicesApi.get(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
    },
  })
}