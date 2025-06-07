
import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, Profile } from './types';
import { toast } from 'sonner';
import { useProfileManager } from './useProfileManager';
import { getIsPremium, getIsAdmin } from './authUtils';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileError: Error | null;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any; }>;
  signOut: () => Promise<void>;
  isPremium: boolean;
  isAdmin: boolean;
  retryCount: number;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { fetchProfile, createProfile } = useProfileManager();
  const operationInProgress = useRef(false);

  const handleProfileLogic = useCallback(async (authUser: { id: string; email?: string; user_metadata: any; }) => {
    if (operationInProgress.current) {
      console.log('[AUTH] Operação de perfil já em andamento, ignorando.');
      return;
    }
    
    operationInProgress.current = true;
    setLoading(true);
    setProfileError(null);

    try {
      console.log('[AUTH] Iniciando busca de perfil para usuário:', authUser.id);
      
      // Aumentar timeout para 30 segundos
      const profilePromise = fetchProfile(authUser.id);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 30000)
      );
      
      let userProfile = await Promise.race([profilePromise, timeoutPromise])
        .catch(async (error) => {
          console.warn('[AUTH] Erro ao buscar perfil:', error);
          setRetryCount(prev => prev + 1);
          
          // Se for timeout e ainda não tentamos muito, tentar novamente
          if (error.message === 'Profile fetch timeout' && retryCount < 2) {
            console.log('[AUTH] Timeout na busca do perfil, tentando novamente...');
            await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s
            return await fetchProfile(authUser.id);
          }
          throw error;
        });

      if (!userProfile && retryCount < 2) {
        console.log('[AUTH] Perfil não encontrado, criando novo...');
        userProfile = await createProfile({
          id: authUser.id,
          email: authUser.email || '',
          nome_completo: authUser.user_metadata?.nome_completo || authUser.email?.split('@')[0] || 'Usuário',
          telefone: authUser.user_metadata?.telefone,
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
        });
      }

      if (userProfile) {
        console.log('[AUTH] Perfil carregado com sucesso:', userProfile.id);
        setProfile(userProfile);
        setProfileError(null);
        setRetryCount(0);
      } else {
        throw new Error('Falha ao buscar ou criar o perfil do usuário.');
      }

    } catch (e: any) {
      console.error('[AUTH] Erro na lógica de perfil:', e.message);
      setProfileError(e instanceof Error ? e : new Error('Erro desconhecido ao buscar perfil'));
      setProfile(null);
    } finally {
      setLoading(false);
      operationInProgress.current = false;
    }
  }, [fetchProfile, createProfile, retryCount]);
  
  const checkSession = useCallback(async () => {
    if (operationInProgress.current) {
      console.log('[AUTH] Verificação de sessão já em andamento');
      return;
    }

    try {
      operationInProgress.current = true;
      setLoading(true);
      setProfileError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (session?.user) {
        setUser(session.user as User);
        await handleProfileLogic(session.user);
      } else {
        console.log('[AUTH] Nenhuma sessão ativa');
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('[AUTH] Erro ao verificar sessão:', error);
      setProfileError(error instanceof Error ? error : new Error(error.message));
      setUser(null);
      setProfile(null);
      setLoading(false);
    } finally {
      operationInProgress.current = false;
    }
  }, [handleProfileLogic]);

  useEffect(() => {
    let isSubscribed = true;

    const initialize = async () => {
      if (!isSubscribed) return;
      await checkSession();
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isSubscribed) return;
        console.log('[AUTH] Evento de autenticação:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user as User);
          await handleProfileLogic(session.user);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setUser(null);
          setProfileError(null);
          setLoading(false);
          setRetryCount(0);
          operationInProgress.current = false;
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[AUTH] Token renovado com sucesso');
          // Não fazer nada especial, apenas log
        }
      }
    );

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [handleProfileLogic, checkSession]);

  const signIn = async (email: string, password: string) => {
    let result: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;
    try {
      setLoading(true);
      result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) {
        toast.error(result.error.message);
        return { data: null, error: result.error };
      }
      return { data: result.data, error: null };
    } finally {
      // O loading será controlado pelo handleProfileLogic
      if (!result?.data?.user) setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setProfileError(null);
      setRetryCount(0);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    profileError,
    signIn,
    signOut,
    isPremium: getIsPremium(profile),
    isAdmin: getIsAdmin(profile),
    retryCount,
    checkSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within an AuthProvider');
  }
  return context;
};
