
export interface Profile {
  id: string;
  nome_completo: string;
  email: string;
  plano_id: string;
  oab?: string;
  telefone?: string; // Campo telefone adicionado
  logo_url?: string;
  data_criacao: string;
  data_atualizacao: string;
  limite_calculos_salvos?: number;
  limite_peticoes_salvas?: number;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isPremium: boolean;
  isAdmin: boolean;
}
