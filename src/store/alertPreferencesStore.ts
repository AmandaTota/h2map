import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AlertPreferences {
  // Temperatura
  highTempThreshold: number; // padrão 30°C
  lowTempThreshold: number; // padrão 10°C
  enableTempAlerts: boolean;

  // Vento
  strongWindThreshold: number; // padrão 8.3 m/s (30 km/h)
  enableWindAlerts: boolean;

  // Chuva
  enableRainAlerts: boolean;

  // Poluição do Ar
  enableAirQualityAlerts: boolean;
  airQualityThreshold: number; // padrão 3 (moderado)

  // Radiação Solar
  enableSolarAlerts: boolean;

  // Tempestade
  enableThunderstormAlerts: boolean;

  // Umidade
  enableHumidityAlerts: boolean;
  highHumidityThreshold: number; // padrão 80
}

interface AlertPreferencesStore {
  preferences: AlertPreferences;
  setPreferences: (prefs: Partial<AlertPreferences>) => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: AlertPreferences = {
  highTempThreshold: 30,
  lowTempThreshold: 10,
  enableTempAlerts: true,
  strongWindThreshold: 8.3,
  enableWindAlerts: true,
  enableRainAlerts: true,
  enableAirQualityAlerts: true,
  airQualityThreshold: 3,
  enableSolarAlerts: true,
  enableThunderstormAlerts: true,
  enableHumidityAlerts: true,
  highHumidityThreshold: 80,
};

export const useAlertPreferences = create<AlertPreferencesStore>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFERENCES,
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      resetPreferences: () =>
        set({ preferences: DEFAULT_PREFERENCES }),
    }),
    {
      name: 'alert-preferences-storage',
    }
  )
);
