export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calculos_salvos: {
        Row: {
          dados_entrada_json: Json
          data_atualizacao: string
          data_criacao: string
          id: string
          resultado_calculo_json: Json
          tipo_calculo: string | null
          titulo_calculo: string
          usuario_id: string
        }
        Insert: {
          dados_entrada_json: Json
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          resultado_calculo_json: Json
          tipo_calculo?: string | null
          titulo_calculo: string
          usuario_id: string
        }
        Update: {
          dados_entrada_json?: Json
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          resultado_calculo_json?: Json
          tipo_calculo?: string | null
          titulo_calculo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      modelos_peticoes: {
        Row: {
          ativo: boolean | null
          categoria: string
          conteudo_template: string
          data_criacao: string
          id: string
          nome: string
          variaveis_disponiveis: Json | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          conteudo_template: string
          data_criacao?: string
          id?: string
          nome: string
          variaveis_disponiveis?: Json | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          conteudo_template?: string
          data_criacao?: string
          id?: string
          nome?: string
          variaveis_disponiveis?: Json | null
        }
        Relationships: []
      }
      perfis: {
        Row: {
          data_atualizacao: string
          data_criacao: string
          email: string
          id: string
          limite_calculos_salvos: number | null
          limite_peticoes_salvas: number | null
          logo_url: string | null
          nome_completo: string
          oab: string | null
          plano_id: string | null
          telefone: string | null
        }
        Insert: {
          data_atualizacao?: string
          data_criacao?: string
          email: string
          id: string
          limite_calculos_salvos?: number | null
          limite_peticoes_salvas?: number | null
          logo_url?: string | null
          nome_completo: string
          oab?: string | null
          plano_id?: string | null
          telefone?: string | null
        }
        Update: {
          data_atualizacao?: string
          data_criacao?: string
          email?: string
          id?: string
          limite_calculos_salvos?: number | null
          limite_peticoes_salvas?: number | null
          logo_url?: string | null
          nome_completo?: string
          oab?: string | null
          plano_id?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      peticoes_salvas: {
        Row: {
          calculos_associados: Json | null
          conteudo: string
          data_atualizacao: string
          data_criacao: string
          id: string
          modelo_usado: string | null
          titulo: string
          usuario_id: string
        }
        Insert: {
          calculos_associados?: Json | null
          conteudo: string
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          modelo_usado?: string | null
          titulo: string
          usuario_id: string
        }
        Update: {
          calculos_associados?: Json | null
          conteudo?: string
          data_atualizacao?: string
          data_criacao?: string
          id?: string
          modelo_usado?: string | null
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
