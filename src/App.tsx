
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StrictMode } from "react";
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

const App = () => {
  // Create a client outside the component to prevent recreation on every render
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
  
  return (
    <StrictMode>
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
                  <ProtectedRoute requireAuth={true}>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calculadora" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <Calculadora />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/peticoes" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <Peticoes />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rota dedicada para Minha Conta */}
              <Route 
                path="/minha-conta" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <MinhaContaPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes - require authentication and admin role */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirects for common paths */}
              <Route path="/index" element={<Navigate to="/home" replace />} />
              
              {/* Catch all other routes - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>
  );
};

export default App;
