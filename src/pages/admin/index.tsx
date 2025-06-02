import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { UpdateLimits } from '@/scripts/updateLimits';

const AdminPage = () => {
  const { profile } = useSupabaseAuth();
  const isAdmin = profile?.plano_id === 'admin';

  useEffect(() => {
    console.log('Profile:', profile);
    console.log('Is Admin:', isAdmin);
  }, [profile, isAdmin]);

  if (!isAdmin) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta área.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>
      
      <div className="grid gap-6">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Conteúdo existente */}
          </CardContent>
        </Card>

        <UpdateLimits />
      </div>
      
      {/* Outros componentes administrativos aqui */}
    </div>
  );
};

export default AdminPage; 