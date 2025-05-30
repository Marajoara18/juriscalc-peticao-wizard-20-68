
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
// import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import Layout from '@/components/Layout';
// import UserManagement from '@/components/auth/UserManagement';
// import MasterPasswordReset from '@/components/auth/MasterPasswordReset';
import { AlertTriangle } from 'lucide-react';

const UserAccountView = () => {
  const navigate = useNavigate();
  // const { user, profile, loading } = useSupabaseAuth(); // TEMPORARIAMENTE COMENTADO

  console.log('[USER_ACCOUNT_VIEW] Autenticação temporariamente desabilitada');

  const handleVoltar = () => {
    console.log('[USER_ACCOUNT_VIEW] Voltando para /home');
    navigate('/home');
  };

  // CÓDIGO SIMPLIFICADO PARA TESTE SEM AUTENTICAÇÃO
  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-semibold">Minha Conta</h2>
          <Button 
            variant="outline" 
            onClick={handleVoltar} 
            className="border-juriscalc-navy text-juriscalc-navy"
          >
            Voltar
          </Button>
        </div>
        
        {/* AVISO DE AUTENTICAÇÃO DESABILITADA */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Autenticação Temporariamente Desabilitada
            </CardTitle>
            <CardDescription>
              O sistema de autenticação está temporariamente desabilitado para testes. 
              As funcionalidades relacionadas ao usuário não estão disponíveis no momento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => navigate('/home')}
                variant="outline"
                className="border-juriscalc-navy text-juriscalc-navy"
              >
                Ir para Home
              </Button>
              <Button 
                onClick={() => navigate('/calculadora')}
                variant="outline"
                className="border-juriscalc-navy text-juriscalc-navy"
              >
                Ir para Calculadora
              </Button>
              <Button 
                onClick={() => navigate('/peticoes')}
                variant="outline"
                className="border-juriscalc-navy text-juriscalc-navy"
              >
                Ir para Petições
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* COMPONENTES ORIGINAIS COMENTADOS PARA REATIVAÇÃO FUTURA:
        
        <UserManagement />
        
        <MasterPasswordReset />
        
        */}
      </div>
    </Layout>
  );

  /* CÓDIGO ORIGINAL COMENTADO PARA REATIVAÇÃO FUTURA:
  
  useEffect(() => {
    console.log('[USER_ACCOUNT_VIEW] Componente montado.');
    
    return () => {
      console.log('[USER_ACCOUNT_VIEW] Desmontando.');
    };
  }, []);

  useEffect(() => {
    console.log('[USER_ACCOUNT_VIEW] Estado de auth mudou:', {
      user: !!user,
      profile: !!profile,
      loading
    });
  }, [user, profile, loading]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-juriscalc-navy mx-auto mb-4"></div>
              <p className="text-lg font-medium">Carregando...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Se não há usuário após o carregamento, mostrar mensagem
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg font-medium mb-4">Você precisa estar logado para acessar esta página.</p>
              <Button onClick={() => navigate('/')}>Ir para Login</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-semibold">Minha Conta</h2>
          <Button 
            variant="outline" 
            onClick={handleVoltar} 
            className="border-juriscalc-navy text-juriscalc-navy"
          >
            Voltar
          </Button>
        </div>
        
        <UserManagement />
        
        <MasterPasswordReset />
      </div>
    </Layout>
  );
  
  */
};

export default UserAccountView;
