
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StrictMode } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SupabaseLogin from "./pages/SupabaseLogin";
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
  // Create a client inside the component function
  const queryClient = new QueryClient();
  
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* AUTENTICAÇÃO TEMPORARIAMENTE DESABILITADA - ROTA PRINCIPAL AGORA É HOME */}
              <Route path="/" element={<Index />} />
              
              {/* Login routes (temporariamente acessíveis mas não são entrada principal) */}
              <Route path="/login" element={<SupabaseLogin />} />
              <Route path="/login-old" element={<Login />} />
              <Route path="/esqueci-senha" element={<PasswordResetRequest />} />
              <Route path="/reset-senha" element={<PasswordReset />} />
              <Route path="/reset-password" element={<MasterPasswordReset />} />
              
              {/* Protected routes - TEMPORARIAMENTE SEM PROTEÇÃO */}
              <Route 
                path="/home" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/calculadora" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Calculadora />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/peticoes" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Peticoes />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rota dedicada para Minha Conta - TEMPORARIAMENTE SEM PROTEÇÃO */}
              <Route 
                path="/minha-conta" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <MinhaContaPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes - TEMPORARIAMENTE SEM PROTEÇÃO */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAuth={false} requireAdmin={false}>
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

  /* ROTEAMENTO ORIGINAL COMENTADO PARA REATIVAÇÃO FUTURA:
  
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes *}
              <Route path="/" element={<SupabaseLogin />} />
              <Route path="/login-old" element={<Login />} />
              <Route path="/esqueci-senha" element={<PasswordResetRequest />} />
              <Route path="/reset-senha" element={<PasswordReset />} />
              <Route path="/reset-password" element={<MasterPasswordReset />} />
              
              {/* Protected routes - require authentication *}
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
              
              {/* Rota dedicada para Minha Conta *}
              <Route 
                path="/minha-conta" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <MinhaContaPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes - require authentication and admin role *}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAuth={true} requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirects for common paths *}
              <Route path="/index" element={<Navigate to="/home" replace />} />
              
              {/* Catch all other routes - must be last *}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </StrictMode>
  );
  */
};

export default App;
