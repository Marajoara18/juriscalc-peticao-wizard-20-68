
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export const useProfileManager = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log('[PROFILE_MANAGER] Buscando perfil para usuário:', userId);
    try {
      // Usar a nova função segura para buscar perfil
      const { data, error } = await supabase.rpc('get_current_user_profile');

      if (error) {
        console.error('[PROFILE_MANAGER] Erro ao buscar perfil via função:', error);
        
        // Fallback: tentar busca direta se a função falhar
        console.log('[PROFILE_MANAGER] Tentando busca direta como fallback');
        const { data: profileData, error: directError } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', userId)
          .single();

        if (directError) {
          console.error('[PROFILE_MANAGER] Erro na busca direta do perfil:', directError);
          
          // Se o perfil não existe, tentar criar um
          if (directError.code === 'PGRST116') {
            console.log('[PROFILE_MANAGER] Perfil não existe, tentando criar...');
            return await createProfile(userId);
          }
          
          return null;
        }

        console.log('[PROFILE_MANAGER] Perfil encontrado via busca direta:', profileData);
        return profileData;
      }

      if (data && data.length > 0) {
        console.log('[PROFILE_MANAGER] Perfil encontrado via função:', data[0]);
        return data[0];
      }

      console.log('[PROFILE_MANAGER] Nenhum perfil retornado, tentando criar...');
      return await createProfile(userId);
    } catch (error) {
      console.error('[PROFILE_MANAGER] Erro inesperado ao buscar perfil:', error);
      return await createProfile(userId);
    }
  }, []);

  const createProfile = async (userId: string): Promise<Profile | null> => {
    console.log('[PROFILE_MANAGER] Tentando criar perfil para usuário:', userId);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email || '';
      const nomeCompleto = userData.user?.user_metadata?.nome_completo || 
                          userData.user?.user_metadata?.full_name || 
                          email;

      console.log('[PROFILE_MANAGER] Dados para criação do perfil:', { userId, nomeCompleto, email });

      const { data, error } = await supabase
        .from('perfis')
        .insert({
          id: userId,
          nome_completo: nomeCompleto,
          email: email,
          plano_id: 'gratuito'
        })
        .select()
        .single();

      if (error) {
        console.error('[PROFILE_MANAGER] Erro ao criar perfil:', error);
        return null;
      }

      console.log('[PROFILE_MANAGER] Perfil criado com sucesso:', data);
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
