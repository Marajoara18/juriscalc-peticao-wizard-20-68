
import React from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import UserProfile from './UserProfile';
import AdminPanel from './AdminPanel';
import UserPanelsView from './UserPanelsView';
import AdminSessionIndicator from './AdminSessionIndicator';
import UserManagementPanel from './UserManagementPanel';
import MasterAdminCredentials from './MasterAdminCredentials';

const UserManagement = () => {
  const {
    userData,
    allUsers,
    isAdmin,
    isMasterAdmin,
    isLoggedInAsUser,
    handleLogout,
    updateUserData,
    updateUsers,
    handleReturnToAdmin
  } = useUserManagement();
  
  return (
    <>
      <AdminSessionIndicator 
        isLoggedInAsUser={isLoggedInAsUser} 
        onReturnToAdmin={handleReturnToAdmin} 
      />

      {userData && (
        <UserProfile 
          userData={userData} 
          isMasterAdmin={isMasterAdmin}
          onLogout={handleLogout}
          updateUserData={updateUserData}
        />
      )}
      
      {/* Admin Panel - Only visible to admins */}
      {isAdmin && (
        <AdminPanel 
          isMasterAdmin={isMasterAdmin}
          allUsers={allUsers}
          updateUsers={updateUsers}
        />
      )}
      
      {/* Master Admin Credentials - Only visible to master admin */}
      {isMasterAdmin && userData && (
        <MasterAdminCredentials
          userData={userData}
          allUsers={allUsers}
          updateUsers={updateUsers}
        />
      )}
      
      {/* User Management Panel - Only visible to master admin */}
      {isMasterAdmin && (
        <UserManagementPanel
          allUsers={allUsers}
          updateUsers={updateUsers}
          isMasterAdmin={isMasterAdmin}
        />
      )}

      {/* User Panels View - Only visible to master admin */}
      {isMasterAdmin && (
        <UserPanelsView
          isMasterAdmin={isMasterAdmin}
          allUsers={allUsers}
        />
      )}
    </>
  );
};

export default UserManagement;
