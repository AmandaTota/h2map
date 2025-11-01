import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface LocationStore {
  selectedLocation: Location | null;
  favorites: Location[];
  setSelectedLocation: (location: Location) => void;
  clearLocation: () => void;
  addFavorite: (location: Location) => void;
  removeFavorite: (locationName: string) => void;
  isFavorite: (locationName: string) => boolean;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      selectedLocation: null,
      favorites: [],
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      clearLocation: () => set({ selectedLocation: null }),
      addFavorite: (location) => set((state) => {
        const exists = state.favorites.some(fav => fav.name === location.name);
        if (exists) return state;
        return { favorites: [...state.favorites, location] };
      }),
      removeFavorite: (locationName) => set((state) => ({
        favorites: state.favorites.filter(fav => fav.name !== locationName)
      })),
      isFavorite: (locationName) => {
        return get().favorites.some(fav => fav.name === locationName);
      },
    }),
    {
      name: 'location-storage',
    }
  )
);
