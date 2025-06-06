
import { useProfileManager } from './useProfileManager';
import { useAuthState } from './useAuthState';
import { useAuthOperations } from './useAuthOperations';
import { getIsPremium, getIsAdmin } from './authUtils';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Monitorar mudanças no auth state para detectar desconexões
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[SUPABASE_AUTH] Auth state change:', event);
      
      if (event === 'SIGNED_OUT') {
        console.log('[SUPABASE_AUTH] Usuário deslogado');
        setUser(null);
        setProfile(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('[SUPABASE_AUTH] Token renovado com sucesso');
        // Manter o usuário logado, apenas atualizar o token
      } else if (event === 'SIGNED_IN' && session) {
        console.log('[SUPABASE_AUTH] Usuário logado via auth state change');
        // Este evento pode ser disparado pelo refresh, não precisamos reprocessar
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setProfile]);
  
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
