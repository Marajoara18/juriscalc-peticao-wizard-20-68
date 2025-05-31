
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const useProfileManager = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log('[PROFILE_MANAGER] Buscando perfil para:', userId);
    
    try {
      // Busca simples sem políticas complexas
      const { data: profileData, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle em vez de single para evitar erro se não encontrar

      if (error) {
        console.error('[PROFILE_MANAGER] Erro ao buscar perfil:', error.message);
        
        // Se o erro for de política ou permissão, tentar criar perfil
        if (error.code === 'PGRST116' || error.message.includes('policy') || error.message.includes('recursion')) {
          console.log('[PROFILE_MANAGER] Tentando criar perfil...');
          return await createProfile(userId);
        }
        
        return null;
      }

      if (profileData) {
        console.log('[PROFILE_MANAGER] Perfil encontrado:', profileData.nome_completo);
        return profileData;
      } else {
        console.log('[PROFILE_MANAGER] Perfil não existe, criando...');
        return await createProfile(userId);
      }
    } catch (error) {
      console.error('[PROFILE_MANAGER] Erro inesperado:', error);
      // Tentar criar perfil como fallback
      return await createProfile(userId);
    }
  }, []);

  const createProfile = async (userId: string): Promise<Profile | null> => {
    console.log('[PROFILE_MANAGER] Criando perfil para:', userId);
    
    try {
      // Buscar dados do usuário
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email || '';
      const nomeCompleto = userData.user?.user_metadata?.nome_completo || 
                          userData.user?.user_metadata?.full_name || 
                          email.split('@')[0];

      console.log('[PROFILE_MANAGER] Dados para criação:', { userId, nomeCompleto, email });

      const { data, error } = await supabase
        .from('perfis')
        .insert({
          id: userId,
          nome_completo: nomeCompleto,
          email: email,
          plano_id: 'gratuito'
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('[PROFILE_MANAGER] Erro ao criar perfil:', error.message);
        
        // Se o perfil já existe, tentar buscar novamente
        if (error.code === '23505') { // Violação de chave única
          console.log('[PROFILE_MANAGER] Perfil já existe, buscando...');
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
