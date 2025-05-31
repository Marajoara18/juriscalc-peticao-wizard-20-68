
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Shield, Trash2, Crown, Users, Settings, CheckCircle2, XCircle } from "lucide-react";
import { useAdminManagement } from '@/hooks/admin/useAdminManagement';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { profiles, loading, updateUserPlan, deleteUser, createMasterAdmin } = useAdminManagement();
  const { profile: currentProfile } = useSupabaseAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminEmail) {
      toast.error('Digite um email válido');
      return;
    }
    
    await createMasterAdmin(adminEmail);
    setShowAdminDialog(false);
    setAdminEmail('');
  };

  const toggleUserPlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === 'premium' ? 'gratuito' : 'premium';
    await updateUserPlan(userId, newPlan);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-juriscalc-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Painel Administrativo</h2>
        <Button
          onClick={() => setShowAdminDialog(true)}
          className="bg-juriscalc-gold text-juriscalc-navy hover:bg-opacity-90"
        >
          <Crown className="mr-2 h-4 w-4" />
          Adicionar Admin
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-blue-600">{profiles.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Usuários Premium</p>
                <p className="text-2xl font-bold text-green-600">
                  {profiles.filter(p => p.plano_id === 'premium').length}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {profiles.filter(p => p.plano_id === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Gerenciar Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Users className="h-8 w-8" />
                          <p>Nenhum usuário encontrado</p>
                          <p className="text-sm">Os usuários aparecerão aqui quando forem cadastrados.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map(profile => {
                      const isCurrentUser = profile.id === currentProfile?.id;
                      const isAdmin = profile.plano_id === 'admin';
                      const isPremium = profile.plano_id === 'premium';

                      return (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {profile.nome_completo}
                              {isAdmin && (
                                <Crown className="ml-2 h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              isAdmin 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isAdmin ? 'Admin' : 'Usuário'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              isPremium
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {isPremium ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Premium
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  Gratuito
                                </>
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(profile.data_criacao).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {!isAdmin && !isCurrentUser && (
                                <>
                                  <Switch
                                    checked={isPremium}
                                    onCheckedChange={() => toggleUserPlan(profile.id, profile.plano_id || 'gratuito')}
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteUser(profile.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar admin */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Administrador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="adminEmail">Email do Administrador</label>
              <Input
                id="adminEmail"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@exemplo.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAdmin}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
