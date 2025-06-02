export interface Profile {
  id: string;
  nome_completo: string;
  email: string;
  plano_id: string;
  oab?: string;
  telefone?: string;
  logo_url?: string;
  data_criacao: string;
  data_atualizacao: string;
  limite_calculos_salvos?: number;
  limite_peticoes_salvas?: number;
}

export interface User {
  id: string;
  email: string;
  telefone?: string;
  user_metadata?: {
    nome_completo?: string;
    telefone?: string;
  };
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isPremium: boolean;
  isAdmin: boolean;
}
