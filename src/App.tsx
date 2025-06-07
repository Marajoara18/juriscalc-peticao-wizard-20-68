
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
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicialização mais robusta
  useEffect(() => {
    console.log('[APP] Inicializando aplicação...');
    
    const initializeApp = () => {
      try {
        if (isComponentMounted.current) {
          console.log('[APP] Aplicação pronta para usar');
          setIsReady(true);
        }
      } catch (err) {
        console.error('[APP] Erro na inicialização:', err);
        if (isComponentMounted.current) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
      }
    };

    // Tentar inicializar imediatamente
    initializeApp();

    // Fallback: forçar inicialização após 2 segundos se ainda não estiver pronto
    initTimeoutRef.current = setTimeout(() => {
      if (isComponentMounted.current && !isReady) {
        console.log('[APP] Forçando inicialização após timeout');
        setIsReady(true);
      }
    }, 2000);

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [isReady]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  // Error fallback simplificado
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold p-4">
        <div className="text-center text-white max-w-md">
          <h2 className="text-xl font-bold mb-4">Erro na aplicação</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-juriscalc-navy rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Recarregar Sistema
          </button>
        </div>
      </div>
    );
  }

  // Loading fallback melhorado
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Carregando IusCalc</h2>
          <p className="text-sm opacity-75">Iniciando sistema...</p>
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
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
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
