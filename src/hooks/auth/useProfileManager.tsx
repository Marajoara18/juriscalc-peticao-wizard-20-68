import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

// Adiciona um estado para controlar tentativas de criação
let createAttempted = false;

// Define os limites aqui também para consistência na criação
const PLANO_LIMITES = {
  gratuito: {
<<<<<<< HEAD
    calculos: 6, // Limite de cálculos salvos
    peticoes: 6
=======
    calculos: 6, // Corrigido para 6 cálculos salvos
    peticoes: 1
>>>>>>> e00c78adb715a0f761b3a6105e52911bf261efc1
  },
  premium: {
    calculos: 999999,
    peticoes: 999999
  },
  admin: {
    calculos: 999999,
    peticoes: 999999
  }
};

// Define uma interface para os dados necessários para criar o perfil
interface CreateProfileData {
  userId: string;
  nomeCompleto: string;
  email: string;
  telefone?: string; // Telefone é opcional na criação inicial
}

export const useProfileManager = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log('[PROFILE_MANAGER] Buscando perfil para:', userId);

    try {
      const { data: profileData, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[PROFILE_MANAGER] Erro ao buscar perfil:', error.message);

        const isPolicyError = error.code === 'PGRST116' || error.message.includes('policy') || error.message.includes('recursion');
        if (isPolicyError && createAttempted) {
          console.error('[PROFILE_MANAGER] Erro de política persistente após tentativa de criação. Interrompendo loop.');
          createAttempted = false;
          return null;
        }

        if (isPolicyError || !profileData) {
          console.log('[PROFILE_MANAGER] Perfil não encontrado ou erro de política. Tentando criar perfil (via fetch)...');
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
              createAttempted = true;
              const created = await createProfile({
                  userId: userId,
                  email: userData.user.email || '',
                  nomeCompleto: userData.user.user_metadata?.nome_completo || userData.user.email?.split('@')[0] || 'Usuário',
                  telefone: userData.user.user_metadata?.telefone
              });
              createAttempted = false;
              return created;
          } else {
              console.error('[PROFILE_MANAGER] Não foi possível obter dados do usuário para criar perfil via fetch.');
              return null;
          }
        }

        return null;
      }

      if (profileData) {
        console.log('[PROFILE_MANAGER] Perfil encontrado:', profileData.nome_completo);
        createAttempted = false;
        return profileData;
      } else {
        console.log('[PROFILE_MANAGER] Perfil não existe (caso raro após maybeSingle sem erro).');
        return null;
      }
    } catch (error) {
      console.error('[PROFILE_MANAGER] Erro inesperado ao buscar:', error);
      createAttempted = false;
      return null;
    }
  }, []);

  // Modificado para aceitar um objeto com os dados necessários
  const createProfile = async (profileData: CreateProfileData): Promise<Profile | null> => {
    const { userId, nomeCompleto, email, telefone } = profileData;
    console.log('[PROFILE_MANAGER] Criando perfil para:', userId, 'com dados:', { nomeCompleto, email, telefone });

    try {
      const limitesGratuito = PLANO_LIMITES.gratuito;

      const { data, error } = await supabase
        .from('perfis')
        .insert({
          id: userId,
          nome_completo: nomeCompleto,
          email: email,
          telefone: telefone, // Incluído campo telefone
          plano_id: 'gratuito',
          limite_calculos_salvos: limitesGratuito.calculos,
          limite_peticoes_salvas: limitesGratuito.peticoes
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('[PROFILE_MANAGER] Erro ao criar perfil:', error.message);

        const isPolicyError = error.code === 'PGRST116' || error.message.includes('policy') || error.message.includes('recursion');
        if (isPolicyError) {
            console.error('[PROFILE_MANAGER] Erro de política ao tentar criar perfil.');
            return null;
        }

        if (error.code === '23505') { // Chave única (perfil já existe)
          console.log('[PROFILE_MANAGER] Perfil já existe (erro 23505), buscando...');
          const { data: existingProfile } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          return existingProfile || null;
        }

        return null;
      }

      console.log('[PROFILE_MANAGER] Perfil criado:', data);
      return data;
    } catch (error) {
      console.error('[PROFILE_MANAGER] Erro inesperado ao criar perfil:', error);
      return null;
    }
  };

  return {
    profile,
    setProfile,
    fetchProfile,
    createProfile
  };
};
