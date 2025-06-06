import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import SupabaseLoginForm from '@/components/auth/SupabaseLoginForm';
import { PageLoading } from '@/components/ui/page-loading';

const SupabaseLogin = () => {
  const { user, profile, loading, profileError, retryCount, checkSession } = useSupabaseAuth();
  const navigate = useNavigate();
  const navigationAttempted = useRef(false);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const attemptNavigation = () => {
      // Se já tentamos navegar, não tente novamente
      if (navigationAttempted.current) return;

      // Se temos usuário e perfil, e não está carregando, podemos navegar
      if (!loading && user && profile) {
        console.log('[LOGIN_PAGE] Autenticação completa. Redirecionando para /home...');
        navigationAttempted.current = true;
        navigate('/home', { replace: true });
      }
      // Se não está carregando, não tem usuário ou perfil, e já tentamos várias vezes
      else if (!loading && retryCount >= 3 && (!user || !profile)) {
        console.log('[LOGIN_PAGE] Muitas tentativas sem sucesso. Recarregando página...');
        navigationAttempted.current = true;
        window.location.reload();
      }
      // Se não está carregando mas falta usuário ou perfil, tenta novamente
      else if (!loading && (!user || !profile) && retryCount < 3) {
        console.log('[LOGIN_PAGE] Tentando buscar sessão novamente...');
        timeoutId = setTimeout(() => {
          checkSession();
        }, 1000);
      }
    };

    attemptNavigation();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, profile, loading, navigate, retryCount, checkSession]);

  // Exibe tela de carregamento enquanto o hook verifica a sessão/perfil
  if (loading) {
    return <PageLoading message="Verificando sua sessão..." />;
  }

  // Se o carregamento terminou e houve um erro específico ao buscar o perfil
  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 via-red-200 to-red-300 p-4">
        <div className="text-center text-red-800 bg-white/70 backdrop-blur-sm p-8 rounded-lg shadow-xl max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4">Erro ao Carregar Perfil</h2>
          <p className="mb-6">
            Não foi possível carregar os dados da sua conta. Isso pode ser um problema de conexão ou um erro temporário.
          </p>
          <p className="text-sm opacity-75 bg-red-100 p-2 rounded border border-red-200">
            Detalhe do erro: {profileError.message}
          </p>
          <button 
            onClick={() => {
              navigationAttempted.current = false;
              window.location.reload();
            }} 
            className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Se não está carregando e não tem erro, mostra o formulário de login
  return <SupabaseLoginForm />;
};

export default SupabaseLogin;
