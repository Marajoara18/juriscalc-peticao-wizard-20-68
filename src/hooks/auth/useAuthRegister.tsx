
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useProfileManager } from './useProfileManager';

interface RegisterData {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmSenha: string;
}

export const useAuthRegister = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { createProfile } = useProfileManager();

  const register = async (data: RegisterData) => {
    const { nome, email, telefone, senha, confirmSenha } = data;

    if (senha !== confirmSenha) {
      toast.error('As senhas não coincidem');
      return { error: 'Senhas não coincidem' };
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return { error: 'Senha muito curta' };
    }

    setLoading(true);
    console.log('[AUTH_REGISTER] Iniciando registro para:', email);

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome_completo: nome,
            telefone: telefone // Incluindo telefone nos metadados
          }
        }
      });

      if (authError) {
        console.error('[AUTH_REGISTER] Erro no Auth:', authError);
        
        if (authError.message.includes('already registered')) {
          toast.error('Este e-mail já está cadastrado. Tente fazer login.');
        } else if (authError.message.includes('email')) {
          toast.error('E-mail inválido. Verifique e tente novamente.');
        } else {
          toast.error(`Erro no cadastro: ${authError.message}`);
        }
        
        return { error: authError.message };
      }

      if (!authData.user) {
        toast.error('Erro inesperado ao criar usuário');
        return { error: 'Erro inesperado' };
      }

      console.log('[AUTH_REGISTER] Usuário criado no Auth:', authData.user.id);

      // 2. Criar perfil se o usuário foi criado
      if (authData.user) {
        const profileResult = await createProfile({
          userId: authData.user.id,
          nomeCompleto: nome,
          email,
          telefone
        });

        if (!profileResult) {
          console.warn('[AUTH_REGISTER] Falha ao criar perfil, mas usuário foi criado no Auth');
        } else {
          console.log('[AUTH_REGISTER] Perfil criado com sucesso');
        }
      }

      // 3. Sucesso
      if (authData.user && !authData.session) {
        toast.success('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
      } else {
        toast.success('Cadastro realizado com sucesso!');
        navigate('/');
      }

      return { error: null };

    } catch (error: any) {
      console.error('[AUTH_REGISTER] Erro inesperado:', error);
      toast.error('Erro inesperado durante o cadastro');
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading
  };
};
