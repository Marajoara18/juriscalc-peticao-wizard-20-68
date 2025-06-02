import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UserData } from '@/types/user';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

// Definir limites padrão
const LIMITES_PADRAO = {
  gratuito: {
    calculos: 6,
    peticoes: 6
  },
  premium: {
    calculos: 999999,
    peticoes: 999999
  },
  admin: {
    calculos: 999999,
    peticoes: 999999
  }
};

export const useUserManagement = () => {
  const navigate = useNavigate();
  const { user: supabaseUser, profile, loading, signOut, isAdmin } = useSupabaseAuth(); 
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  console.log('[USER_MANAGEMENT] Hook initialized. Supabase user:', !!supabaseUser, 'Profile:', !!profile, 'Loading:', loading, 'Is Admin:', isAdmin);

  useEffect(() => {
    console.log('[USER_MANAGEMENT] Auth state changed:', { loading, hasUser: !!supabaseUser, hasProfile: !!profile, isAdmin });
    if (!loading && supabaseUser && profile) {
      console.log('[USER_MANAGEMENT] Auth ready, deriving user data and permissions.');
      const masterAdminEmails = ['admin@juriscalc.com', 'johnnysantos_177@msn.com']; 
      const isMasterAdminUser = supabaseUser.email ? masterAdminEmails.includes(supabaseUser.email) : false;

      setIsMasterAdmin(isMasterAdminUser);

      // Determinar os limites com base no plano
      const planoAtual = profile.plano_id || 'gratuito';
      const limites = LIMITES_PADRAO[planoAtual as keyof typeof LIMITES_PADRAO] || LIMITES_PADRAO.gratuito;

      const currentUserData: UserData = {
        id: supabaseUser.id,
        nome: profile.nome_completo,
        email: supabaseUser.email || '',
        isAdmin: isAdmin,
        isPremium: profile.plano_id !== 'gratuito',
        canViewPanels: isMasterAdminUser, 
        logoUrl: undefined,
        oab: profile.oab || undefined,
<<<<<<< HEAD
        planoId: planoAtual,
        limiteCalculosSalvos: profile.limite_calculos_salvos || limites.calculos,
        limitePeticoesSalvas: profile.limite_peticoes_salvas || limites.peticoes
=======
        planoId: profile.plano_id || 'gratuito',
        limiteCalculosSalvos: profile.limite_calculos_salvos || 6, // Alterado de 3 para 6
        limitePeticoesSalvas: profile.limite_peticoes_salvas || 1
>>>>>>> e00c78adb715a0f761b3a6105e52911bf261efc1
      };
      console.log('[USER_MANAGEMENT] UserData derived:', currentUserData);
      setUserData(currentUserData);

      if (isAdmin) {
        fetchAllUsers();
      }

    } else if (!loading && !supabaseUser) {
      console.log('[USER_MANAGEMENT] User logged out or session invalid.');
      setUserData(null);
      setIsMasterAdmin(false);
      setAllUsers([]);
    }
  }, [supabaseUser, profile, loading, isAdmin]);

  const fetchAllUsers = useCallback(async () => {
    console.log('[USER_MANAGEMENT] Fetching all users from Supabase...');
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*');

      if (error) {
        console.error('[USER_MANAGEMENT] Error fetching users:', error);
        toast.error('Erro ao carregar lista de usuários.');
        setAllUsers([]);
      } else {
        console.log('[USER_MANAGEMENT] Users fetched successfully:', data.length);
<<<<<<< HEAD
        // Convert to UserData format
        const mappedUsers: UserData[] = (data || []).map(profile => {
          const planoAtual = profile.plano_id || 'gratuito';
          const limites = LIMITES_PADRAO[planoAtual as keyof typeof LIMITES_PADRAO] || LIMITES_PADRAO.gratuito;
          
          return {
            id: profile.id,
            nome: profile.nome_completo,
            email: profile.email,
            isAdmin: profile.plano_id === 'admin',
            isPremium: profile.plano_id !== 'gratuito',
            canViewPanels: false,
            logoUrl: undefined,
            oab: profile.oab || undefined,
            planoId: planoAtual,
            limiteCalculosSalvos: profile.limite_calculos_salvos || limites.calculos,
            limitePeticoesSalvas: profile.limite_peticoes_salvas || limites.peticoes
          };
        });
=======
        // Convert to UserData format - atualizado limite padrão para 6
        const mappedUsers: UserData[] = (data || []).map(profile => ({
          id: profile.id,
          nome: profile.nome_completo,
          email: profile.email,
          isAdmin: profile.plano_id === 'admin',
          isPremium: profile.plano_id !== 'gratuito',
          canViewPanels: false,
          logoUrl: undefined,
          oab: profile.oab || undefined,
          planoId: profile.plano_id || 'gratuito',
          limiteCalculosSalvos: profile.limite_calculos_salvos || 6, // Alterado de 3 para 6
          limitePeticoesSalvas: profile.limite_peticoes_salvas || 1
        }));
>>>>>>> e00c78adb715a0f761b3a6105e52911bf261efc1
        setAllUsers(mappedUsers); 
      }
    } catch (error) {
      console.error('[USER_MANAGEMENT] Unexpected error fetching users:', error);
      toast.error('Erro inesperado ao carregar usuários.');
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const handleLogout = async () => {
    console.log('[USER_MANAGEMENT] Handling logout');
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('[USER_MANAGEMENT] Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const updateCurrentUserData = (updatedData: Partial<UserData>) => {
    console.log('[USER_MANAGEMENT] Updating local userData state:', updatedData);
    setUserData(prevData => prevData ? { ...prevData, ...updatedData } : null);
  };

  const updateUsers = (updatedUsers: UserData[]) => {
    setAllUsers(updatedUsers);
  };

  return {
    userData,
    isAdmin,
    isMasterAdmin,
    allUsers,
    loadingUsers,
    fetchAllUsers,
    handleLogout,
    updateCurrentUserData,
    updateUsers,
    loading
  };
};
