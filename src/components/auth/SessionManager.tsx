import { useEffect, useCallback, useRef } from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

const SessionManager = () => {
  const { user, signOut } = useSupabaseAuth();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isComponentMounted = useRef(true);
  const isPageVisible = useRef(true);

  // Função simplificada para verificar se a sessão ainda é válida
  const checkSessionHealth = useCallback(async () => {
    if (!isComponentMounted.current || !isPageVisible.current || !user) return true;
    
    try {
      console.log('[SESSION_MANAGER] Verificando saúde da sessão...');
      
      // Timeout mais curto (3 segundos)
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 3000)
        )
      ]) as any;
      
      if (!isComponentMounted.current) return false;
      
      if (error) {
        console.warn('[SESSION_MANAGER] Erro na verificação da sessão (não crítico):', error);
        return true; // Não deslogar por erro de rede
      }
      
      if (!session) {
        console.log('[SESSION_MANAGER] Sessão inválida, fazendo logout silencioso');
        await signOut();
        return false;
      }

      // Verificar se o token expira em menos de 10 minutos
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 600) { // 10 minutos
        console.log('[SESSION_MANAGER] Token próximo do vencimento, renovando...');
        
        try {
          const { error: refreshError } = await Promise.race([
            supabase.auth.refreshSession(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Refresh timeout')), 3000)
            )
          ]) as any;
          
          if (!isComponentMounted.current) return false;
          
          if (refreshError) {
            console.warn('[SESSION_MANAGER] Erro ao renovar sessão (não crítico):', refreshError);
            return true;
          } else {
            console.log('[SESSION_MANAGER] Sessão renovada com sucesso');
          }
        } catch (refreshError) {
          console.warn('[SESSION_MANAGER] Falha na renovação da sessão (não crítico):', refreshError);
          return true; // Continuar sem deslogar
        }
      }

      return true;
    } catch (error) {
      if (!isComponentMounted.current) return false;
      
      console.warn('[SESSION_MANAGER] Erro ao verificar sessão (não crítico):', error);
      return true; // Não deslogar por timeout ou erro de rede
    }
  }, [signOut, user]);

  // Função para manter a sessão ativa (simplificada)
  const keepSessionAlive = useCallback(async () => {
    if (!isComponentMounted.current || !isPageVisible.current || !user) return;
    
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    
    console.log('[SESSION_MANAGER] Keep-alive check, última atividade:', Math.round(timeSinceLastActivity / 1000 / 60), 'minutos atrás');
    
    // Se o usuário esteve ativo nos últimos 60 minutos, renovar a sessão
    if (timeSinceLastActivity < 60 * 60 * 1000) {
      try {
        await Promise.race([
          supabase.auth.refreshSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Keep-alive timeout')), 3000)
          )
        ]);
        if (isComponentMounted.current) {
          console.log('[SESSION_MANAGER] Keep-alive: sessão renovada');
        }
      } catch (error) {
        if (isComponentMounted.current) {
          console.warn('[SESSION_MANAGER] Erro no keep-alive (não crítico):', error);
        }
      }
    }
  }, [user]);

  // Rastrear atividade do usuário
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Controlar visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = document.visibilityState === 'visible';
      
      console.log('[SESSION_MANAGER] Visibilidade da página mudou:', document.visibilityState);
      
      if (isPageVisible.current && user) {
        console.log('[SESSION_MANAGER] Página voltou a ficar visível - atualizando atividade');
        updateLastActivity();
      }
    };

    const handleBeforeUnload = () => {
      console.log('[SESSION_MANAGER] Página sendo fechada');
      isComponentMounted.current = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [updateLastActivity, user]);

  useEffect(() => {
    if (!user) {
      // Limpar intervalos se não há usuário
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }
      return;
    }

    console.log('[SESSION_MANAGER] Iniciando monitoramento de sessão para usuário:', user.email);

    // Verificar sessão a cada 15 minutos (menos agressivo)
    sessionCheckIntervalRef.current = setInterval(() => {
      if (isPageVisible.current && isComponentMounted.current && user) {
        checkSessionHealth();
      }
    }, 15 * 60 * 1000); // 15 minutos

    // Keep-alive a cada 45 minutos
    keepAliveIntervalRef.current = setInterval(() => {
      if (isPageVisible.current && isComponentMounted.current && user) {
        keepSessionAlive();
      }
    }, 45 * 60 * 1000); // 45 minutos

    // Rastrear atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    // Verificação inicial apenas se a página estiver visível (com delay maior)
    if (isPageVisible.current) {
      setTimeout(() => {
        if (isComponentMounted.current && isPageVisible.current && user) {
          checkSessionHealth();
        }
      }, 30000); // Aguardar 30s antes da primeira verificação
    }

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, updateLastActivity);
      });
    };
  }, [user, checkSessionHealth, keepSessionAlive, updateLastActivity]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  return null;
};

export default SessionManager;
