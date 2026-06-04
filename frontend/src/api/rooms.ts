import { request } from './client'

export type ProjectRoom = {
  id: string
  name: string
  x?: number
  y?: number
  width?: number
  depth?: number
  height?: number
  color?: string
}

export const roomsApi = {
  list: () => request<ProjectRoom[]>('/project-rooms'),
}