
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useSupabaseAuth } from './auth/useSupabaseAuth';
import { UserData } from '@/types/user';

export const useUserManagement = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useSupabaseAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  
  // Derivar estados do perfil Supabase
  const isAdmin = profile?.plano_id === 'admin' || false;
  const isMasterAdmin = isAdmin; // No Supabase, admin é admin
  const isLoggedInAsUser = false; // Funcionalidade removida por simplicidade
  
  useEffect(() => {
    if (user && profile) {
      console.log('USER_MANAGEMENT: Configurando dados do usuário do Supabase', {
        userId: user.id,
        email: user.email,
        nome: profile.nome_completo,
        plano: profile.plano_id
      });
      
      setUserData({
        id: user.id,
        nome: profile.nome_completo,
        email: user.email,
        isAdmin,
        logoUrl: undefined,
        canViewPanels: isAdmin,
        isPremium: profile.plano_id?.includes('premium') || isAdmin
      });
      
      // Se for admin, carregar todos os usuários (do localStorage como fallback)
      if (isAdmin) {
        loadAllUsers();
      }
    } else if (!user) {
      console.log('USER_MANAGEMENT: Usuário não autenticado, redirecionando');
      navigate('/');
    }
  }, [user, profile, isAdmin, navigate]);
  
  const loadAllUsers = () => {
    // Carregar usuários do localStorage como fallback
    const usersData = localStorage.getItem('allUsers');
    if (usersData) {
      try {
        const parsedUsers: UserData[] = JSON.parse(usersData);
        setAllUsers(parsedUsers);
      } catch (error) {
        console.error('USER_MANAGEMENT: Erro ao carregar usuários:', error);
        setAllUsers([]);
      }
    } else {
      setAllUsers([]);
    }
  };
  
  const handleLogout = async () => {
    console.log('USER_MANAGEMENT: Fazendo logout via Supabase');
    await signOut();
  };

  const updateUserData = (updatedUser: UserData) => {
    setUserData(updatedUser);
    
    // Se for admin, atualizar na lista também
    if (isAdmin) {
      const updatedUsers = allUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      setAllUsers(updatedUsers);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    }
  };

  const updateUsers = (updatedUsers: UserData[]) => {
    setAllUsers(updatedUsers);
    localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
    
    // Se o usuário atual está na lista atualizada, atualizar dados
    if (user) {
      const updatedCurrentUser = updatedUsers.find(u => u.id === user.id);
      if (updatedCurrentUser) {
        setUserData(updatedCurrentUser);
      }
    }
  };

  const handleReturnToAdmin = () => {
    // Funcionalidade removida por simplicidade
    toast.info('Funcionalidade não disponível');
  };
  
  return {
    userData,
    allUsers,
    isAdmin,
    isMasterAdmin,
    isLoggedInAsUser,
    handleLogout,
    updateUserData,
    updateUsers,
    handleReturnToAdmin
  };
};
