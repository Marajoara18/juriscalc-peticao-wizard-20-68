
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
  
  // Configurar interceptor para requisições do Supabase com timeout e retry
  useEffect(() => {
    console.log('[SUPABASE_AUTH] Configurando interceptors...');

    // Configurar timeout personalizado para o cliente Supabase
    const originalRequest = supabase.rest.fetch;
    
    supabase.rest.fetch = async (url: string, options: any = {}) => {
      const timeoutMs = 30000; // 30 segundos
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[SUPABASE_AUTH] Requisição (tentativa ${attempt}):`, url);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
          
          const requestOptions = {
            ...options,
            signal: controller.signal
          };
          
          const response = await originalRequest.call(supabase.rest, url, requestOptions);
          clearTimeout(timeoutId);
          
          console.log(`[SUPABASE_AUTH] Requisição bem-sucedida (tentativa ${attempt}):`, response.status);
          return response;
          
        } catch (error: any) {
          console.log(`[SUPABASE_AUTH] Erro na tentativa ${attempt}:`, error.message);
          
          if (attempt === maxRetries) {
            console.error('[SUPABASE_AUTH] Todas as tentativas falharam:', error);
            throw error;
          }
          
          // Aguardar antes de tentar novamente (backoff exponencial)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[SUPABASE_AUTH] Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };
  }, []);
  
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
