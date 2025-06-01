
<<<<<<< HEAD
import React from 'react';
import { useUserManagement } from '@/hooks/useUserManagement';
import UserProfile from './UserProfile';
import AdminPanel from './AdminPanel';
import UserPanelsView from './UserPanelsView';
import AdminSessionIndicator from './AdminSessionIndicator';
import UserManagementPanel from './UserManagementPanel';
import MasterAdminCredentials from './MasterAdminCredentials';

const UserManagement = () => {
  const {
    userData,
    allUsers,
    isAdmin,
    isMasterAdmin,
    isLoggedInAsUser,
    handleLogout,
    updateUserData,
    updateUsers,
    handleReturnToAdmin
  } = useUserManagement();
  
  return (
    <>
      <AdminSessionIndicator 
        isLoggedInAsUser={isLoggedInAsUser} 
        onReturnToAdmin={handleReturnToAdmin} 
      />

      {userData && (
        <UserProfile 
          userData={userData} 
          isMasterAdmin={isMasterAdmin}
          onLogout={handleLogout}
          updateUserData={updateUserData}
        />
      )}
      
      {/* Admin Panel - Only visible to admins */}
      {isAdmin && (
        <AdminPanel 
          isMasterAdmin={isMasterAdmin}
          allUsers={allUsers}
          updateUsers={updateUsers}
        />
      )}
      
      {/* Master Admin Credentials - Only visible to master admin */}
      {isMasterAdmin && userData && (
        <MasterAdminCredentials
          userData={userData}
          allUsers={allUsers}
          updateUsers={updateUsers}
        />
      )}
      
      {/* User Management Panel - Only visible to master admin */}
      {isMasterAdmin && (
        <UserManagementPanel
          allUsers={allUsers}
          updateUsers={updateUsers}
          isMasterAdmin={isMasterAdmin}
        />
      )}

      {/* User Panels View - Only visible to master admin */}
      {isMasterAdmin && (
        <UserPanelsView
          isMasterAdmin={isMasterAdmin}
          allUsers={allUsers}
        />
      )}
    </>
=======
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { toast } from 'sonner';
import { UserPlus, Edit, Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['perfis']['Row'];

const UserManagement = () => {
  const { profile, isAdmin } = useSupabaseAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  
  // Formulário para novo usuário
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    nome_completo: '',
    plano_id: 'gratuito'
  });

  const fetchProfiles = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setLoading(true);
    try {
      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        user_metadata: {
          nome_completo: newUser.nome_completo
        }
      });

      if (authError) throw authError;

      toast.success('Usuário criado com sucesso!');
      setNewUser({
        email: '',
        password: '',
        nome_completo: '',
        plano_id: 'gratuito'
      });
      fetchProfiles();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (user: Profile) => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({
          nome_completo: user.nome_completo,
          plano_id: user.plano_id
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Usuário atualizado com sucesso!');
      setEditingUser(null);
      fetchProfiles();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!isAdmin || !confirm('Tem certeza que deseja excluir este usuário?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast.success('Usuário excluído com sucesso!');
      fetchProfiles();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
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
    <div className="space-y-6">
      {/* Formulário para criar novo usuário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <Input
                  type="text"
                  value={newUser.nome_completo}
                  onChange={(e) => setNewUser({...newUser, nome_completo: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plano</label>
                <Select
                  value={newUser.plano_id}
                  onValueChange={(value) => 
                    setNewUser({...newUser, plano_id: value})
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gratuito">Gratuito</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados</CardTitle>
          <CardDescription>
            Gerencie todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profiles.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  {editingUser?.id === user.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        value={editingUser.nome_completo}
                        onChange={(e) => setEditingUser({...editingUser, nome_completo: e.target.value})}
                        placeholder="Nome"
                      />
                      <Select
                        value={editingUser.plano_id || 'gratuito'}
                        onValueChange={(value) => 
                          setEditingUser({...editingUser, plano_id: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gratuito">Gratuito</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateUser(editingUser)}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium">{user.nome_completo}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={user.plano_id === 'premium' || user.plano_id === 'admin' ? 'default' : 'secondary'}>
                          {user.plano_id === 'premium' ? 'Premium' : 
                           user.plano_id === 'admin' ? 'Admin' : 'Gratuito'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                {editingUser?.id !== user.id && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4
  );
};

export default UserManagement;
