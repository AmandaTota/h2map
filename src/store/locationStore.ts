import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface LocationStore {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      selectedLocation: null,
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      clearLocation: () => set({ selectedLocation: null }),
    }),
    {
      name: 'location-storage',
    }
  )
);
