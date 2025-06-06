import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
<<<<<<< HEAD
import { StrictMode } from "react";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
=======
import { StrictMode, useEffect, useRef, useState } from "react";
>>>>>>> a2104ffb9d38ac6de5adbf01a86b20bcd9612e12
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import AdminPanel from "./pages/AdminPanel";
import Calculadora from "./pages/Calculadora";
import Peticoes from "./pages/Peticoes";
import MinhaContaPage from "./pages/MinhaContaPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MasterPasswordReset from "./components/auth/MasterPasswordReset";
import PasswordResetRequest from "./components/auth/PasswordResetRequest";
import PasswordReset from "./components/auth/PasswordReset";
import ErrorBoundary from "./components/ErrorBoundary";
import VisibilityErrorBoundary from "./components/VisibilityErrorBoundary";
import SimpleErrorBoundary from "./components/SimpleErrorBoundary";
import SessionManager from "./components/auth/SessionManager";
import ScriptErrorHandler from "./components/ScriptErrorHandler";

const AppContent = () => {
  const isComponentMounted = useRef(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicialização segura
  useEffect(() => {
    try {
      console.log('[APP] Inicializando componente...');
      // Simular inicialização
      setTimeout(() => {
        if (isComponentMounted.current) {
          setIsReady(true);
          console.log('[APP] Aplicação pronta');
        }
      }, 100);
    } catch (err) {
      console.error('[APP] Erro na inicialização:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  }, []);

  // Controle de visibilidade da página - versão simplificada
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[APP] Página voltou a ficar visível');
        // NÃO force operações quando volta à aba
        // Apenas log para debug
      } else {
        console.log('[APP] Página ficou oculta');
        // Pause operações pesadas se necessário
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Error fallback
  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh' }}>
        <h2>Erro na aplicação</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Recarregar Sistema
        </button>
      </div>
    );
  }

  // Loading fallback
  if (!isReady) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2>Carregando IusCalc...</h2>
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1e40af',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 2s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <SessionManager />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={
          <ErrorBoundary>
            <AuthPage />
          </ErrorBoundary>
        } />
        <Route path="/esqueci-senha" element={
          <ErrorBoundary>
            <PasswordResetRequest />
          </ErrorBoundary>
        } />
        <Route path="/reset-senha" element={
          <ErrorBoundary>
            <PasswordReset />
          </ErrorBoundary>
        } />
        <Route path="/reset-password" element={
          <ErrorBoundary>
            <MasterPasswordReset />
          </ErrorBoundary>
        } />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ErrorBoundary>
                <Index />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calculadora" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ErrorBoundary>
                <Calculadora />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/peticoes" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ErrorBoundary>
                <Peticoes />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        
        {/* Rota dedicada para Minha Conta */}
        <Route 
          path="/minha-conta" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ErrorBoundary>
                <MinhaContaPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin routes - require authentication and admin role */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAuth={true} requireAdmin={true}>
              <ErrorBoundary>
                <AdminPanel />
              </ErrorBoundary>
            </ProtectedRoute>
          } 
        />
        
        {/* Redirects for common paths */}
        <Route path="/index" element={<Navigate to="/home" replace />} />
        
        {/* Catch all other routes - must be last */}
        <Route path="*" element={
          <ErrorBoundary>
            <NotFound />
          </ErrorBoundary>
        } />
      </Routes>
    </BrowserRouter>
  );
};

<<<<<<< HEAD
// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
=======
const App = () => {
  // Create a client outside the component to prevent recreation on every render
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false, // Evita refetch automático ao voltar à aba
        staleTime: 5 * 60 * 1000, // 5 minutos de cache
      },
>>>>>>> a2104ffb9d38ac6de5adbf01a86b20bcd9612e12
    },
  },
});

const App = () => {
  return (
    <StrictMode>
<<<<<<< HEAD
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/esqueci-senha" element={<PasswordResetRequest />} />
                <Route path="/reset-senha" element={<PasswordReset />} />
                <Route path="/reset-password" element={<MasterPasswordReset />} />
                
                {/* Protected routes - require authentication */}
                <Route 
                  path="/home" 
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAuth={true}>
                        <Index />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/calculadora" 
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAuth={true}>
                        <Calculadora />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/peticoes" 
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAuth={true}>
                        <Peticoes />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } 
                />
                
                {/* Admin routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAuth={true} requireAdmin={true}>
                        <AdminPanel />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } 
                />
                
                {/* User account route */}
                <Route 
                  path="/minha-conta" 
                  element={
                    <ErrorBoundary>
                      <ProtectedRoute requireAuth={true}>
                        <MinhaContaPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } 
                />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
=======
      <SimpleErrorBoundary>
        <VisibilityErrorBoundary>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <ScriptErrorHandler />
                <AppContent />
              </TooltipProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </VisibilityErrorBoundary>
      </SimpleErrorBoundary>
>>>>>>> a2104ffb9d38ac6de5adbf01a86b20bcd9612e12
    </StrictMode>
  );
};

export default App;
