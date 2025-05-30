
import { Profile } from './types';

export const getIsPremium = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  const premiumPlans = [
    'premium_mensal', 
    'premium_anual', 
    'premium',
    'admin'
  ];
  
  return premiumPlans.includes(profile.plano_id);
};

export const getIsAdmin = (profile: Profile | null): boolean => {
  if (!profile) return false;
  
  const adminPlans = [
    'admin',
    'premium' // 'premium' sozinho também é considerado admin
  ];
  
  return adminPlans.includes(profile.plano_id);
};

// Nova função para verificar se tem acesso ilimitado (premium via qualquer fonte)
export const hasUnlimitedAccess = (
  profile: Profile | null, 
  userEmail?: string
): boolean => {
  // Verificar premium via profile
  const isPremiumProfile = getIsPremium(profile);
  
  // Verificar premium via localStorage (definido pelo admin)
  if (userEmail) {
    try {
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
      const currentUser = allUsers.find((u: any) => u.email === userEmail);
      const isPremiumLocalStorage = currentUser?.isPremium || currentUser?.isAdmin;
      
      return isPremiumProfile || isPremiumLocalStorage;
    } catch (error) {
      console.error('Erro ao verificar usuários no localStorage:', error);
      return isPremiumProfile;
    }
  }
  
  return isPremiumProfile;
};
