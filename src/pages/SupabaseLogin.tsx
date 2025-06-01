
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

const SupabaseLogin = () => {
  const { user, loading } = useSupabaseAuth();
  
  // Redirect to auth page if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect to home if authenticated
  if (!loading && user) {
    return <Navigate to="/home" replace />;
  }
  
  // Show loading while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg font-medium">Verificando autenticação...</p>
      </div>
    </div>
  );
};

export default SupabaseLogin;
