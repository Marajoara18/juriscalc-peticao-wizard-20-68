
export interface User {
  id: string;
  nome: string;
  email: string;
  senha: string;
  isAdmin: boolean;
  logoUrl?: string;
  canViewPanels?: boolean;
  isPremium?: boolean;
}

export interface LoginFormData {
  email: string;
  senha: string;
}

export interface RegisterFormData {
  nome: string;
  email: string;
  telefone: string; // Adicionado campo telefone
  senha: string;
  confirmSenha: string;
}

