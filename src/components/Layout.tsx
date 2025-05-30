
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
  const { user, profile } = useSupabaseAuth();
  const [showPremiumButton, setShowPremiumButton] = useState(true);
  
  useEffect(() => {
    if (!user) {
      setShowPremiumButton(true);
      return;
    }

    // Usar a função centralizada para verificar acesso ilimitado
    const unlimitedAccess = hasUnlimitedAccess(profile, user.email);
    
    setShowPremiumButton(!unlimitedAccess);
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
