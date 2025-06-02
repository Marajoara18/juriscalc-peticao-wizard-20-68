import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Phone } from "lucide-react";
import { UserData } from '@/types/user';

interface UserInfoProps {
  userData: UserData;
  isMasterAdmin: boolean;
  onLogoUpload: () => void;
}

const UserInfo = ({ userData, isMasterAdmin, onLogoUpload }: UserInfoProps) => {
  return (
    <div className="flex-grow">
      <h3 className="text-xl font-bold mb-1">{userData.nome}</h3>
      <p className="text-gray-600 mb-2">{userData.email}</p>
      {userData.telefone && (
        <p className="text-gray-600 mb-2 flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          {userData.telefone}
        </p>
      )}
      <p className="text-sm mb-4">
        {userData.isAdmin 
          ? isMasterAdmin 
            ? 'Administrador Mestre do Sistema' 
            : 'Administrador do Sistema' 
          : 'Usuário Padrão'}
      </p>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onLogoUpload}
      >
        <Upload className="h-4 w-4 mr-2" />
        {userData.logoUrl ? 'Atualizar Logotipo' : 'Adicionar Logotipo'}
      </Button>
    </div>
  );
};

export default UserInfo;
