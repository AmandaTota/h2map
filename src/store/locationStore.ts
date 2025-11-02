import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

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
  addFavorite: (location: Location) => Promise<void>;
  removeFavorite: (locationName: string) => Promise<void>;
  isFavorite: (locationName: string) => boolean;
  loadFavorites: () => Promise<void>;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      selectedLocation: null,
      favorites: [],
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      clearLocation: () => set({ selectedLocation: null }),
      loadFavorites: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('favorite_locations')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading favorites:', error);
          return;
        }

        const favorites = data?.map(fav => ({
          lat: Number(fav.latitude),
          lng: Number(fav.longitude),
          name: fav.name
        })) || [];

        set({ favorites });
      },
      addFavorite: async (location) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('User must be logged in to add favorites');
          return;
        }

        const exists = get().favorites.some(fav => fav.name === location.name);
        if (exists) return;

        const { error } = await supabase
          .from('favorite_locations')
          .insert({
            user_id: user.id,
            name: location.name,
            latitude: location.lat,
            longitude: location.lng
          });

        if (error) {
          console.error('Error adding favorite:', error);
          return;
        }

        set((state) => ({ favorites: [...state.favorites, location] }));
      },
      removeFavorite: async (locationName) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('favorite_locations')
          .delete()
          .eq('user_id', user.id)
          .eq('name', locationName);

        if (error) {
          console.error('Error removing favorite:', error);
          return;
        }

        set((state) => ({
          favorites: state.favorites.filter(fav => fav.name !== locationName)
        }));
      },
      isFavorite: (locationName) => {
        return get().favorites.some(fav => fav.name === locationName);
      },
    }),
    {
      name: 'location-storage',
    }
  )
);
