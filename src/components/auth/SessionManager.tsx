import { useEffect, useCallback, useRef } from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SessionManager = () => {
  const { user, signOut } = useSupabaseAuth();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isComponentMounted = useRef(true);
  const isPageVisible = useRef(true);

  // Função para verificar se a sessão ainda é válida
  const checkSessionHealth = useCallback(async () => {
    if (!isComponentMounted.current || !isPageVisible.current) return true;
    
    try {
      console.log('[SESSION_MANAGER] Verificando saúde da sessão...');
      
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 15000)
        )
      ]) as any;
      
      if (!isComponentMounted.current) return false;
      
      if (error || !session) {
        console.log('[SESSION_MANAGER] Sessão inválida, fazendo logout');
        await signOut();
        toast.error('Sua sessão expirou. Redirecionando para login...');
        return false;
      }

      // Verificar se o token expira em menos de 10 minutos
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 600) { // 10 minutos
        console.log('[SESSION_MANAGER] Token próximo do vencimento, renovando...');
        
        const { error: refreshError } = await Promise.race([
          supabase.auth.refreshSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Refresh timeout')), 15000)
          )
        ]) as any;
        
        if (!isComponentMounted.current) return false;
        
        if (refreshError) {
          console.error('[SESSION_MANAGER] Erro ao renovar sessão:', refreshError);
          await signOut();
          toast.error('Não foi possível renovar sua sessão. Redirecionando...');
          return false;
        } else {
          console.log('[SESSION_MANAGER] Sessão renovada com sucesso');
        }
      }

      return true;
    } catch (error) {
      if (!isComponentMounted.current) return false;
      
      console.error('[SESSION_MANAGER] Erro ao verificar sessão:', error);
      // Em caso de erro de timeout, não deslogar automaticamente
      return true;
    }
  }, [signOut]);

  // Função para manter a sessão ativa
  const keepSessionAlive = useCallback(async () => {
    if (!isComponentMounted.current || !isPageVisible.current) return;
    
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    
    console.log('[SESSION_MANAGER] Keep-alive check, última atividade:', timeSinceLastActivity / 1000 / 60, 'minutos atrás');
    
    // Se o usuário esteve ativo nos últimos 60 minutos, renovar a sessão
    if (timeSinceLastActivity < 60 * 60 * 1000) {
      try {
        await Promise.race([
          supabase.auth.refreshSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Keep-alive timeout')), 10000)
          )
        ]);
        if (isComponentMounted.current) {
          console.log('[SESSION_MANAGER] Keep-alive: sessão renovada');
        }
      } catch (error) {
        if (isComponentMounted.current) {
          console.error('[SESSION_MANAGER] Erro no keep-alive:', error);
        }
      }
    }
  }, []);

  // Rastrear atividade do usuário
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Controlar visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = document.visibilityState === 'visible';
      
      console.log('[SESSION_MANAGER] Visibilidade da página mudou:', document.visibilityState);
      
      if (isPageVisible.current) {
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
  }, [updateLastActivity]);

  useEffect(() => {
    if (!user) return;

    console.log('[SESSION_MANAGER] Iniciando monitoramento de sessão para usuário:', user.email);

    // Verificar sessão a cada 5 minutos (menos agressivo)
    sessionCheckIntervalRef.current = setInterval(() => {
      if (isPageVisible.current && isComponentMounted.current) {
        checkSessionHealth();
      }
    }, 300 * 1000); // 5 minutos

    // Keep-alive a cada 30 minutos
    keepAliveIntervalRef.current = setInterval(() => {
      if (isPageVisible.current && isComponentMounted.current) {
        keepSessionAlive();
      }
    }, 30 * 60 * 1000); // 30 minutos

    // Rastrear atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    // Verificação inicial apenas se a página estiver visível
    if (isPageVisible.current) {
      setTimeout(() => {
        if (isComponentMounted.current && isPageVisible.current) {
          checkSessionHealth();
        }
      }, 5000); // Aguardar 5s antes da primeira verificação
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
