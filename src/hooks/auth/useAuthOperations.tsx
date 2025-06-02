import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, Profile } from './types';

interface UseAuthOperationsProps {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  fetchProfile: (userId: string) => Promise<Profile | null>;
}

export const useAuthOperations = ({ 
  setUser, 
  setProfile, 
  setLoading, 
  fetchProfile 
}: UseAuthOperationsProps) => {
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    console.log('AUTH_OPERATIONS: Tentativa de login para:', email);
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('AUTH_OPERATIONS: Erro no login:', error);
        setLoading(false);
        return { error: { message: error.message } };
      }

      if (data.user) {
        console.log('AUTH_OPERATIONS: Login bem-sucedido:', data.user.id);
        const userData: User = {
          id: data.user.id,
          email: data.user.email || ''
        };
        setUser(userData);

        // Buscar perfil
        const profileData = await fetchProfile(data.user.id);
        if (profileData) {
          setProfile(profileData);
          console.log('AUTH_OPERATIONS: Perfil definido, redirecionando para /home. Plano:', profileData.plano_id);
          navigate('/home', { replace: true });
        } else {
          console.log('AUTH_OPERATIONS: Perfil não encontrado, mas login foi bem-sucedido');
          navigate('/home', { replace: true });
        }
      }

      setLoading(false);
      return { data };
    } catch (error: any) {
      console.error('AUTH_OPERATIONS: Erro inesperado no login:', error);
      setLoading(false);
      return { error: { message: 'Erro inesperado no login' } };
    }
  };

  const signUp = async (email: string, password: string, nome: string, telefone?: string) => {
    console.log('AUTH_OPERATIONS: Tentativa de cadastro para:', email);
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: nome,
            telefone: telefone
          }
        }
      });

      if (error) {
        console.error('AUTH_OPERATIONS: Erro no cadastro:', error);
        setLoading(false);
        return { error: { message: error.message } };
      }

      console.log('AUTH_OPERATIONS: Cadastro realizado:', data.user?.id);
      setLoading(false);
      return { data };
    } catch (error: any) {
      console.error('AUTH_OPERATIONS: Erro inesperado no cadastro:', error);
      setLoading(false);
      return { error: { message: 'Erro inesperado no cadastro' } };
    }
  };

  const signOut = async () => {
    console.log('AUTH_OPERATIONS: Tentativa de logout');
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AUTH_OPERATIONS: Erro no logout:', error);
        toast.error('Erro ao fazer logout');
        return;
      }

      setUser(null);
      setProfile(null);
      console.log('AUTH_OPERATIONS: Logout realizado, redirecionando para /');
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('AUTH_OPERATIONS: Erro inesperado no logout:', error);
      toast.error('Erro inesperado no logout');
    }
  };

  const resetPassword = async (email: string) => {
    console.log('AUTH_OPERATIONS: Solicitação de reset de senha para:', email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.error('AUTH_OPERATIONS: Erro no reset de senha:', error);
        toast.error('Erro ao enviar email de recuperação');
        return { error };
      }

      toast.success('Email de recuperação enviado!');
      return { data: 'success' };
    } catch (error) {
      console.error('AUTH_OPERATIONS: Erro inesperado no reset de senha:', error);
      toast.error('Erro inesperado na recuperação de senha');
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    console.log('AUTH_OPERATIONS: Tentativa de atualização de senha');
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('AUTH_OPERATIONS: Erro na atualização de senha:', error);
        toast.error('Erro ao atualizar senha');
        return { error };
      }

      toast.success('Senha atualizada com sucesso!');
      return { data: 'success' };
    } catch (error) {
      console.error('AUTH_OPERATIONS: Erro inesperado na atualização de senha:', error);
      toast.error('Erro inesperado ao atualizar senha');
      return { error };
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };
};
