import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '../../../utils/getInitials';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm'; // Importar componente real
import UploadLogoForm from '@/components/auth/UploadLogoForm'; // Importar componente real

const UserAccountView = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useSupabaseAuth();

  const handleVoltar = () => {
    console.log('[USER_ACCOUNT_VIEW] Voltando para /calculadora');
    navigate('/calculadora'); // Navigate back to the calculator or home page
  };

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-juriscalc-navy mx-auto mb-4"></div>
              <p className="text-lg font-medium">Carregando dados da conta...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Se não há usuário ou perfil após o carregamento, redirecionar para login
  if (!user || !profile) {
    console.log('[USER_ACCOUNT_VIEW] Usuário ou perfil não encontrado após carregamento. Redirecionando para login.');
    // Talvez chamar signOut() antes de navegar para garantir limpeza
    // signOut(); 
    navigate('/login');
    return null; // Evita renderizar o resto enquanto navega
  }

  // Determinar o nome do plano para exibição
  const getPlanName = (planId: string | null | undefined): string => {
    if (!planId) return 'Indefinido';
    switch (planId.toLowerCase()) {
      case 'gratuito': return 'Padrão (Gratuito)';
      case 'premium': return 'Premium';
      case 'admin': return 'Administrador';
      default: return planId;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-serif font-semibold">Minha Conta</h2>
          <Button 
            variant="outline" 
            onClick={handleVoltar} 
            className="border-juriscalc-navy text-juriscalc-navy hover:bg-juriscalc-navy/10"
          >
            Voltar para Calculadora
          </Button>
        </div>

        {/* Card de Informações do Usuário */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar className="h-16 w-16 border">
              {/* Usar profile.logo_url */}
              <AvatarImage src={profile.logo_url || undefined} alt={profile.nome_completo || user.email} />
              <AvatarFallback className="bg-juriscalc-gold text-juriscalc-navy text-xl">
                {getInitials(profile.nome_completo || user.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.nome_completo || 'Nome não definido'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Plano Atual</p>
              <p className="text-lg font-semibold text-juriscalc-navy">{getPlanName(profile.plano_id)}</p>
            </div>
            {profile.telefone && (
              <div>
                <p className="text-sm font-medium text-gray-500">Telefone</p>
                <p>{profile.telefone}</p>
              </div>
            )}
             {/* Adicionar mais informações do perfil se necessário */}
          </CardContent>
        </Card>

        {/* Componente real para Alteração de Senha */}
        <ChangePasswordForm />

        {/* Componente real para Upload de Logo */}
        <UploadLogoForm />

      </div>
    </Layout>
  );
};

export default UserAccountView;

