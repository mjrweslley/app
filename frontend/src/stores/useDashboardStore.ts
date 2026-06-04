import { create } from 'zustand';

type DashboardViewMode = 'house-3d' | 'room-focus' | 'device-panel';

type DashboardState = {
  selectedDeviceId: string | null;
  selectedRoomId: string | null;
  viewMode: DashboardViewMode;
  setSelectedDeviceId: (id: string | null) => void;
  setSelectedRoomId: (id: string | null) => void;
  setViewMode: (mode: DashboardViewMode) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedDeviceId: null,
  selectedRoomId: null,
  viewMode: 'house-3d',
  setSelectedDeviceId: (id) => set({ selectedDeviceId: id }),
  setSelectedRoomId: (id) => set({ selectedRoomId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
