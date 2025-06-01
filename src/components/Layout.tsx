
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import PremiumSubscriptionButton from './PremiumSubscriptionButton';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { hasUnlimitedAccess } from '@/hooks/auth/authUtils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, profile, loading } = useSupabaseAuth();
  const [showPremiumButton, setShowPremiumButton] = useState(true);
  
  useEffect(() => {
    // Se ainda está carregando, não alterar o estado do botão
    if (loading) {
      return;
    }

    // Se não há usuário, mostrar botão premium
    if (!user) {
      setShowPremiumButton(true);
      return;
    }

    // Verificar acesso ilimitado - mesmo sem perfil carregado
    const unlimitedAccess = hasUnlimitedAccess(profile, user.email);
    
    console.log('[LAYOUT] Verificando acesso premium:', {
      hasUser: !!user,
      hasProfile: !!profile,
      userEmail: user.email,
      unlimitedAccess
    });
    
    setShowPremiumButton(!unlimitedAccess);
  }, [user, profile, loading]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      
      {/* Only show the premium button for non-premium users */}
      {showPremiumButton && <PremiumSubscriptionButton />}
    </div>
  );
};

export default Layout;
