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
  serverUrl: process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://smarthub.local:8080',
  alertThresholdW: 2000,
  setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
  setCurrentUser: (value) => set({ currentUser: value }),
  setServerUrl: (value) => set({ serverUrl: value.replace(/\/$/, '') }),
  setAlertThreshold: (value) => set({ alertThresholdW: value }),
}));
