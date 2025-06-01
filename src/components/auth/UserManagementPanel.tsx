
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UserPlus, Trash2, Shield, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import { UserData } from '@/types/user';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface UserManagementPanelProps {
  allUsers: UserData[];
  updateUsers: (updatedUsers: UserData[]) => void;
  isMasterAdmin: boolean;
}

const userSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  isAdmin: z.boolean().optional(),
  canViewPanels: z.boolean().optional(),
  isPremium: z.boolean().optional()
});

type UserFormData = z.infer<typeof userSchema>;

const UserManagementPanel = ({ allUsers, updateUsers, isMasterAdmin }: UserManagementPanelProps) => {
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: '',
      email: '',
      isAdmin: false,
      canViewPanels: false,
      isPremium: false
    }
  });
  
  const handleCreateUser = (data: UserFormData) => {
    // Verificar se já existe um usuário com o mesmo email
    if (allUsers.some(user => user.email === data.email)) {
      toast.error("Já existe um usuário com este e-mail");
      return;
    }
    
    // Criar novo usuário com todas as propriedades necessárias
    const newUser: UserData = {
      id: `user-${Date.now()}`,
      nome: data.nome,
      email: data.email,
      isAdmin: !!data.isAdmin,
      canViewPanels: !!data.canViewPanels,
      isPremium: !!data.isPremium,
      planoId: data.isPremium ? 'premium' : 'gratuito',
      limiteCalculosSalvos: data.isPremium ? 999999 : 3,
      limitePeticoesSalvas: data.isPremium ? 999999 : 1
    };
    
    const updatedUsers = [...allUsers, newUser];
    updateUsers(updatedUsers);
    
    toast.success(`Usuário ${data.nome} criado com sucesso!`);
    setShowAddUserDialog(false);
    form.reset();
  };
  
  const handleDeleteUser = (userId: string) => {
    // Verificar se é um admin mestre (não permitir exclusão)
    const user = allUsers.find(u => u.id === userId);
    
    if (user?.email === 'admin@juriscalc.com' || user?.email === 'johnnysantos_177@msn.com') {
      toast.error("Não é possível excluir um administrador mestre");
      return;
    }
    
    // Excluir usuário
    const updatedUsers = allUsers.filter(u => u.id !== userId);
    updateUsers(updatedUsers);
    
    toast.success("Usuário excluído com sucesso!");
    setUserToDelete(null);
  };
  
  const togglePremiumAccess = (userId: string, currentValue: boolean) => {
    if (!isMasterAdmin) {
      toast.error('Apenas o administrador mestre pode modificar permissões de acesso premium.');
      return;
    }
    
    // Verificar se é um admin mestre (já tem acesso premium por padrão)
    const user = allUsers.find(u => u.id === userId);
    if (user?.email === 'admin@juriscalc.com' || user?.email === 'johnnysantos_177@msn.com') {
      toast.info("Administradores mestres já possuem acesso premium por padrão");
      return;
    }
    
    // Atualizar a lista de usuários com a nova permissão
    const updatedUsers = allUsers.map(user => {
      if (user.id === userId) {
        return { 
          ...user, 
          isPremium: !currentValue,
          planoId: !currentValue ? 'premium' : 'gratuito',
          limiteCalculosSalvos: !currentValue ? 999999 : 3,
          limitePeticoesSalvas: !currentValue ? 999999 : 1
        };
      }
      return user;
    });
    
    updateUsers(updatedUsers);
    
    const userName = updatedUsers.find(user => user.id === userId)?.nome;
    const action = !currentValue ? 'ativado' : 'desativado';
    toast.success(`Acesso premium para ${userName} ${action} com sucesso!`);
  };

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Gerenciamento de Usuários
        </CardTitle>
        {isMasterAdmin && (
          <Button 
            onClick={() => setShowAddUserDialog(true)}
            className="bg-juriscalc-gold text-juriscalc-navy hover:bg-opacity-90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Acesso Premium</TableHead>
                {isMasterAdmin && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    Nenhum usuário cadastrado no sistema.
                  </TableCell>
                </TableRow>
              ) : (
                allUsers.map(user => {
                  const isMaster = user.email === 'admin@juriscalc.com' || 
                                  user.email === 'johnnysantos_177@msn.com';
                  const isPremium = isMaster || user.isPremium;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {user.nome}
                          {isMaster && (
                            <span className="ml-2 bg-juriscalc-gold text-juriscalc-navy text-xs px-2 py-1 rounded-full inline-flex items-center">
                              <Shield className="h-3 w-3 mr-1" />
                              Mestre
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <span className="bg-juriscalc-gold text-juriscalc-navy px-2 py-1 rounded-full text-xs">
                            Admin
                          </span>
                        ) : (
                          <span className="bg-juriscalc-lightgray px-2 py-1 rounded-full text-xs">
                            Usuário
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isMasterAdmin ? (
                          <Toggle
                            pressed={isPremium}
                            onPressedChange={() => togglePremiumAccess(user.id, isPremium)}
                            disabled={isMaster}
                            className="data-[state=on]:bg-green-500"
                            aria-label="Toggle premium access"
                          >
                            {isPremium ? (
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Ilimitado
                              </span>
                            ) : (
                              <span className="flex items-center text-gray-500">
                                <XCircle className="h-4 w-4 mr-1" />
                                Não
                              </span>
                            )}
                          </Toggle>
                        ) : (
                          <span className={`flex items-center ${isPremium ? 'text-green-600' : 'text-gray-500'}`}>
                            {isPremium ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Ilimitado
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Não
                              </>
                            )}
                          </span>
                        )}
                      </TableCell>
                      {isMasterAdmin && (
                        <TableCell className="text-right">
                          {!isMaster && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setUserToDelete(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Diálogo para adicionar novo usuário */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Adicionar Novo Usuário
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="usuario@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4"
                      />
                    </FormControl>
                    <FormLabel className="mb-0 font-normal">É administrador?</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="canViewPanels"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4"
                      />
                    </FormControl>
                    <FormLabel className="mb-0 font-normal">Pode visualizar painéis?</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isPremium"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4"
                      />
                    </FormControl>
                    <FormLabel className="mb-0 font-normal">Acesso Premium Ilimitado?</FormLabel>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddUserDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Usuário</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para excluir usuário */}
      <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Excluir Usuário
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Tem certeza que deseja excluir este usuário?</p>
            <p className="text-sm text-gray-500 mt-2">Esta ação não pode ser desfeita.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => userToDelete && handleDeleteUser(userToDelete)}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagementPanel;
