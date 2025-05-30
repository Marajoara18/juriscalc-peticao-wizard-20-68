
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import Layout from '@/components/Layout';
import UserManagement from '@/components/auth/UserManagement';
import MasterPasswordReset from '@/components/auth/MasterPasswordReset';

const UserAccountView = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useSupabaseAuth();

  console.log('[USER_ACCOUNT_VIEW] Iniciando renderização.');
  console.log('[USER_ACCOUNT_VIEW] Auth state:', {
    user: !!user,
    profile: !!profile,
    loading
  });

  useEffect(() => {
    console.log('[USER_ACCOUNT_VIEW] Componente montado.');
    
    return () => {
      console.log('[USER_ACCOUNT_VIEW] Desmontando.');
    };
  }, []);

  useEffect(() => {
    console.log('[USER_ACCOUNT_VIEW] Estado de auth mudou:', {
      user: !!user,
      profile: !!profile,
      loading
    });
  }, [user, profile, loading]);

  const handleVoltar = () => {
    console.log('[USER_ACCOUNT_VIEW] Voltando para /home');
    navigate('/home');
  };

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-semibold">Minha Conta</h2>
          <Button 
            variant="outline" 
            onClick={handleVoltar} 
            className="border-juriscalc-navy text-juriscalc-navy"
          >
            Voltar
          </Button>
        </div>
        
        <UserManagement />
        
        {/* Componente de redefinição de senha do master */}
        <MasterPasswordReset />
      </div>
    </Layout>
  );
};

export default UserAccountView;
