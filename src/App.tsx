
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StrictMode, useEffect, useRef, useState } from "react";
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
import { ErrorBoundary } from "./components/common/ErrorBoundary";
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

const App = () => {
  // Create a client outside the component to prevent recreation on every render
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false, // Evita refetch automático ao voltar à aba
        staleTime: 5 * 60 * 1000, // 5 minutos de cache
      },
    },
  });

  return (
    <StrictMode>
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
    </StrictMode>
  );
};

export default App;
