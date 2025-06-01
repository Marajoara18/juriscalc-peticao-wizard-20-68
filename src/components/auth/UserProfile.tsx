
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Crown, Shield } from "lucide-react";
import UserAvatar from './profile/UserAvatar';
import UserInfo from './profile/UserInfo';
import LogoUploadDialog from './profile/LogoUploadDialog';
import ChangePasswordSection from './profile/ChangePasswordSection';
import UploadLogoForm from './UploadLogoForm';
import { UserData } from '@/types/user';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

interface UserProfileProps {
  userData: UserData;
  isMasterAdmin: boolean;
  onLogout: () => void;
  updateUserData: (updatedUser: UserData) => void;
}

const UserProfile = ({ userData, isMasterAdmin, onLogout, updateUserData }: UserProfileProps) => {
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const { user, profile } = useSupabaseAuth();
  
  const handleLogoUpload = () => {
    setLogoDialogOpen(true);
  };

  // Verificar se o usuário tem acesso premium
  const isPremiumProfile = profile?.plano_id === 'premium_mensal' || profile?.plano_id === 'premium_anual' || profile?.plano_id === 'admin';
  const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
  const currentUser = allUsers.find((u: any) => u.email === user?.email);
  const isPremiumLocalStorage = currentUser?.isPremium || currentUser?.isAdmin;
  const hasAnyPremium = isPremiumProfile || isPremiumLocalStorage;
  const premiumSource = isPremiumProfile ? 'profile' : 'admin';

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Perfil de Usuário</span>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="border-juriscalc-navy text-juriscalc-navy"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <UserAvatar logoUrl={userData.logoUrl} />
            <UserInfo 
              userData={userData}
              isMasterAdmin={isMasterAdmin}
              onLogoUpload={handleLogoUpload}
            />
          </div>
          
          {/* Status Premium */}
          {hasAnyPremium && (
            <div className="mt-6 p-4 bg-gradient-to-r from-juriscalc-gold/10 to-yellow-50 border border-juriscalc-gold rounded-lg">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-juriscalc-gold" />
                <div>
                  <h3 className="font-semibold text-juriscalc-navy">Acesso Premium Ativo</h3>
                  <p className="text-sm text-gray-600">
                    {premiumSource === 'admin' ? (
                      <>
                        <Shield className="inline h-4 w-4 mr-1" />
                        Acesso premium concedido pelo administrador mestre. Você possui cálculos ilimitados.
                      </>
                    ) : (
                      'Você possui cálculos ilimitados disponíveis.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informações do Plano */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-juriscalc-navy mb-2">Informações do Plano</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tipo de Conta:</span>
                <span className="ml-2">
                  {userData.isAdmin 
                    ? isMasterAdmin 
                      ? 'Administrador Mestre' 
                      : 'Administrador' 
                    : userData.isPremium 
                      ? 'Premium' 
                      : 'Gratuito'}
                </span>
              </div>
              <div>
                <span className="font-medium">Limite de Cálculos:</span>
                <span className="ml-2">
                  {userData.limiteCalculosSalvos === 999999 ? 'Ilimitado' : userData.limiteCalculosSalvos}
                </span>
              </div>
              <div>
                <span className="font-medium">Limite de Petições:</span>
                <span className="ml-2">
                  {userData.limitePeticoesSalvas === 999999 ? 'Ilimitado' : userData.limitePeticoesSalvas}
                </span>
              </div>
              {userData.oab && (
                <div>
                  <span className="font-medium">OAB:</span>
                  <span className="ml-2">{userData.oab}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload de Logo/Foto */}
      <UploadLogoForm />

      {/* Alteração de Senha */}
      <ChangePasswordSection />

      <LogoUploadDialog
        open={logoDialogOpen}
        onOpenChange={setLogoDialogOpen}
        userData={userData}
        updateUserData={updateUserData}
      />
    </>
  );
};

export default UserProfile;
