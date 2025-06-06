
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StrictMode, useEffect, useRef } from "react";
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
import SessionManager from "./components/auth/SessionManager";
import ScriptErrorHandler from "./components/ScriptErrorHandler";

const AppContent = () => {
  const isComponentMounted = useRef(true);

  // Controle de visibilidade da página
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
    </StrictMode>
  );
};

export default App;
