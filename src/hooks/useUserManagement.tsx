
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserData } from '@/types/user';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';

// Define User type for database operations
interface User {
  id: string;
  email?: string;
  nome_completo?: string;
  plano_id?: string;
}

export const useUserManagement = () => {
  const navigate = useNavigate();
  const { user: supabaseUser, profile, loading, signOut } = useSupabaseAuth(); 
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  console.log('[USER_MANAGEMENT] Hook initialized. Supabase user:', !!supabaseUser, 'Profile:', !!profile, 'Loading:', loading);

  useEffect(() => {
    console.log('[USER_MANAGEMENT] Auth state changed:', { loading, hasUser: !!supabaseUser, hasProfile: !!profile });
    if (!loading && supabaseUser && profile) {
      console.log('[USER_MANAGEMENT] Auth ready, deriving user data and permissions.');
      const isAdminUser = profile.plano_id === 'admin' || profile.plano_id === 'premium';
      const masterAdminEmails = ['admin@juriscalc.com', 'johnnysantos_177@msn.com']; 
      const isMasterAdminUser = supabaseUser.email ? masterAdminEmails.includes(supabaseUser.email) : false;

      setIsAdmin(isAdminUser);
      setIsMasterAdmin(isMasterAdminUser);

      const currentUserData: UserData = {
        id: supabaseUser.id,
        nome: profile.nome_completo,
        email: supabaseUser.email || '',
        isAdmin: isAdminUser,
        isPremium: profile.plano_id !== 'gratuito',
        canViewPanels: isMasterAdminUser, 
        logoUrl: undefined, // Remove logo_url reference since it doesn't exist in Profile type
        oab: profile.oab || undefined,
        planoId: profile.plano_id,
        limiteCalculosSalvos: profile.limite_calculos_salvos,
        limitePeticoesSalvas: profile.limite_peticoes_salvas
      };
      console.log('[USER_MANAGEMENT] UserData derived:', currentUserData);
      setUserData(currentUserData);

      if (isAdminUser) {
        fetchAllUsers();
      }

    } else if (!loading && !supabaseUser) {
      console.log('[USER_MANAGEMENT] User logged out or session invalid.');
      setUserData(null);
      setIsAdmin(false);
      setIsMasterAdmin(false);
      setAllUsers([]);
    }
  }, [supabaseUser, profile, loading]);

  const fetchAllUsers = useCallback(async () => {
    console.log('[USER_MANAGEMENT] Fetching all users from Supabase...');
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('id, nome_completo, email, plano_id');

      if (error) {
        console.error('[USER_MANAGEMENT] Error fetching users:', error);
        toast.error('Erro ao carregar lista de usuários.');
        setAllUsers([]);
      } else {
        console.log('[USER_MANAGEMENT] Users fetched successfully:', data.length);
        setAllUsers(data || []); 
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

  return {
    userData,
    isAdmin,
    isMasterAdmin,
    allUsers,
    loadingUsers,
    fetchAllUsers,
    handleLogout,
    updateCurrentUserData,
    loading
  };
};
