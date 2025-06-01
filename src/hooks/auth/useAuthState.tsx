
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Profile } from './types';

interface UseAuthStateProps {
  fetchProfile: (userId: string) => Promise<Profile | null>;
  setProfile: (profile: Profile | null) => void;
}

export const useAuthState = ({ fetchProfile, setProfile }: UseAuthStateProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    console.log('[AUTH_STATE] Verificando sessão...');
    setLoading(true); // Ensure loading is true at the start
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AUTH_STATE] Erro ao obter sessão:', error);
        setUser(null);
        setProfile(null);
        return; // Exit early on error
      }

      if (session?.user) {
        console.log('[AUTH_STATE] Sessão encontrada:', session.user.id, session.user.email);
        const userData: User = {
          id: session.user.id,
          email: session.user.email || ''
        };
        setUser(userData);

        // Fetch user profile
        console.log('[AUTH_STATE] Iniciando fetchProfile para user (checkSession):', session.user.id);
        try {
          const profileData = await fetchProfile(session.user.id);
          if (profileData) {
            console.log('[AUTH_STATE] Perfil carregado com sucesso (checkSession). Plano:', profileData.plano_id);
            setProfile(profileData);
          } else {
            console.log('[AUTH_STATE] Não foi possível carregar ou criar perfil (checkSession)');
            // Consider if user should be nullified if profile is essential and fails to load/create
            // setProfile(null); // Already null by default if fetch fails
          }
        } catch (profileError) {
          console.error('[AUTH_STATE] Erro ao buscar/criar perfil (checkSession):', profileError);
          // setProfile(null); // Ensure profile is null on error
        }
      } else {
        console.log('[AUTH_STATE] Nenhuma sessão ativa encontrada');
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('[AUTH_STATE] Erro inesperado na verificação de sessão:', error);
      setUser(null);
      setProfile(null);
    } finally {
      // Ensure loading is set to false regardless of outcome
      console.log('[AUTH_STATE] setLoading(false) - checkSession final');
      setLoading(false);
    }
  }, [fetchProfile, setProfile]);

  useEffect(() => {
    console.log('[AUTH_STATE] Inicializando gerenciamento de estado de autenticação');
    checkSession(); // Initial check

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH_STATE] Mudança de estado de autenticação:', event);
      console.log('[AUTH_STATE] onAuthStateChange - session:', !!session, 'user:', !!session?.user);
      
      // Always set loading to true when auth state changes, except for initial load handled by checkSession
      // This might cause brief loading indicators on background token refreshes, adjust if needed.
      // setLoading(true); 

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[AUTH_STATE] Usuário logado (event):', session.user.id, session.user.email);
        const userData: User = {
          id: session.user.id,
          email: session.user.email || ''
        };
        setUser(userData);

        // Buscar perfil após login (REMOVED setTimeout)
        console.log('[AUTH_STATE] Iniciando fetchProfile após login para user (event):', session.user.id);
        try {
          const profileData = await fetchProfile(session.user.id);
          if (profileData) {
            console.log('[AUTH_STATE] Perfil carregado após login (event). Plano:', profileData.plano_id);
            setProfile(profileData);
          } else {
             console.log('[AUTH_STATE] Perfil não carregado ou criado após login (event).');
             // setProfile(null); // Ensure profile is null if fetch fails
          }
        } catch (profileError) {
           console.error('[AUTH_STATE] Erro ao buscar/criar perfil após login (event):', profileError);
           // setProfile(null); // Ensure profile is null on error
        } finally {
           // Set loading false AFTER attempting to fetch profile for SIGNED_IN event
           console.log('[AUTH_STATE] setLoading(false) - Após fetchProfile em SIGNED_IN (event)');
           setLoading(false); 
        }
        
      } else if (event === 'SIGNED_OUT') {
        console.log('[AUTH_STATE] Usuário deslogado (event)');
        setUser(null);
        setProfile(null);
        // Set loading false immediately on SIGNED_OUT
        console.log('[AUTH_STATE] setLoading(false) - SIGNED_OUT (event)');
        setLoading(false);
      } else if (event === 'INITIAL_SESSION') {
        // Handled by checkSession initially, but subsequent INITIAL_SESSION events might occur
        // Potentially re-run profile fetch logic if needed, or just ensure loading state is correct.
        // If session exists, profile should have been fetched by checkSession or SIGNED_IN.
        // If session is null, SIGNED_OUT logic handles it.
        // Generally, just ensuring loading is false might be sufficient here if checkSession covers the initial state.
        if (!session?.user) {
          setUser(null);
          setProfile(null);
        }
        // setLoading(false); // Ensure loading is false after initial events are processed
      } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
         // User data might change, potentially refetch profile if necessary
         // For now, just ensure loading state isn't stuck
         // setLoading(false); // Might not be needed if loading wasn't set to true for these events
         console.log(`[AUTH_STATE] Evento ${event} recebido.`);
         // Optionally refetch profile if user metadata could change:
         // if (event === 'USER_UPDATED' && session?.user) { fetchProfile(session.user.id).then(setProfile); }
      }
    });

    return () => {
      console.log('[AUTH_STATE] Limpando subscription');
      subscription.unsubscribe();
    };
  }, [checkSession, fetchProfile, setProfile]); // checkSession added as dependency

  return {
    user,
    setUser,
    loading,
    setLoading // Exposing setLoading might be needed temporarily if consumers need fine control
  };
};

