import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RegisterFormData } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client'; // Importar supabase client
import { useProfileManager } from './useProfileManager'; // Importar hook para criar perfil

export const useAuthRegister = () => {
  const navigate = useNavigate();
  const { createProfile } = useProfileManager(); // Obter função createProfile

  const handleRegister = async (data: RegisterFormData) => {
    if (!data.nome || !data.email || !data.telefone || !data.senha || !data.confirmSenha) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (data.senha !== data.confirmSenha) {
      toast.error('As senhas não conferem');
      return;
    }

    try {
      // 1. Tentar registrar o usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          // Opcional: enviar dados adicionais que podem ser usados em triggers ou funções
          // data: {
          //   nome_completo: data.nome,
          //   telefone: data.telefone
          // }
        }
      });

      if (signUpError) {
        console.error('Erro no Supabase SignUp:', signUpError.message);
        // Verificar erros comuns
        if (signUpError.message.includes('User already registered')) {
          toast.error('Este e-mail já está cadastrado.');
        } else if (signUpError.message.includes('Password should be at least 6 characters')) {
          toast.error('A senha deve ter pelo menos 6 caracteres.');
        } else {
          toast.error(`Erro ao cadastrar: ${signUpError.message}`);
        }
        return;
      }

      // Verificar se o usuário foi criado e tem ID
      if (!signUpData.user || !signUpData.user.id) {
        console.error('Supabase SignUp não retornou usuário ou ID.');
        toast.error('Erro inesperado ao cadastrar. Tente novamente.');
        return;
      }

      const userId = signUpData.user.id;
      console.log('Usuário registrado no Supabase Auth com ID:', userId);

      // 2. Criar o perfil na tabela 'perfis' usando a função do useProfileManager
      const profileData = {
        userId: userId,
        nomeCompleto: data.nome,
        email: data.email,
        telefone: data.telefone,
      };

      const createdProfile = await createProfile(profileData);

      if (!createdProfile) {
        // Idealmente, deveríamos tentar reverter o signUp ou lidar com o erro
        // Por agora, informamos o usuário, mas a conta Auth existe sem perfil
        console.error('Falha ao criar o perfil no Supabase após o registro.');
        toast.error('Cadastro realizado, mas houve um problema ao criar seu perfil. Contacte o suporte.');
        // Poderia redirecionar para o login ou uma página de erro
        navigate('/login');
        return;
      }

      console.log('Perfil criado no Supabase:', createdProfile);

      // 3. Sucesso - Informar o usuário e redirecionar
      // O Supabase Auth geralmente lida com o login automático após signUp se a confirmação de email estiver desativada
      // Se a confirmação estiver ativa, o usuário precisará confirmar o email antes de logar.
      toast.success('Cadastro realizado com sucesso! Verifique seu e-mail para confirmação, se necessário.');
      // Redirecionar para a página de login ou para uma página que informa sobre a confirmação de email
      navigate('/login'); // Ou para '/calculadora' se o login for automático

    } catch (error: any) {
      console.error('Erro inesperado durante o registro:', error);
      toast.error(`Ocorreu um erro inesperado: ${error.message || 'Tente novamente.'}`);
    }
  };

  return {
    handleRegister
  };
};

