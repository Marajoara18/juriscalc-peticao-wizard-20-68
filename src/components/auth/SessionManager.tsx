import { useEffect, useCallback, useRef } from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const SessionManager = () => {
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Função de ping para manter conexão ativa
  const pingServer = useCallback(async () => {
    try {
      const { data, error } = await Promise.race([
        supabase.from('profiles').select('id').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Ping timeout')), 5000)
        )
      ]) as any;

      if (error) {
        console.log('[SESSION_MANAGER] Ping falhou:', error.message);
      } else {
        console.log('[SESSION_MANAGER] Ping successful');
      }
    } catch (error) {
      console.log('[SESSION_MANAGER] Ping timeout ou erro de rede');
    }
  }, []);

  // Função para verificar se a sessão ainda é válida
  const checkSessionHealth = useCallback(async () => {
    try {
      console.log('[SESSION_MANAGER] Verificando saúde da sessão...');
      
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        )
      ]) as any;
      
      if (error || !session) {
        console.log('[SESSION_MANAGER] Sessão inválida, fazendo logout');
        await signOut();
        toast.error('Sua sessão expirou. Redirecionando para login...');
        return false;
      }

      // Verificar se o token expira em menos de 5 minutos
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 300) { // 5 minutos
        console.log('[SESSION_MANAGER] Token próximo do vencimento, renovando...');
        
        const { error: refreshError } = await Promise.race([
          supabase.auth.refreshSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Refresh timeout')), 10000)
          )
        ]) as any;
        
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
      console.error('[SESSION_MANAGER] Erro ao verificar sessão:', error);
      // Em caso de erro, tentar uma última vez antes de deslogar
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await signOut();
          return false;
        }
        return true;
      } catch (finalError) {
        console.error('[SESSION_MANAGER] Erro final, fazendo logout:', finalError);
        await signOut();
        return false;
      }
    }
  }, [signOut]);

  // Função para manter a sessão ativa
  const keepSessionAlive = useCallback(async () => {
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    
    console.log('[SESSION_MANAGER] Keep-alive check, última atividade:', timeSinceLastActivity / 1000 / 60, 'minutos atrás');
    
    // Se o usuário esteve ativo nos últimos 30 minutos, renovar a sessão
    if (timeSinceLastActivity < 30 * 60 * 1000) {
      try {
        await Promise.race([
          supabase.auth.refreshSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Keep-alive timeout')), 10000)
          )
        ]);
        console.log('[SESSION_MANAGER] Keep-alive: sessão renovada');
      } catch (error) {
        console.error('[SESSION_MANAGER] Erro no keep-alive:', error);
      }
    }
  }, []);

  // Rastrear atividade do usuário
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Adicionar logs de debug para window events
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('[SESSION_MANAGER] Página sendo fechada');
    };

    const handleVisibilityChange = () => {
      console.log('[SESSION_MANAGER] Visibilidade da página mudou:', document.visibilityState);
      if (document.visibilityState === 'visible') {
        updateLastActivity();
        // Verificar sessão quando página volta a ficar visível
        checkSessionHealth();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateLastActivity, checkSessionHealth]);

  useEffect(() => {
    if (!user) return;

    console.log('[SESSION_MANAGER] Iniciando monitoramento de sessão para usuário:', user.email);

    // Verificar sessão a cada 90 segundos (mais frequente)
    sessionCheckIntervalRef.current = setInterval(checkSessionHealth, 90 * 1000);

    // Keep-alive a cada 10 minutos
    keepAliveIntervalRef.current = setInterval(keepSessionAlive, 10 * 60 * 1000);

    // Ping a cada 60 segundos para manter conexão ativa
    pingIntervalRef.current = setInterval(pingServer, 60 * 1000);

    // Rastrear atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    // Verificação inicial
    checkSessionHealth();
    pingServer();

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, updateLastActivity);
      });
    };
  }, [user, checkSessionHealth, keepSessionAlive, updateLastActivity, pingServer]);

  return null;
};

export default SessionManager;
