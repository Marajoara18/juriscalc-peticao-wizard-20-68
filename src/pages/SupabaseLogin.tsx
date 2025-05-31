
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

const SupabaseLogin = () => {
  const { user, loading } = useSupabaseAuth();
  
  console.log('[SUPABASE_LOGIN] Estado atual:', { user: !!user, loading });
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">Verificando autenticação...</p>
          <p className="text-sm opacity-75 mt-2">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to auth page if not authenticated
  if (!user) {
    console.log('[SUPABASE_LOGIN] Usuário não autenticado, redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect to home if authenticated
  console.log('[SUPABASE_LOGIN] Usuário autenticado, redirecionando para /home');
  return <Navigate to="/home" replace />;
};

export default SupabaseLogin;
