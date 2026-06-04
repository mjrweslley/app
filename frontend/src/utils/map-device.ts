import type { Device } from '../api/devices'
import type { ProjectRoom } from '../api/rooms'
import { ROOM_ZONES } from '@/src/utils/room-zones'

export type DeviceMarker = {
  id: string
  roomId: string
  x: number
  y: number
  isOn: boolean
  online: boolean
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function getDeviceIsOn(device: Device): boolean {
  if (device.type === 'blind') return (device.state?.position ?? 0) > 0
  return Boolean(device.state?.on)
}

export function projectDeviceToRoomZone(device: Device, rooms: ProjectRoom[]): DeviceMarker {
  const zone = ROOM_ZONES.find((z) => z.roomId === device.room_id)
  const room = rooms.find((r) => r.id === device.room_id)

  if (!zone) {
    return {
      id: device.id,
      roomId: device.room_id,
      x: 100,
      y: 100,
      isOn: getDeviceIsOn(device),
      online: device.online,
    }
  }

  if (zone.bounds && room && device.position) {
    const roomX = room.x ?? 0
    const roomY = room.y ?? 0
    const roomWidth = room.width ?? 1
    const roomDepth = room.depth ?? 1

    const relX = roomWidth > 0 ? (device.position.x - roomX) / roomWidth : 0.5
    const relY = roomDepth > 0 ? (device.position.z - roomY) / roomDepth : 0.5

    return {
      id: device.id,
      roomId: device.room_id,
      x: zone.bounds.x + clamp(relX, 0, 1) * zone.bounds.width,
      y: zone.bounds.y + clamp(relY, 0, 1) * zone.bounds.height,
      isOn: getDeviceIsOn(device),
      online: device.online,
    }
  }

  return {
    id: device.id,
    roomId: device.room_id,
    x: zone.center.x,
    y: zone.center.y,
    isOn: getDeviceIsOn(device),
    online: device.online,
  }
}