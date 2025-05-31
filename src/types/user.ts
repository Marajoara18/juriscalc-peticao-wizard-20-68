
export interface UserData {
  id: string;
  nome: string; // Mapeado de nome_completo
  email: string;
  isAdmin: boolean;
  isPremium: boolean;
  canViewPanels: boolean;
  logoUrl?: string;
  oab?: string;
  planoId: string; // Mapeado de plano_id
  limiteCalculosSalvos?: number;
  limitePeticoesSalvas?: number;
}

export interface UserProfile {
  id: string;
  nome_completo: string;
  email: string;
  plano_id: string;
  oab?: string;
  data_criacao: string;
  data_atualizacao: string;
  limite_calculos_salvos?: number;
  limite_peticoes_salvas?: number;
}
