
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RegisterFormData, User } from '@/types/auth';

export const useAuthRegister = () => {
  const navigate = useNavigate();

  const handleRegister = (data: RegisterFormData) => {
    if (!data.nome || !data.email || !data.senha || !data.confirmSenha) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    if (data.senha !== data.confirmSenha) {
      toast.error('As senhas não conferem');
      return;
    }
    
    // Buscar usuários do localStorage
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    
    // Verificar se já existe usuário com o mesmo email
    const userExists = allUsers.some((u: User) => u.email === data.email);
    
    if (userExists) {
      toast.error('Este e-mail já está cadastrado');
      return;
    }
    
    // Verificar se é o e-mail do administrador mestre
    const isMasterAdmin = data.email === 'admin@juriscalc.com' || data.email === 'johnnysantos_177@msn.com';
    
    // Criar novo usuário
    const newUser: User = {
      id: `user-${Date.now()}`,
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      isAdmin: isMasterAdmin, // Será admin se for o e-mail admin@juriscalc.com
      canViewPanels: isMasterAdmin, // Terá acesso aos painéis se for admin@juriscalc.com
      isPremium: isMasterAdmin // Terá acesso premium se for admin@juriscalc.com
    };
    
    allUsers.push(newUser);
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    
    // Fazer login automático
    localStorage.setItem('userId', newUser.id);
    localStorage.setItem('userEmail', newUser.email);
    localStorage.setItem('userName', newUser.nome);
    localStorage.setItem('userIsAdmin', String(newUser.isAdmin));
    localStorage.setItem('canViewPanels', String(!!newUser.canViewPanels));
    localStorage.setItem('isPremium', String(!!newUser.isPremium));
    
    toast.success('Cadastro realizado com sucesso!');
    navigate('/calculadora');
  };

  return {
    handleRegister
  };
};
