
import React, { useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import UserAccountView from '@/components/peticoes/views/UserAccountView';

const MinhaContaPage = () => {
  const { user, profile, loading } = useSupabaseAuth();
  
  console.log('[MINHA_CONTA_PAGE] Iniciando renderização.');
  console.log('[MINHA_CONTA_PAGE] Auth state from useSupabaseAuth:', {
    user: !!user,
    userId: user?.id,
    userEmail: user?.email,
    profile: !!profile,
    planId: profile?.plano_id,
    loading
  });

  useEffect(() => {
    console.log('[MINHA_CONTA_PAGE] Componente montado com sucesso.');
    console.log('[MINHA_CONTA_PAGE] Estado completo na montagem:', {
      user,
      profile,
      loading
    });
    
    return () => {
      console.log('[MINHA_CONTA_PAGE] Desmontando.');
    };
  }, [user, profile, loading]);

  // Adicionar logs quando o estado muda
  useEffect(() => {
    console.log('[MINHA_CONTA_PAGE] Estado de autenticação mudou:', {
      user: !!user,
      profile: !!profile,
      loading
    });
  }, [user, profile, loading]);

  return <UserAccountView />;
};

export default MinhaContaPage;
