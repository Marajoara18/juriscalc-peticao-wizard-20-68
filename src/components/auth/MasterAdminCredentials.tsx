
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { UserData } from '@/types/user';

interface MasterAdminCredentialsProps {
  userData: UserData;
  allUsers: UserData[];
  updateUsers: (updatedUsers: UserData[]) => void;
}

const MasterAdminCredentials = ({ userData, allUsers, updateUsers }: MasterAdminCredentialsProps) => {
  const [showMessage, setShowMessage] = useState(false);

  const handleShowMessage = () => {
    // Verificar se é o admin mestre
    if (userData.email !== 'admin@juriscalc.com' && userData.email !== 'johnnysantos_177@msn.com') {
      toast.error('Apenas o administrador mestre pode ver esta informação');
      return;
    }

    setShowMessage(true);
    toast.info('As credenciais de administrador são gerenciadas pelo Supabase Auth. Para alterar a senha, use a função de recuperação de senha.');
  };

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Credenciais do Administrador Mestre
        </CardTitle>
        <Button 
          onClick={handleShowMessage} 
          variant="outline"
        >
          Ver Informações
        </Button>
      </CardHeader>
      
      {showMessage && (
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Informações Importantes</h4>
              <p className="text-blue-800 text-sm mb-2">
                As credenciais de administrador são gerenciadas pelo sistema de autenticação Supabase.
              </p>
              <p className="text-blue-800 text-sm mb-2">
                <strong>E-mail atual:</strong> {userData.email}
              </p>
              <p className="text-blue-800 text-sm">
                Para alterar a senha, utilize a função "Esqueci minha senha" na tela de login.
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default MasterAdminCredentials;
