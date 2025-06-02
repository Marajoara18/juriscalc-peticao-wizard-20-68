
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { useUserManagement } from '@/hooks/useUserManagement';
import Layout from '@/components/Layout';
import UserManagementPanel from '@/components/auth/UserManagementPanel';
import MasterAdminCredentials from '@/components/auth/MasterAdminCredentials';
import UserProfile from '@/components/auth/UserProfile';

const UserAccountView = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useSupabaseAuth();
  const { userData, isAdmin, isMasterAdmin, allUsers, updateUsers, handleLogout, updateCurrentUserData } = useUserManagement();

  const handleVoltar = () => {
    console.log('[USER_ACCOUNT_VIEW] Voltando para /home');
    navigate('/home');
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-juriscalc-navy mx-auto mb-4"></div>
              <p className="text-lg font-medium">Carregando...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Se não há usuário após o carregamento, mostrar mensagem
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg font-medium mb-4">Você precisa estar logado para acessar esta página.</p>
              <Button onClick={() => navigate('/auth')}>Ir para Login</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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
        
        {userData && (
          <>
            {/* Componente de perfil do usuário para todos os usuários */}
            <UserProfile 
              userData={userData}
              isMasterAdmin={isMasterAdmin}
              onLogout={handleLogout}
              updateUserData={updateCurrentUserData}
            />
            
            {/* Painéis administrativos apenas para admins */}
            {isAdmin && (
              <>
                <UserManagementPanel 
                  allUsers={allUsers}
                  updateUsers={updateUsers}
                  isAdmin={isAdmin}
                  isMasterAdmin={isMasterAdmin}
                />
                
                {isMasterAdmin && (
                  <MasterAdminCredentials 
                    userData={userData}
                    allUsers={allUsers}
                    updateUsers={updateUsers}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default UserAccountView;
