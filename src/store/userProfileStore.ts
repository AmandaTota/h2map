import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileStore {
  profile: UserProfile | null;
  loading: boolean;
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (userId: string, file: File) => Promise<string>;
}

// Using non-strict typing to avoid type conflicts with auto-generated Supabase types
export const useUserProfileStore = create<UserProfileStore>((set, get): UserProfileStore => {
  return {
    profile: null,
    loading: false,

    loadProfile: async (userId: string) => {
      set({ loading: true });
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
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
            })
            .select()
            .single();

          if (!createError && newProfile) {
            set({ profile: newProfile as UserProfile });
          }
        } else {
          set({ profile: data as UserProfile });
        }
      } finally {
        set({ loading: false });
      }
    },

    updateProfile: async (userId: string, data: Partial<UserProfile>) => {
      try {
        const { error } = await supabase
          .from('user_profiles')
          // @ts-expect-error - update method not typed for dynamic tables
          .update(data)
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }

        // Reload profile
        await get().loadProfile(userId);
      } catch (error) {
        console.error('Update profile failed:', error);
        throw error;
      }
    },

    uploadAvatar: async (userId: string, file: File) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const avatarUrl = data.publicUrl;

        // Update profile with new avatar URL
        await get().updateProfile(userId, { avatar_url: avatarUrl });

        return avatarUrl;
      } catch (error) {
        console.error('Avatar upload failed:', error);
        throw error;
      }
    },
  };
});
