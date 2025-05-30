
import React from 'react';
import Layout from '@/components/Layout';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';

const AdminPanel = () => {
  const { isAdmin, loading, profile } = useSupabaseAuth();

  console.log('ADMIN_PANEL: Estado atual:', {
    isAdmin,
    loading,
    planId: profile?.plano_id,
    profile: !!profile
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-juriscalc-navy"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto py-10 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Acesso Negado
              </CardTitle>
              <CardDescription>
                Você não tem permissão para acessar o painel administrativo.
                <br />
                Plano atual: {profile?.plano_id || 'Não definido'}
                <br />
                É necessário ter plano 'admin' para acessar esta área.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminDashboard />
    </Layout>
  );
};

export default AdminPanel;
