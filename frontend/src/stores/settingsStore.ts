// store/settingsStore.ts
import { create } from 'zustand';

interface SettingsState {
  notificationsEnabled: boolean;
  currentUser: string;
  setNotificationsEnabled: (value: boolean) => void;
  setCurrentUser: (value: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  notificationsEnabled: true,
  currentUser: 'Administrador',
  setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
  setCurrentUser: (value) => set({ currentUser: value }),
}));