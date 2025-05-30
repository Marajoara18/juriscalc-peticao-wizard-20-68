
export interface User {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  isAdmin: boolean;
  logoUrl?: string;
  canViewPanels?: boolean;
  isPremium?: boolean;
  oab?: string;
  planoId?: string;
  limiteCalculosSalvos?: number;
  limitePeticoesSalvas?: number;
}

export interface UserData {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  isAdmin: boolean;
  logoUrl?: string;
  canViewPanels?: boolean;
  isPremium?: boolean;
  oab?: string;
  planoId?: string;
  limiteCalculosSalvos?: number;
  limitePeticoesSalvas?: number;
}
