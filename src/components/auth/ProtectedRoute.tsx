
import React from 'react';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useSupabaseAuth();
  const location = useLocation();

  console.log('PROTECTED_ROUTE: Verificação de acesso:', {
    path: location.pathname,
    user: !!user,
    userId: user?.id,
    userEmail: user?.email,
    profile: !!profile,
    planId: profile?.plano_id,
    loading,
    requireAuth,
    requireAdmin,
    timestamp: new Date().toISOString()
  });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('PROTECTED_ROUTE: Ainda carregando autenticação...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">Verificando autenticação...</p>
          <p className="text-sm opacity-75 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    console.log('PROTECTED_ROUTE: Usuário não autenticado, redirecionando para /');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Redirect to home if admin access is required but user is not admin
  if (requireAdmin && (!profile || profile.plano_id !== 'admin')) {
    console.log('PROTECTED_ROUTE: Usuário não é admin, redirecionando para /home. Plano atual:', profile?.plano_id);
    return <Navigate to="/home" replace />;
  }

  // Se o usuário está autenticado mas não tem perfil, mostrar mensagem amigável
  if (requireAuth && user && !profile) {
    console.log('PROTECTED_ROUTE: Usuário autenticado mas sem perfil');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Configurando seu perfil</h2>
          <p className="text-sm opacity-75">
            Estamos finalizando a configuração da sua conta. Isso pode levar alguns instantes.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-white text-juriscalc-navy rounded hover:bg-gray-100 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  console.log('PROTECTED_ROUTE: Acesso permitido, renderizando conteúdo');
  return <>{children}</>;
};

export default ProtectedRoute;
