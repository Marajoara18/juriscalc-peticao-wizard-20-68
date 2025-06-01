
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
<<<<<<< HEAD
import { User as SupabaseUser } from '@supabase/supabase-js'; // Renamed to avoid conflict
import { UserData, Profile } from '@/types/user'; // Assuming Profile type is defined here or imported
=======
import { UserData } from '@/types/user';
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client for direct calls if needed

<<<<<<< HEAD
// Define User type if not already globally available or imported correctly
interface User {
  id: string;
  email?: string;
  // Add other relevant fields from your 'users' or 'profiles' table
  nome_completo?: string;
  plano_id?: string;
  // ... other fields
}

=======
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4
export const useUserManagement = () => {
  const navigate = useNavigate();
  // Get user, profile, loading state, and signOut from the central auth hook
  const { user: supabaseUser, profile, loading, signOut } = useSupabaseAuth(); 
  
  // State derived directly from useSupabaseAuth context
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMasterAdmin, setIsMasterAdmin] = useState(false);
<<<<<<< HEAD
  
  // State for the list of all users - now fetched from Supabase, not localStorage
  const [allUsers, setAllUsers] = useState<User[]>([]); 
  const [loadingUsers, setLoadingUsers] = useState(false); // State to track loading of all users
=======
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4

  console.log('[USER_MANAGEMENT] Hook initialized. Supabase user:', !!supabaseUser, 'Profile:', !!profile, 'Loading:', loading);

  // Effect to derive userData, isAdmin, isMasterAdmin when auth state is ready
  useEffect(() => {
    console.log('[USER_MANAGEMENT] Auth state changed:', { loading, hasUser: !!supabaseUser, hasProfile: !!profile });
    if (!loading && supabaseUser && profile) {
      console.log('[USER_MANAGEMENT] Auth ready, deriving user data and permissions.');
      const isAdminUser = profile.plano_id === 'admin' || profile.plano_id === 'premium';
      // Define master admin emails securely, ideally from env vars or config
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
        // canViewPanels might be better derived directly from isMasterAdmin where needed
        canViewPanels: isMasterAdminUser, 
<<<<<<< HEAD
        logoUrl: profile.logo_url || undefined, // Assuming logo_url exists in profile type
=======
        logoUrl: undefined,
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4
        oab: profile.oab || undefined,
        planoId: profile.plano_id || 'gratuito',
        limiteCalculosSalvos: profile.limite_calculos_salvos || 3,
        limitePeticoesSalvas: profile.limite_peticoes_salvas || 1
      };
      console.log('[USER_MANAGEMENT] UserData derived:', currentUserData);
      setUserData(currentUserData);

      // If the current user is an admin, fetch all users
      if (isAdminUser) {
        fetchAllUsers();
      }

    } else if (!loading && !supabaseUser) {
      // Clear state if user logs out
      console.log('[USER_MANAGEMENT] User logged out or session invalid.');
      setUserData(null);
      setIsAdmin(false);
      setIsMasterAdmin(false);
      setAllUsers([]);
      // Navigation should ideally be handled by ProtectedRoute or App router logic
      // navigate('/'); // Avoid direct navigation from hooks if possible
    }
  }, [supabaseUser, profile, loading]); // Dependencies: auth state

  // Function to fetch all users from Supabase (example)
  // This should ideally be a separate hook or service, called only when needed
  const fetchAllUsers = useCallback(async () => {
    console.log('[USER_MANAGEMENT] Fetching all users from Supabase...');
    setLoadingUsers(true);
    try {
      // Ensure you have appropriate RLS policies in Supabase
      // This might require an admin role or specific permissions
      const { data, error } = await supabase
<<<<<<< HEAD
        .from('perfis') // Assuming 'perfis' table holds user profiles
        .select('id, nome_completo, email, plano_id'); // Select only necessary fields
=======
        .from('perfis')
        .select('*');
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4

      if (error) {
        console.error('[USER_MANAGEMENT] Error fetching users:', error);
        toast.error('Erro ao carregar lista de usuários.');
        setAllUsers([]);
      } else {
        console.log('[USER_MANAGEMENT] Users fetched successfully:', data.length);
<<<<<<< HEAD
        // Map Supabase data to your User type if necessary
        setAllUsers(data || []); 
=======
        // Convert to UserData format
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
          limiteCalculosSalvos: profile.limite_calculos_salvos || 3,
          limitePeticoesSalvas: profile.limite_peticoes_salvas || 1
        }));
        setAllUsers(mappedUsers); 
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4
      }
    } catch (error) {
      console.error('[USER_MANAGEMENT] Unexpected error fetching users:', error);
      toast.error('Erro inesperado ao carregar usuários.');
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Logout function using the central signOut operation
  const handleLogout = async () => {
    console.log('[USER_MANAGEMENT] Handling logout');
    try {
      await signOut();
      // Navigation is handled by onAuthStateChange listener or ProtectedRoute
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('[USER_MANAGEMENT] Error during logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  // Function to update the local state for the current user's data
  // Note: This only updates the local state. To persist changes, 
  // you need separate functions to update the profile in Supabase.
  const updateCurrentUserData = (updatedData: Partial<UserData>) => {
    console.log('[USER_MANAGEMENT] Updating local userData state:', updatedData);
    setUserData(prevData => prevData ? { ...prevData, ...updatedData } : null);
  };

  // REMOVED: updateUsers function that relied on localStorage.
  // Components needing to modify the user list should call fetchAllUsers again 
  // or use more specific Supabase update/delete functions.

  // REMOVED: handleReturnToAdmin and related state (isLoggedInAsUser)
  // This feature needs a secure server-side implementation (e.g., Supabase Edge Functions)
  // if it's required.

  return {
    userData, // Current logged-in user's derived data
    isAdmin, // Is the current user an admin?
    isMasterAdmin, // Is the current user a master admin?
    allUsers, // List of all users (fetched if admin)
    loadingUsers, // Loading state for the allUsers list
    fetchAllUsers, // Function to trigger fetching all users (if needed manually)
    handleLogout, // Logout function
    updateCurrentUserData, // Function to update local state (doesn't persist to DB)
    // Expose supabaseUser and profile if needed directly by components
    // supabaseUser,
    // profile,
    loading // Expose the main auth loading state
  };
};

