
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthLogin } from './auth/useAuthLogin';
import { useAuthRegister } from './auth/useAuthRegister';
import { usePasswordReset } from './auth/usePasswordReset';

export const useAuth = () => {
  const navigate = useNavigate();
  const { handleLogin, initializeAdminUser } = useAuthLogin();
  const { register } = useAuthRegister();
  const { 
    resetMasterPassword, 
    requestPasswordReset, 
    resetUserPassword 
  } = usePasswordReset();
  
  // Verificar se já está logado
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      navigate('/home');
    }
    
    // Inicializar usuário admin se não existir
    initializeAdminUser();
  }, [navigate, initializeAdminUser]);
  
  return {
    handleLogin,
    handleRegister: register, // Mapear corretamente para a função register
    resetMasterPassword,
    requestPasswordReset,
    resetUserPassword
  };
};
