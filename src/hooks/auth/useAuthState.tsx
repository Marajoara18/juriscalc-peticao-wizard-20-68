import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Profile } from './types';

interface UseAuthStateProps {
  fetchProfile: (userId: string) => Promise<Profile | null>;
  setProfile: (profile: Profile | null) => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export const useAuthState = ({ fetchProfile, setProfile }: UseAuthStateProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const checkInProgress = useRef(false);
  const sessionCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionCheckTimeout.current) {
        clearTimeout(sessionCheckTimeout.current);
      }
    };
  }, []);

  const fetchProfileWithRetry = useCallback(async (userId: string, attempt = 0): Promise<Profile | null> => {
    try {
      console.log(`[AUTH_STATE] Tentando buscar perfil (${attempt + 1}/${MAX_RETRIES})...`);
      
      const profile = await fetchProfile(userId);
      
      if (profile) {
        console.log('[AUTH_STATE] Perfil encontrado com sucesso');
        setError(null);
        setRetryCount(0);
        return profile;
      }

      // Se não encontrou o perfil, esperar um pouco antes de tentar novamente
      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY * Math.pow(2, attempt); // Exponential backoff
        console.log(`[AUTH_STATE] Perfil não encontrado, aguardando ${delay}ms antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        setRetryCount(attempt + 1);
        return fetchProfileWithRetry(userId, attempt + 1);
      }

      console.log('[AUTH_STATE] Perfil não encontrado após todas as tentativas');
      setError('Não foi possível carregar seu perfil. Por favor, tente fazer login novamente.');
      return null;
    } catch (error: any) {
      console.error(`[AUTH_STATE] Erro ao buscar perfil (tentativa ${attempt + 1}/${MAX_RETRIES}):`, error);
      
      // Se for erro de timeout ou conexão, tentar novamente
      const isTimeoutError = error.message.includes('tempo limite') || error.message.includes('timeout');
      const isConnectionError = error.message.includes('conexão') || error.message.includes('connection');
      
      if ((isTimeoutError || isConnectionError) && attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY * Math.pow(2, attempt); // Exponential backoff
        console.log(`[AUTH_STATE] Erro de ${isTimeoutError ? 'timeout' : 'conexão'}, aguardando ${delay}ms antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        setRetryCount(attempt + 1);
        return fetchProfileWithRetry(userId, attempt + 1);
      }

      setError('Não foi possível carregar seu perfil. Por favor, verifique sua conexão e tente novamente.');
      return null;
    }
  }, [fetchProfile]);

  const checkSession = useCallback(async () => {
    if (checkInProgress.current) {
      console.log('[AUTH_STATE] Já existe uma verificação em andamento, aguardando...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return checkSession();
    }

    try {
      checkInProgress.current = true;
      console.log('[AUTH_STATE] Verificando sessão...');
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          telefone: session.user.user_metadata?.telefone,
          user_metadata: session.user.user_metadata
        };
        setUser(userData);

        const profileData = await fetchProfileWithRetry(session.user.id);
        if (profileData) {
          setProfile(profileData);
        }
      } else {
        console.log('[AUTH_STATE] Nenhuma sessão ativa');
        setUser(null);
        setProfile(null);
      }
    } catch (error: any) {
      console.error('[AUTH_STATE] Erro ao verificar sessão:', error);
      setError(error.message);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
      checkInProgress.current = false;
    }
  }, [fetchProfileWithRetry, setLoading, setProfile, setUser]);

  useEffect(() => {
    let isSubscribed = true;
    let sessionCheckTimeout: NodeJS.Timeout | null = null;

    const initialize = async () => {
      if (!isSubscribed) return;
      await checkSession();
    };

    initialize();

    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isSubscribed) return;
      console.log('[AUTH_STATE] Evento de autenticação:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        if (checkInProgress.current) {
          console.log('[AUTH_STATE] Já existe uma verificação em andamento, aguardando...');
          if (sessionCheckTimeout) {
            clearTimeout(sessionCheckTimeout);
          }
          sessionCheckTimeout = setTimeout(() => {
            checkSession();
          }, 1000);
          return;
        }

        try {
          checkInProgress.current = true;
          setLoading(true);
          setError(null);
          
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            telefone: session.user.user_metadata?.telefone,
            user_metadata: session.user.user_metadata
          };
          setUser(userData);

          const profileData = await fetchProfileWithRetry(session.user.id);
          if (profileData) {
            setProfile(profileData);
          }
        } finally {
          setLoading(false);
          checkInProgress.current = false;
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[AUTH_STATE] Usuário deslogado');
        setUser(null);
        setProfile(null);
        setError(null);
        setLoading(false);
        checkInProgress.current = false;
      }
    });

    return () => {
      console.log('[AUTH_STATE] Limpando subscription e timeout');
      isSubscribed = false;
      subscription.unsubscribe();
      if (sessionCheckTimeout) {
        clearTimeout(sessionCheckTimeout);
      }
      checkInProgress.current = false;
    };
  }, [checkSession, fetchProfileWithRetry, setProfile]);

  return {
    user,
    setUser,
    loading,
    setLoading,
    error,
    retryCount,
    checkSession
  };
};
