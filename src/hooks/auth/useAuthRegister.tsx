
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RegisterFormData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useProfileManager } from './useProfileManager';

export const useAuthRegister = () => {
  const navigate = useNavigate();
  const { createProfile } = useProfileManager();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (data: RegisterFormData) => {
    if (!data.nome || !data.email || !data.telefone || !data.senha || !data.confirmSenha) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (data.senha !== data.confirmSenha) {
      toast.error('As senhas não conferem');
      return;
    }

    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          data: {
            nome_completo: data.nome,
            telefone: data.telefone
          }
        }
      });

      if (signUpError) {
        console.error('Erro no Supabase SignUp:', signUpError.message);
        if (signUpError.message.includes('User already registered')) {
          toast.error('Este e-mail já está cadastrado.');
        } else if (signUpError.message.includes('Password should be at least 6 characters')) {
          toast.error('A senha deve ter pelo menos 6 caracteres.');
        } else {
          toast.error(`Erro ao cadastrar: ${signUpError.message}`);
        }
        return;
      }

      if (!signUpData.user || !signUpData.user.id) {
        console.error('Supabase SignUp não retornou usuário ou ID.');
        toast.error('Erro inesperado ao cadastrar. Tente novamente.');
        return;
      }

      const userId = signUpData.user.id;
      console.log('Usuário registrado no Supabase Auth com ID:', userId);

      const profileData = {
        id: userId,
        email: data.email,
        nome_completo: data.nome,
        telefone: data.telefone,
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString(),
      };

      const createdProfile = await createProfile(profileData);

      if (!createdProfile) {
        console.error('Falha ao criar o perfil no Supabase após o registro.');
        toast.error('Cadastro realizado, mas houve um problema ao criar seu perfil. Contacte o suporte.');
        navigate('/login');
        return;
      }

      console.log('Perfil criado no Supabase:', createdProfile);
      toast.success('Cadastro realizado com sucesso! Verifique seu e-mail para confirmação, se necessário.');
      navigate('/login');

    } catch (error: any) {
      console.error('Erro inesperado durante o registro:', error);
      toast.error(`Ocorreu um erro inesperado: ${error.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleRegister,
    register: handleRegister,
    loading
  };
};
