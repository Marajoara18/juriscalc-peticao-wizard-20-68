
import { Profile } from './types';

export const getIsPremium = (profile: Profile | null): boolean => {
  if (!profile) return false;
  return profile.plano_id === 'premium' || profile.plano_id === 'admin';
};

export const getIsAdmin = (profile: Profile | null): boolean => {
  if (!profile) return false;
  return profile.plano_id === 'admin';
};

export const getIsMasterAdmin = (email: string | undefined): boolean => {
  if (!email) return false;
  const masterAdminEmails = ['admin@juriscalc.com', 'johnnysantos_177@msn.com'];
  return masterAdminEmails.includes(email);
};

export const hasUnlimitedAccess = (profile: Profile | null, email?: string): boolean => {
  // Verifica se é master admin primeiro
  if (getIsMasterAdmin(email)) return true;
  
  // Verifica se tem plano premium ou admin
  return getIsPremium(profile);
};
