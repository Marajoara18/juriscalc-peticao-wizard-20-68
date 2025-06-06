import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const useProfileManager = () => {
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log('[PROFILE_MANAGER] Buscando perfil para:', userId);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      console.log(`[PROFILE_MANAGER] Perfil ${data ? 'encontrado' : 'não encontrado'}.`);
      return data;
    } catch (err: any) {
      console.error('[PROFILE_MANAGER] Erro ao buscar perfil:', err.message);
      setError('Falha ao buscar o perfil.');
      return null;
    }
  }, []);

  const createProfile = useCallback(async (profileData: Omit<Profile, 'plano_id' | 'limite_calculos_salvos' | 'limite_peticoes_salvas' | 'data_assinatura' | 'periodo_assinatura' | 'status_assinatura' | 'stripe_customer_id' | 'subscription_id'> & { id: string }): Promise<Profile | null> => {
    console.log('[PROFILE_MANAGER] Criando perfil para:', profileData.id);
    setError(null);

    const PLANO_GRATUITO = {
      calculos: 6,
      peticoes: 6
    };

    try {
      const { data, error } = await supabase
        .from('perfis')
        .insert({
          id: profileData.id,
          nome_completo: profileData.nome_completo,
          email: profileData.email,
          telefone: profileData.telefone,
          plano_id: 'gratuito',
          limite_calculos_salvos: PLANO_GRATUITO.calculos,
          limite_peticoes_salvas: PLANO_GRATUITO.peticoes,
        })
        .select()
        .single();

      if (error) {
        // Ignora erro de perfil já existente e tenta buscar novamente
        if (error.code === '23505') {
          console.warn('[PROFILE_MANAGER] Perfil já existe (código 23505), retornando fetch.');
          return fetchProfile(profileData.id);
        }
        throw error;
      }

      console.log('[PROFILE_MANAGER] Perfil criado:', data.nome_completo);
      return data;
    } catch (err: any) {
      console.error('[PROFILE_MANAGER] Erro ao criar perfil:', err.message);
      setError('Falha ao criar o perfil.');
      return null;
    }
  }, [fetchProfile]);

  return { createProfile, fetchProfile, error };
};
