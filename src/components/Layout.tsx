
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import PremiumSubscriptionButton from './PremiumSubscriptionButton';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, profile } = useSupabaseAuth();
  const [showPremiumButton, setShowPremiumButton] = useState(true);
  
  useEffect(() => {
    if (!user) {
      setShowPremiumButton(true);
      return;
    }

    // Verificar acesso premium via Supabase profile
    const isPremiumProfile = profile?.plano_id === 'premium_mensal' || profile?.plano_id === 'premium_anual' || profile?.plano_id === 'admin';
    
    // Verificar acesso premium via localStorage (definido pelo admin)
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const currentUser = allUsers.find((u: any) => u.email === user.email);
    const isPremiumLocalStorage = currentUser?.isPremium || currentUser?.isAdmin;
    
    // Usuário tem premium se tiver via profile OU via localStorage
    const hasAnyPremium = isPremiumProfile || isPremiumLocalStorage;
    
    setShowPremiumButton(!hasAnyPremium);
  }, [user, profile]);
  
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
