
import { useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { toast } from 'sonner';

const ReconnectionHandler = () => {
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Se não há usuário e não está carregando, pode mostrar toast de reconexão
      console.log('ReconnectionHandler: Usuário não autenticado');
    }
  }, [user, loading]);

  return null;
};

export default ReconnectionHandler;
