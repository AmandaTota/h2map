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
  history: Location[];
  setSelectedLocation: (location: Location) => void;
  clearLocation: () => void;
  addFavorite: (location: Location) => Promise<void>;
  removeFavorite: (locationName: string) => Promise<void>;
  isFavorite: (locationName: string) => boolean;
  loadFavorites: () => Promise<void>;
  addToHistory: (location: Location) => void;
  clearHistory: () => void;
  getGeolocation: () => Promise<Location | null>;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      selectedLocation: null,
      favorites: [],
      history: [],
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      clearLocation: () => set({ selectedLocation: null }),
      addToHistory: (location) => {
        set((state) => {
          // Evitar duplicatas - remove se já existe
          const filtered = state.history.filter(h => h.name !== location.name);
          // Adiciona no começo e limita a 10 itens
          return { history: [location, ...filtered].slice(0, 10) };
        });
      },
      clearHistory: () => set({ history: [] }),
      getGeolocation: async () => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            console.warn('Geolocation not supported');
            resolve(null);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                // Usar reverse geocoding para obter nome da cidade
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                  {
                    headers: {
                      'Accept-Language': 'pt-BR'
                    }
                  }
                );
                const data = await response.json();
                const cityName = data.address?.city || data.address?.town || data.address?.county || 'Localização Atual';
                
                console.log('Geolocation success:', { latitude, longitude, cityName });
                
                resolve({
                  lat: latitude,
                  lng: longitude,
                  name: cityName
                });
              } catch (error) {
                console.error('Error reverse geocoding:', error);
                resolve({
                  lat: latitude,
                  lng: longitude,
                  name: 'Minha Localização'
                });
              }
            },
            (error) => {
              console.error('Geolocation error code:', error.code, 'message:', error.message);
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });
      },
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
