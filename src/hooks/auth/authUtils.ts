
import { Profile } from './types';

export const getIsPremium = (profile: Profile | null): boolean => {
  return profile?.plano_id === 'premium_mensal' || 
         profile?.plano_id === 'premium_anual' || 
         profile?.plano_id === 'premium' || 
         profile?.plano_id === 'admin' || 
         false;
};

export const getIsAdmin = (profile: Profile | null): boolean => {
  return profile?.plano_id === 'admin' || 
         profile?.plano_id === 'premium' || 
         false;
};
