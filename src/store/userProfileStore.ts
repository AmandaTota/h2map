import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/lib/profileValidation';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileStore {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  loadProfile: (userId: string, forceRefresh?: boolean) => Promise<void>;
  updateProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (userId: string, file: File) => Promise<string>;
  clearProfile: () => void;
  clearError: () => void;
}

// Using non-strict typing to avoid type conflicts with auto-generated Supabase types
export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get): UserProfileStore => ({
      profile: null,
      loading: false,
      error: null,
      lastFetched: null,

      clearProfile: () => {
        set({ profile: null, lastFetched: null, error: null });
      },

      clearError: () => {
        set({ error: null });
      },

      loadProfile: async (userId: string, forceRefresh: boolean = false) => {
        // Cache for 5 minutes
        const CACHE_DURATION = 5 * 60 * 1000;
        const now = Date.now();
        const { lastFetched } = get();

        if (!forceRefresh && lastFetched && now - lastFetched < CACHE_DURATION) {
          // Use cached data
          return;
        }

        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error loading profile:', error);
            set({ error: 'Erro ao carregar perfil', loading: false });
            return;
          }

          if (!data) {
            // Create default profile if doesn't exist
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              // @ts-expect-error - insert method not typed for dynamic tables
              .insert({
                user_id: userId,
                full_name: null,
                bio: null,
                avatar_url: null,
                location: null,
                phone: null,
                website: null,
              })
              .select()
              .single();

            if (!createError && newProfile) {
              set({ 
                profile: newProfile as UserProfile,
                lastFetched: now,
                loading: false,
              });
            } else {
              set({ error: 'Erro ao criar perfil', loading: false });
            }
          } else {
            set({ 
              profile: data as UserProfile,
              lastFetched: now,
              loading: false,
            });
          }
        } catch (error) {
          console.error('Load profile failed:', error);
          set({ error: 'Erro ao carregar perfil', loading: false });
        }
      },

      updateProfile: async (userId: string, data: Partial<UserProfile>) => {
        try {
          set({ loading: true, error: null });

          const { error } = await supabase
            .from('user_profiles')
            // @ts-expect-error - update method not typed for dynamic tables
            .update(data)
            .eq('user_id', userId);

          if (error) {
            console.error('Error updating profile:', error);
            set({ error: 'Erro ao atualizar perfil', loading: false });
            throw error;
          }

          // Reload profile
          await get().loadProfile(userId, true);
        } catch (error) {
          console.error('Update profile failed:', error);
          set({ loading: false });
          throw error;
        }
      },

      uploadAvatar: async (userId: string, file: File) => {
        try {
          set({ loading: true, error: null });

          // Compress image before upload
          const compressedFile = await compressImage(file, 800, 800, 0.85);

          const fileExt = compressedFile.name.split('.').pop();
          const fileName = `${userId}-${Date.now()}.${fileExt}`;
          const filePath = `avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, compressedFile, { upsert: true });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            set({ error: 'Erro ao fazer upload da foto', loading: false });
            throw uploadError;
          }

          const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          const avatarUrl = data.publicUrl;

          // Update profile with new avatar URL
          await get().updateProfile(userId, { avatar_url: avatarUrl });

          set({ loading: false });
          return avatarUrl;
        } catch (error) {
          console.error('Avatar upload failed:', error);
          set({ loading: false });
          throw error;
        }
      },
    }),
    {
      name: 'user-profile-storage',
      partialize: (state) => ({
        profile: state.profile,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
