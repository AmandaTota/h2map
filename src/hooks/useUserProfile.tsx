import { useEffect } from "react";
import { useUserProfileStore } from "@/store/userProfileStore";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Custom hook to manage user profile with automatic loading
 *
 * @param user - Supabase user object
 * @param autoLoad - Whether to automatically load profile on mount (default: true)
 * @returns Profile data and utility functions
 *
 * @example
 * ```tsx
 * const { profile, isLoading, updateProfile, refresh } = useUserProfile(user);
 *
 * if (isLoading) return <Spinner />;
 *
 * return <div>{profile?.full_name}</div>;
 * ```
 */
export const useUserProfile = (
  user: SupabaseUser | null,
  autoLoad: boolean = true,
) => {
  const {
    profile,
    loading,
    error,
    loadProfile,
    updateProfile,
    uploadAvatar,
    clearProfile,
    clearError,
  } = useUserProfileStore();

  useEffect(() => {
    if (user && autoLoad) {
      loadProfile(user.id);
    } else if (!user) {
      clearProfile();
    }
  }, [user, autoLoad, loadProfile, clearProfile]);

  const refresh = () => {
    if (user) {
      loadProfile(user.id, true); // Force refresh
    }
  };

  const update = async (data: Parameters<typeof updateProfile>[1]) => {
    if (!user) throw new Error("User not authenticated");
    return updateProfile(user.id, data);
  };

  const changeAvatar = async (file: File) => {
    if (!user) throw new Error("User not authenticated");
    return uploadAvatar(user.id, file);
  };

  return {
    profile,
    isLoading: loading,
    error,
    updateProfile: update,
    uploadAvatar: changeAvatar,
    refresh,
    clearError,
    hasProfile: !!profile,
  };
};

/**
 * Hook to get profile display name with fallback
 *
 * @param user - Supabase user object
 * @returns Display name string
 *
 * @example
 * ```tsx
 * const displayName = useProfileDisplayName(user);
 * return <h1>Olá, {displayName}!</h1>;
 * ```
 */
export const useProfileDisplayName = (user: SupabaseUser | null): string => {
  const { profile } = useUserProfileStore();

  if (!user) return "Visitante";

  return profile?.full_name || user.email?.split("@")[0] || "Usuário";
};

/**
 * Hook to get profile initials for avatar fallback
 *
 * @param user - Supabase user object
 * @returns Initials string (2 chars max)
 *
 * @example
 * ```tsx
 * const initials = useProfileInitials(user);
 * return <AvatarFallback>{initials}</AvatarFallback>;
 * ```
 */
export const useProfileInitials = (user: SupabaseUser | null): string => {
  const displayName = useProfileDisplayName(user);

  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Hook to check if profile is complete
 *
 * @param user - Supabase user object
 * @returns Boolean indicating if required fields are filled
 *
 * @example
 * ```tsx
 * const isComplete = useProfileComplete(user);
 * if (!isComplete) return <CompleteProfileBanner />;
 * ```
 */
export const useProfileComplete = (user: SupabaseUser | null): boolean => {
  const { profile } = useUserProfileStore();

  if (!user || !profile) return false;

  // Check required fields
  return !!(profile.full_name && profile.full_name.trim().length >= 2);
};

/**
 * Hook to get profile completion percentage
 *
 * @param user - Supabase user object
 * @returns Number between 0-100 representing completion percentage
 *
 * @example
 * ```tsx
 * const completion = useProfileCompletion(user);
 * return <ProgressBar value={completion} />;
 * ```
 */
export const useProfileCompletion = (user: SupabaseUser | null): number => {
  const { profile } = useUserProfileStore();

  if (!user || !profile) return 0;

  const fields = [
    !!profile.full_name,
    !!profile.bio,
    !!profile.avatar_url,
    !!profile.location,
    !!profile.phone,
    !!profile.website,
  ];

  const filledFields = fields.filter(Boolean).length;
  const totalFields = fields.length;

  return Math.round((filledFields / totalFields) * 100);
};
