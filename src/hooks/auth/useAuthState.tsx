
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
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('[AUTH_STATE] Sessão encontrada:', session.user.id, session.user.email);
        const userData: User = {
          id: session.user.id,
          email: session.user.email || ''
        };
        setUser(userData);

        // Fetch user profile com timeout de segurança
        console.log('[AUTH_STATE] Buscando perfil...');
        try {
          const profileData = await Promise.race([
            fetchProfile(session.user.id),
            new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
            )
          ]);
          
          if (profileData) {
            console.log('[AUTH_STATE] Perfil carregado:', profileData.plano_id);
            setProfile(profileData);
          } else {
            console.log('[AUTH_STATE] Perfil não encontrado, continuando sem perfil');
            setProfile(null);
          }
        } catch (profileError) {
          console.error('[AUTH_STATE] Erro ao buscar perfil:', profileError);
          // Continua com usuário logado mesmo sem perfil
          setProfile(null);
        }
      } else {
        console.log('[AUTH_STATE] Nenhuma sessão ativa');
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('[AUTH_STATE] Erro inesperado:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, setProfile]);

  useEffect(() => {
    console.log('[AUTH_STATE] Inicializando...');
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH_STATE] Evento de auth:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        console.log('[AUTH_STATE] Usuário logado:', session.user.email);
        
        const userData: User = {
          id: session.user.id,
          email: session.user.email || ''
        };
        setUser(userData);

        try {
          const profileData = await Promise.race([
            fetchProfile(session.user.id),
            new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
            )
          ]);
          
          if (profileData) {
            setProfile(profileData);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('[AUTH_STATE] Erro ao buscar perfil após login:', error);
          setProfile(null);
        } finally {
          setLoading(false);
        }
        
      } else if (event === 'SIGNED_OUT') {
        console.log('[AUTH_STATE] Usuário deslogado');
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('[AUTH_STATE] Token atualizado');
        // Não alterar loading para refresh de token
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
