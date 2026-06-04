import { useQuery } from '@tanstack/react-query'
import { devicesApi } from '../api/devices'
import { mappingsApi } from '../api/mappings'
import { roomsApi } from '../api/rooms'

export function useSmarthomeData() {
  const rooms = useQuery({ queryKey: ['project-rooms'], queryFn: roomsApi.list })
  const devices = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list })
  const summary = useQuery({ queryKey: ['summary'], queryFn: devicesApi.summary })
  const mappings = useQuery({ queryKey: ['room-mappings'], queryFn: mappingsApi.list })
  return { rooms, devices, summary, mappings }
}