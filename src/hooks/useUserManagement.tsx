
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, UserData } from '@/types/user';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

export const useUserManagement = () => {
  const navigate = useNavigate();
  const { user: supabaseUser, profile, signOut, loading } = useSupabaseAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [isLoggedInAsUser, setIsLoggedInAsUser] = useState(false);

  console.log('[USER_MANAGEMENT] Hook inicializado. Supabase user:', !!supabaseUser, 'Profile:', !!profile, 'Loading:', loading);

  useEffect(() => {
    console.log('[USER_MANAGEMENT] useEffect - verificando autenticação');
    console.log('[USER_MANAGEMENT] supabaseUser:', !!supabaseUser, 'profile:', !!profile, 'loading:', loading);
    
    // Só redireciona se não estiver carregando E realmente não houver usuário
    if (!loading && !supabaseUser) {
      console.log('[USER_MANAGEMENT] Usuário não autenticado após carregamento, redirecionando');
      navigate('/');
      return;
    }

    // Só carrega dados se tiver usuário e perfil
    if (supabaseUser && profile) {
      console.log('[USER_MANAGEMENT] Usuário autenticado, carregando dados');
      loadUserData();
      loadAllUsers();
    }
  }, [supabaseUser, profile, loading, navigate]);

  const loadUserData = () => {
    console.log('[USER_MANAGEMENT] Carregando dados do usuário');
    if (!supabaseUser || !profile) {
      console.log('[USER_MANAGEMENT] Dados insuficientes para carregar userData');
      return;
    }

    // Verificar se é admin via plano_id
    const isAdminUser = profile.plano_id === 'admin' || profile.plano_id === 'premium';
    const isMasterAdminUser = supabaseUser.email === 'admin@juriscalc.com' || supabaseUser.email === 'johnnysantos_177@msn.com';
    
    console.log('[USER_MANAGEMENT] Verificações de permissões:', {
      email: supabaseUser.email,
      planId: profile.plano_id,
      isAdminUser,
      isMasterAdminUser
    });

    setIsAdmin(isAdminUser);
    setIsMasterAdmin(isMasterAdminUser);

    // Criar userData a partir do perfil Supabase
    const currentUserData: UserData = {
      id: supabaseUser.id,
      nome: profile.nome_completo,
      email: supabaseUser.email || '',
      isAdmin: isAdminUser,
      isPremium: profile.plano_id !== 'gratuito',
      canViewPanels: isMasterAdminUser,
      logoUrl: undefined,
      oab: profile.oab || undefined,
      planoId: profile.plano_id,
      limiteCalculosSalvos: profile.limite_calculos_salvos,
      limitePeticoesSalvas: profile.limite_peticoes_salvas
    };

    console.log('[USER_MANAGEMENT] UserData criado:', currentUserData);
    setUserData(currentUserData);
  };

  const loadAllUsers = () => {
    console.log('[USER_MANAGEMENT] Carregando todos os usuários do localStorage');
    try {
      const users = JSON.parse(localStorage.getItem('allUsers') || '[]');
      console.log('[USER_MANAGEMENT] Usuários carregados do localStorage:', users.length);
      setAllUsers(users);
    } catch (error) {
      console.error('[USER_MANAGEMENT] Erro ao carregar usuários:', error);
      setAllUsers([]);
    }
  };

  const handleLogout = async () => {
    console.log('[USER_MANAGEMENT] Fazendo logout');
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('[USER_MANAGEMENT] Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const updateUserData = (updatedUser: UserData) => {
    console.log('[USER_MANAGEMENT] Atualizando dados do usuário:', updatedUser);
    setUserData(updatedUser);
  };

  const updateUsers = (users: User[]) => {
    console.log('[USER_MANAGEMENT] Atualizando lista de usuários:', users.length);
    setAllUsers(users);
    localStorage.setItem('allUsers', JSON.stringify(users));
  };

  const handleReturnToAdmin = () => {
    console.log('[USER_MANAGEMENT] Retornando para sessão de admin');
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      const adminData = JSON.parse(adminSession);
      localStorage.setItem('userId', adminData.userId);
      localStorage.setItem('userEmail', adminData.userEmail);
      localStorage.setItem('userName', adminData.userName);
      localStorage.setItem('userIsAdmin', adminData.userIsAdmin);
      localStorage.removeItem('adminSession');
      setIsLoggedInAsUser(false);
      window.location.reload();
    }
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
