import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ChangePasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('As novas senhas não conferem.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        console.error('Erro ao atualizar senha:', error.message);
        toast.error(`Erro ao atualizar senha: ${error.message}`);
      } else {
        toast.success('Senha atualizada com sucesso!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      console.error('Erro inesperado ao atualizar senha:', error);
      toast.error(`Ocorreu um erro inesperado: ${error.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
        <CardDescription>Defina uma nova senha de acesso para sua conta.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-password" className="block text-sm font-medium">
              Nova Senha
            </label>
            <Input
              id="new-password"
              type="password"
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium">
              Confirmar Nova Senha
            </label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full bg-juriscalc-navy text-white hover:bg-opacity-90" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? 'Atualizando...' : 'Atualizar Senha'}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
};

export default ChangePasswordForm;

