
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';

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
  const { user, profile, loading, profileError, checkSession, retryCount } = useSupabaseAuth();
  const location = useLocation();
  const [showRetry, setShowRetry] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Se houver erro ou não tiver usuário após o carregamento, mostrar botão de retry após 5 segundos
    let timeoutId: NodeJS.Timeout;
    
    if (!loading && (!user || profileError) && requireAuth) {
      timeoutId = setTimeout(() => {
        setShowRetry(true);
      }, 5000); // Aumentado para 5 segundos
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, user, profileError, requireAuth]);

  const handleRetry = () => {
    setShowRetry(false);
    checkSession();
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
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

  // Se houver erro de autenticação ou perfil
  if (requireAuth && (profileError || (!user && showRetry))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="mb-4">
            {profileError ? (
              <AlertCircle className="mx-auto h-16 w-16 text-red-400" />
            ) : !isOnline ? (
              <WifiOff className="mx-auto h-16 w-16 text-white animate-pulse" />
            ) : (
              <RefreshCw className="mx-auto h-16 w-16 text-white animate-pulse" />
            )}
          </div>
          <h2 className="text-xl font-medium mb-2">
            {profileError ? 'Erro de Autenticação' : !isOnline ? 'Sem Conexão' : 'Problema de Conexão'}
          </h2>
          <p className="text-sm opacity-75 mb-4">
            {profileError ? profileError.message : !isOnline 
              ? 'Parece que você está sem conexão com a internet. Por favor, verifique sua conexão e tente novamente.' 
              : 'Parece que houve um problema ao verificar sua autenticação. Isso pode acontecer devido a uma conexão instável.'}
          </p>
          <div className="space-y-2">
            {retryCount < 3 && isOnline && (
              <Button 
                onClick={handleRetry}
                className="w-full bg-white text-juriscalc-navy hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            )}
            {!isOnline && (
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-white text-juriscalc-navy hover:bg-gray-100 transition-colors"
              >
                <Wifi className="mr-2 h-4 w-4" />
                Verificar Conexão
              </Button>
            )}
            <Button 
              onClick={() => window.location.href = '/auth'}
              variant="outline"
              className="w-full border-white text-white hover:bg-white/10"
            >
              Voltar para Login
            </Button>
          </div>
          {retryCount >= 3 && (
            <p className="text-sm text-red-300 mt-4">
              Muitas tentativas sem sucesso. Por favor, tente fazer login novamente.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Se o usuário está autenticado mas não tem perfil
  if (requireAuth && user && !profile) {
    console.log('[PROTECTED_ROUTE] Usuário autenticado mas sem perfil:', { userId: user.id, retryCount });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold">
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="mb-4">
            <RefreshCw className="mx-auto h-16 w-16 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-medium mb-2">Carregando seu perfil</h2>
          <p className="text-sm opacity-75 mb-4">
            {retryCount === 0 
              ? 'Estamos carregando os dados da sua conta. Isso pode levar alguns instantes.'
              : `Tentativa ${retryCount} de 3. Aguarde enquanto tentamos novamente...`}
          </p>
          <div className="space-y-2">
            {retryCount < 3 && (
              <Button 
                onClick={() => {
                  console.log('[PROTECTED_ROUTE] Tentando buscar perfil novamente...');
                  checkSession();
                }}
                className="w-full bg-white text-juriscalc-navy hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            )}
            <Button 
              onClick={() => {
                console.log('[PROTECTED_ROUTE] Redirecionando para login...');
                window.location.href = '/auth';
              }}
              variant="outline"
              className="w-full border-white text-white hover:bg-white/10"
            >
              Voltar para Login
            </Button>
          </div>
          {retryCount >= 3 && (
            <p className="text-sm text-red-300 mt-4">
              Não foi possível carregar seu perfil após várias tentativas. Por favor, tente fazer login novamente.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Verificação de admin
  if (requireAdmin && profile) {
    const isAdmin = profile.plano_id === 'admin' || profile.plano_id === 'premium';
    
    if (!isAdmin) {
      return <Navigate to="/home" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
