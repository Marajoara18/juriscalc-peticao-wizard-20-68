
import { useProfileManager } from './useProfileManager';
import { useAuthState } from './useAuthState';
import { useAuthOperations } from './useAuthOperations';
import { getIsPremium, getIsAdmin } from './authUtils';

export const useSupabaseAuth = () => {
  const { profile, setProfile, fetchProfile } = useProfileManager();
  const { user, setUser, loading, setLoading } = useAuthState({ fetchProfile, setProfile });
  
  const authOperations = useAuthOperations({
    setUser,
    setProfile,
    setLoading,
    fetchProfile
  });

  // Derived states
  const isPremium = getIsPremium(profile);
  const isAdmin = getIsAdmin(profile);
  
  console.log('SUPABASE_AUTH: Estado atual:', {
    user: !!user,
    profile: !!profile,
    loading,
    isPremium,
    isAdmin,
    planId: profile?.plano_id
  });

  return {
    user,
    profile,
    setProfile,
    loading,
    isPremium,
    isAdmin,
    ...authOperations,
  };
};
