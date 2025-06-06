import { useEffect, useCallback, useRef } from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const SessionManager = () => {
  const { user, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Função para verificar se a sessão ainda é válida
  const checkSessionHealth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('[SESSION_MANAGER] Sessão inválida ou expirada, fazendo logout');
        await signOut();
        toast.error('Sua sessão expirou. Por favor, faça login novamente.');
        navigate('/auth');
        return false;
      }

      // Verificar se o token expira em menos de 5 minutos
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 300) { // 5 minutos
        console.log('[SESSION_MANAGER] Token próximo do vencimento, renovando...');
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error('[SESSION_MANAGER] Erro ao renovar sessão:', refreshError);
          await signOut();
          toast.error('Não foi possível renovar sua sessão. Por favor, faça login novamente.');
          navigate('/auth');
          return false;
        } else {
          console.log('[SESSION_MANAGER] Sessão renovada com sucesso');
        }
      }

      return true;
    } catch (error) {
      console.error('[SESSION_MANAGER] Erro ao verificar sessão:', error);
      return false;
    }
  }, [signOut, navigate]);

  // Função para manter a sessão ativa
  const keepSessionAlive = useCallback(async () => {
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    
    // Se o usuário esteve ativo nos últimos 30 minutos, renovar a sessão
    if (timeSinceLastActivity < 30 * 60 * 1000) {
      try {
        await supabase.auth.refreshSession();
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

  useEffect(() => {
    if (!user) return;

    console.log('[SESSION_MANAGER] Iniciando monitoramento de sessão');

    // Verificar sessão a cada 2 minutos
    sessionCheckIntervalRef.current = setInterval(checkSessionHealth, 2 * 60 * 1000);

    // Keep-alive a cada 15 minutos
    keepAliveIntervalRef.current = setInterval(keepSessionAlive, 15 * 60 * 1000);

    // Rastrear atividade do usuário
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    // Verificação inicial
    checkSessionHealth();

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

  return null; // Este é um componente de gerenciamento, não renderiza nada
};

export default SessionManager;
