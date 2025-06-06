import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StrictMode } from "react";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
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
    },
  },
});

const App = () => {
  return (
    <StrictMode>
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
    </StrictMode>
  );
};

export default App;
