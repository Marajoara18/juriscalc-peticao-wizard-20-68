
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import UserManagement from '@/components/auth/UserManagement';
import MasterPasswordReset from '@/components/auth/MasterPasswordReset';

const UserAccountView = () => {
  const navigate = useNavigate();

  const handleVoltar = () => {
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
