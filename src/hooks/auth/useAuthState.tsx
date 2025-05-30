
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
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AUTH_STATE] Erro ao obter sessão:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('[AUTH_STATE] Sessão encontrada:', session.user.id, session.user.email);
        const userData: User = {
          id: session.user.id,
          email: session.user.email || ''
        };
        console.log('[AUTH_STATE] ANTES setUser:', userData);
        setUser(userData);

        // Fetch user profile
        console.log('[AUTH_STATE] Iniciando fetchProfile para user:', session.user.id);
        const profileData = await fetchProfile(session.user.id);
        if (profileData) {
          console.log('[AUTH_STATE] Perfil carregado com sucesso. Plano:', profileData.plano_id);
          setProfile(profileData);
        } else {
          console.log('[AUTH_STATE] Não foi possível carregar ou criar perfil');
        }
        console.log('[AUTH_STATE] ANTES setLoading(false) - checkSession');
      } else {
        console.log('[AUTH_STATE] Nenhuma sessão ativa encontrada');
        setUser(null);
        setProfile(null);
      }
      
      console.log('[AUTH_STATE] setLoading(false) - checkSession final');
      setLoading(false);
    } catch (error) {
      console.error('[AUTH_STATE] Erro inesperado na verificação de sessão:', error);
      setLoading(false);
    }
  }, [fetchProfile, setProfile]);

  useEffect(() => {
    console.log('[AUTH_STATE] Inicializando gerenciamento de estado de autenticação');
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH_STATE] Mudança de estado de autenticação:', event);
      console.log('[AUTH_STATE] onAuthStateChange - session:', !!session, 'user:', !!session?.user);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[AUTH_STATE] Usuário logado:', session.user.id, session.user.email);
        const userData: User = {
          id: session.user.id,
          email: session.user.email || ''
        };
        console.log('[AUTH_STATE] ANTES setUser - onAuthStateChange:', userData);
        setUser(userData);

        // Buscar perfil após login
        setTimeout(async () => {
          console.log('[AUTH_STATE] Iniciando fetchProfile após login para user:', session.user.id);
          const profileData = await fetchProfile(session.user.id);
          if (profileData) {
            console.log('[AUTH_STATE] Perfil carregado após login. Plano:', profileData.plano_id);
            setProfile(profileData);
          }
          console.log('[AUTH_STATE] ANTES setLoading(false) - onAuthStateChange setTimeout');
          setLoading(false);
        }, 100);
        
      } else if (event === 'SIGNED_OUT') {
        console.log('[AUTH_STATE] Usuário deslogado');
        setUser(null);
        setProfile(null);
        console.log('[AUTH_STATE] ANTES setLoading(false) - SIGNED_OUT');
        setLoading(false);
      }
    });

    return () => {
      console.log('[AUTH_STATE] Limpando subscription');
      subscription.unsubscribe();
    };
  }, [checkSession, fetchProfile, setProfile]);

  return {
    user,
    setUser,
    loading,
    setLoading
  };
};
