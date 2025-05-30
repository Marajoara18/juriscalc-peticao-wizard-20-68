import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  nome_completo: string;
  email: string;
  plano_id: string;
  oab?: string;
  data_criacao: string;
  data_atualizacao: string;
  limite_calculos_salvos?: number;
  limite_peticoes_salvas?: number;
}

interface User {
  id: string;
  email: string;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async (userId: string) => {
    console.log('SUPABASE_AUTH: Buscando perfil para usuário:', userId);
    try {
      // Usar a nova função segura para buscar perfil
      const { data, error } = await supabase.rpc('get_current_user_profile');

      if (error) {
        console.error('SUPABASE_AUTH: Erro ao buscar perfil via função:', error);
        
        // Fallback: tentar busca direta se a função falhar
        const { data: profileData, error: directError } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', userId)
          .single();

        if (directError) {
          console.error('SUPABASE_AUTH: Erro na busca direta do perfil:', directError);
          
          // Se o perfil não existe, tentar criar um
          if (directError.code === 'PGRST116') {
            console.log('SUPABASE_AUTH: Perfil não existe, tentando criar...');
            return await createProfile(userId);
          }
          
          return null;
        }

        console.log('SUPABASE_AUTH: Perfil encontrado via busca direta:', profileData);
        return profileData;
      }

      if (data && data.length > 0) {
        console.log('SUPABASE_AUTH: Perfil encontrado via função:', data[0]);
        return data[0];
      }

      console.log('SUPABASE_AUTH: Nenhum perfil retornado, tentando criar...');
      return await createProfile(userId);
    } catch (error) {
      console.error('SUPABASE_AUTH: Erro inesperado ao buscar perfil:', error);
      return await createProfile(userId);
    }
  }, []);

  const createProfile = async (userId: string) => {
    console.log('SUPABASE_AUTH: Tentando criar perfil para usuário:', userId);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email || '';
      const nomeCompleto = userData.user?.user_metadata?.nome_completo || 
                          userData.user?.user_metadata?.full_name || 
                          email;

      const { data, error } = await supabase
        .from('perfis')
        .insert({
          id: userId,
          nome_completo: nomeCompleto,
          email: email,
          plano_id: 'gratuito'
        })
        .select()
        .single();

      if (error) {
        console.error('SUPABASE_AUTH: Erro ao criar perfil:', error);
        return null;
      }

      console.log('SUPABASE_AUTH: Perfil criado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('SUPABASE_AUTH: Erro inesperado ao criar perfil:', error);
      return null;
    }
  };

  const checkSession = useCallback(async () => {
    console.log('SUPABASE_AUTH: Verificando sessão...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('SUPABASE_AUTH: Erro ao obter sessão:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('SUPABASE_AUTH: Sessão encontrada:', session.user.id, session.user.email);
        const userData: User = {
          id: session.user.id,
          email: session.user.email || ''
        };
        setUser(userData);

        // Fetch user profile
        const profileData = await fetchProfile(session.user.id);
        if (profileData) {
          console.log('SUPABASE_AUTH: Perfil carregado com sucesso. Plano:', profileData.plano_id);
          setProfile(profileData);
        } else {
          console.log('SUPABASE_AUTH: Não foi possível carregar ou criar perfil');
        }
      } else {
        console.log('SUPABASE_AUTH: Nenhuma sessão ativa encontrada');
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('SUPABASE_AUTH: Erro inesperado na verificação de sessão:', error);
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    console.log('SUPABASE_AUTH: Inicializando hook de autenticação');
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('SUPABASE_AUTH: Mudança de estado de autenticação:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('SUPABASE_AUTH: Usuário logado:', session.user.id, session.user.email);
        const userData: User = {
          id: session.user.id,
          email: session.user.email || ''
        };
        setUser(userData);

        // Buscar perfil após login
        setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          if (profileData) {
            console.log('SUPABASE_AUTH: Perfil carregado após login. Plano:', profileData.plano_id);
            setProfile(profileData);
          }
        }, 100);
        
      } else if (event === 'SIGNED_OUT') {
        console.log('SUPABASE_AUTH: Usuário deslogado');
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      console.log('SUPABASE_AUTH: Limpando subscription');
      subscription.unsubscribe();
    };
  }, [checkSession, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    console.log('SUPABASE_AUTH: Tentativa de login para:', email);
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('SUPABASE_AUTH: Erro no login:', error);
        setLoading(false);
        return { error: { message: error.message } };
      }

      if (data.user) {
        console.log('SUPABASE_AUTH: Login bem-sucedido:', data.user.id);
        const userData: User = {
          id: data.user.id,
          email: data.user.email || ''
        };
        setUser(userData);

        // Buscar perfil
        const profileData = await fetchProfile(data.user.id);
        if (profileData) {
          setProfile(profileData);
          console.log('SUPABASE_AUTH: Perfil definido, redirecionando para /home. Plano:', profileData.plano_id);
          navigate('/home', { replace: true });
        } else {
          console.log('SUPABASE_AUTH: Perfil não encontrado, mas login foi bem-sucedido');
          navigate('/home', { replace: true });
        }
      }

      setLoading(false);
      return { data };
    } catch (error: any) {
      console.error('SUPABASE_AUTH: Erro inesperado no login:', error);
      setLoading(false);
      return { error: { message: 'Erro inesperado no login' } };
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    console.log('SUPABASE_AUTH: Tentativa de cadastro para:', email);
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: nome
          }
        }
      });

      if (error) {
        console.error('SUPABASE_AUTH: Erro no cadastro:', error);
        setLoading(false);
        return { error: { message: error.message } };
      }

      console.log('SUPABASE_AUTH: Cadastro realizado:', data.user?.id);
      setLoading(false);
      return { data };
    } catch (error: any) {
      console.error('SUPABASE_AUTH: Erro inesperado no cadastro:', error);
      setLoading(false);
      return { error: { message: 'Erro inesperado no cadastro' } };
    }
  };

  const signOut = async () => {
    console.log('SUPABASE_AUTH: Tentativa de logout');
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('SUPABASE_AUTH: Erro no logout:', error);
        toast.error('Erro ao fazer logout');
        return;
      }

      setUser(null);
      setProfile(null);
      console.log('SUPABASE_AUTH: Logout realizado, redirecionando para /');
      toast.success('Logout realizado com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('SUPABASE_AUTH: Erro inesperado no logout:', error);
      toast.error('Erro inesperado no logout');
    }
  };

  const resetPassword = async (email: string) => {
    console.log('SUPABASE_AUTH: Solicitação de reset de senha para:', email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.error('SUPABASE_AUTH: Erro no reset de senha:', error);
        toast.error('Erro ao enviar email de recuperação');
        return { error };
      }

      toast.success('Email de recuperação enviado!');
      return { data: 'success' };
    } catch (error) {
      console.error('SUPABASE_AUTH: Erro inesperado no reset de senha:', error);
      toast.error('Erro inesperado na recuperação de senha');
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    console.log('SUPABASE_AUTH: Tentativa de atualização de senha');
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('SUPABASE_AUTH: Erro na atualização de senha:', error);
        toast.error('Erro ao atualizar senha');
        return { error };
      }

      toast.success('Senha atualizada com sucesso!');
      return { data: 'success' };
    } catch (error) {
      console.error('SUPABASE_AUTH: Erro inesperado na atualização de senha:', error);
      toast.error('Erro inesperado ao atualizar senha');
      return { error };
    }
  };

  // Derived states com logs detalhados
  const isPremium = profile?.plano_id?.includes('premium') || profile?.plano_id === 'admin' || false;
  const isAdmin = profile?.plano_id === 'admin' || false;
  
  console.log('SUPABASE_AUTH: Estado atual:', {
    user: !!user,
    profile: !!profile,
    loading,
    isPremium,
    isAdmin,
    planId: profile?.plano_id
  });

  return {
    user,
    profile,
    loading,
    isPremium,
    isAdmin,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
};
