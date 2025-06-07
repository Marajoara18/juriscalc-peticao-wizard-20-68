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
  signUp: (email: string, password: string, nome: string, telefone?: string) => Promise<{ data: any; error: any; }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: any; }>;
  setProfile: (profile: Profile | null) => void;
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
    setProfileError(null);

    try {
      console.log('[AUTH] Iniciando busca de perfil para usuário:', authUser.id);
      
      // Buscar perfil com timeout mais curto (5 segundos)
      const profilePromise = fetchProfile(authUser.id);
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      let userProfile = await Promise.race([profilePromise, timeoutPromise])
        .catch(async (error) => {
          console.warn('[AUTH] Erro ao buscar perfil, criando novo perfil...', error);
          // Se houver erro ou timeout, criar perfil diretamente
          return await createProfile({
            id: authUser.id,
            email: authUser.email || '',
            nome_completo: authUser.user_metadata?.nome_completo || authUser.email?.split('@')[0] || 'Usuário',
            telefone: authUser.user_metadata?.telefone,
            data_criacao: new Date().toISOString(),
            data_atualizacao: new Date().toISOString(),
          });
        });

      // Se ainda não temos perfil, tentar criar
      if (!userProfile) {
        console.log('[AUTH] Criando novo perfil...');
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
        console.log('[AUTH] Perfil carregado/criado com sucesso:', userProfile.id);
        setProfile(userProfile);
        setProfileError(null);
        setRetryCount(0);
        setLoading(false); // CRÍTICO: definir loading como false aqui
      } else {
        // Se ainda não conseguiu criar o perfil, definir um perfil básico para não bloquear
        const basicProfile: Profile = {
          id: authUser.id,
          email: authUser.email || '',
          nome_completo: authUser.user_metadata?.nome_completo || authUser.email?.split('@')[0] || 'Usuário',
          telefone: authUser.user_metadata?.telefone || null,
          plano_id: 'gratuito',
          limite_calculos_salvos: 6,
          limite_peticoes_salvas: 1,
          data_criacao: new Date().toISOString(),
          data_atualizacao: new Date().toISOString(),
          data_assinatura: null,
          periodo_assinatura: null,
          status_assinatura: null,
          stripe_customer_id: null,
          subscription_id: null
        };
        console.log('[AUTH] Usando perfil básico temporário');
        setProfile(basicProfile);
        setProfileError(null);
        setLoading(false);
      }

    } catch (e: any) {
      console.error('[AUTH] Erro na lógica de perfil:', e.message);
      // Mesmo com erro, não bloquear o login - criar perfil básico
      const basicProfile: Profile = {
        id: authUser.id,
        email: authUser.email || '',
        nome_completo: authUser.user_metadata?.nome_completo || authUser.email?.split('@')[0] || 'Usuário',
        telefone: authUser.user_metadata?.telefone || null,
        plano_id: 'gratuito',
        limite_calculos_salvos: 6,
        limite_peticoes_salvas: 1,
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString(),
        data_assinatura: null,
        periodo_assinatura: null,
        status_assinatura: null,
        stripe_customer_id: null,
        subscription_id: null
      };
      console.log('[AUTH] Erro no perfil, usando perfil básico');
      setProfile(basicProfile);
      setProfileError(null);
      setLoading(false);
    } finally {
      operationInProgress.current = false;
    }
  }, [fetchProfile, createProfile]);
  
  const checkSession = useCallback(async () => {
    if (operationInProgress.current) {
      console.log('[AUTH] Verificação de sessão já em andamento');
      return;
    }

    try {
      operationInProgress.current = true;
      setLoading(true);
      setProfileError(null);

      // Timeout mais curto para verificação de sessão (3 segundos)
      const { data: { session }, error: sessionError } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 3000)
        )
      ]) as any;
      
      if (sessionError) throw sessionError;

      if (session?.user) {
        console.log('[AUTH] Sessão encontrada, configurando usuário...');
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
      // Não definir como erro crítico - apenas fazer logout silencioso
      setUser(null);
      setProfile(null);
      setLoading(false);
      setProfileError(null);
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
          console.log('[AUTH] Login detectado, configurando usuário...');
          setUser(session.user as User);
          await handleProfileLogic(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('[AUTH] Logout detectado');
          setProfile(null);
          setUser(null);
          setProfileError(null);
          setLoading(false);
          setRetryCount(0);
          operationInProgress.current = false;
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[AUTH] Token renovado com sucesso');
        }
      }
    );

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [handleProfileLogic, checkSession]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('[AUTH] Tentando fazer login...');
      
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      if (result.error) {
        console.error('[AUTH] Erro no login:', result.error);
        setLoading(false);
        toast.error(result.error.message);
        return { data: null, error: result.error };
      }
      
      console.log('[AUTH] Login bem-sucedido');
      // Não definir loading como false aqui - deixar o handleProfileLogic fazer isso
      return { data: result.data, error: null };
    } catch (error: any) {
      console.error('[AUTH] Erro inesperado no login:', error);
      setLoading(false);
      return { data: null, error: { message: error.message } };
    }
  };

  const signUp = async (email: string, password: string, nome: string, telefone?: string) => {
    try {
      setLoading(true);
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: nome,
            telefone: telefone
          }
        }
      });
      
      if (result.error) {
        toast.error(result.error.message);
        return { data: null, error: result.error };
      }
      
      return { data: result.data, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    } finally {
      setLoading(false);
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

  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email);
      if (result.error) {
        toast.error(result.error.message);
        return { data: null, error: result.error };
      }
      toast.success('Email de recuperação enviado!');
      return { data: 'success', error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message } };
    }
  };

  const value = {
    user,
    profile,
    loading,
    profileError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    setProfile,
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
