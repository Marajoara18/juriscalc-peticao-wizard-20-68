
import React from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import UserProfile from './UserProfile';
import AdminPanel from './AdminPanel';
import UserPanelsView from './UserPanelsView';
import MasterAdminCredentials from './MasterAdminCredentials';

// Simplified interface that matches what we actually use
interface UserForComponents {
  id: string;
  nome: string;
  email: string;
  isAdmin: boolean;
  isPremium?: boolean;
  logoUrl?: string;
  canViewPanels?: boolean;
  oab?: string;
  planoId?: string;
  limiteCalculosSalvos?: number;
  limitePeticoesSalvas?: number;
}

const UserManagement = () => {
  const {
    userData,
    allUsers,
    isAdmin,
    isMasterAdmin,
    handleLogout,
    updateCurrentUserData
  } = useUserManagement();
  
  // Convert allUsers to format expected by components
  const convertedUsers: UserForComponents[] = allUsers.map(user => ({
    id: user.id,
    nome: user.nome_completo || user.email || 'Usuário',
    email: user.email || '',
    isAdmin: user.plano_id === 'admin' || user.plano_id === 'premium',
    isPremium: user.plano_id !== 'gratuito',
    planoId: user.plano_id
  }));

  // Simple update function that refetches data
  const updateUsers = () => {
    // Since we removed the localStorage dependency, this is a no-op
    // Components should refetch data as needed
    console.log('[USER_MANAGEMENT] updateUsers called - components should refetch data');
  };
  
  return (
    <>
      {userData && (
        <UserProfile 
          userData={userData} 
          isMasterAdmin={isMasterAdmin}
          onLogout={handleLogout}
          updateUserData={updateCurrentUserData}
        />
      )}
      
      {/* Admin Panel - Only visible to admins */}
      {isAdmin && (
        <AdminPanel 
          isMasterAdmin={isMasterAdmin}
          allUsers={convertedUsers}
          updateUsers={updateUsers}
        />
      )}
      
      {/* Master Admin Credentials - Only visible to master admin */}
      {isMasterAdmin && userData && (
        <MasterAdminCredentials
          userData={userData}
          allUsers={convertedUsers}
          updateUsers={updateUsers}
        />
      )}
      
      {/* User Panels View - Only visible to master admin */}
      {isMasterAdmin && (
        <UserPanelsView
          isMasterAdmin={isMasterAdmin}
          allUsers={convertedUsers}
        />
      )}
    </>
  );
};

export default UserManagement;
