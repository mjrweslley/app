// frontend/src/stores/settingsStore.ts
import { create } from 'zustand';

interface SettingsState {
  notificationsEnabled: boolean;
  currentUser: string;
  serverUrl: string;
  alertThresholdW: number;
  setNotificationsEnabled: (value: boolean) => void;
  setCurrentUser: (value: string) => void;
  setServerUrl: (value: string) => void;
  setAlertThreshold: (value: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  notificationsEnabled: true,
  currentUser: 'Administrador',
  serverUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.1.100:8081',
  alertThresholdW: 2000,
  setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
  setCurrentUser: (value) => set({ currentUser: value }),
  setServerUrl: (value) => set({ serverUrl: value }),
  setAlertThreshold: (value) => set({ alertThresholdW: value }),
}));