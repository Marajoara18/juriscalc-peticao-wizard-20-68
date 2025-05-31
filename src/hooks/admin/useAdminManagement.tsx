import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DatabaseProfile {
  id: string;
  email: string;
  nome_completo: string;
  plano_id: string;
  data_criacao: string;
  data_atualizacao: string;
  oab?: string;
  limite_calculos_salvos: number;
  limite_peticoes_salvas: number;
}

const PLANO_LIMITES = {
  gratuito: {
    calculos: 3,
    peticoes: 1
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

const ADMIN_EMAILS = ['johnnysantos_177@msn.com'];

export const useAdminManagement = () => {
  const [profiles, setProfiles] = useState<DatabaseProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[ADMIN_MANAGEMENT] Iniciando busca de perfis...');

      // Primeiro verificar a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[ADMIN_MANAGEMENT] Erro ao verificar sessão:', sessionError);
        toast.error('Erro ao verificar sessão');
        return;
      }

      if (!session) {
        console.log('[ADMIN_MANAGEMENT] Sem sessão ativa');
        return;
      }

      console.log('[ADMIN_MANAGEMENT] Sessão encontrada:', session.user.id);

      // Verificar se o usuário atual é admin
      const { data: currentProfile, error: profileError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('[ADMIN_MANAGEMENT] Erro ao verificar perfil:', profileError);
        toast.error('Erro ao verificar permissões');
        return;
      }

      console.log('[ADMIN_MANAGEMENT] Perfil atual:', currentProfile);

      // Verificar se o email está na lista de admins ou se o plano é admin
      const isAdmin = ADMIN_EMAILS.includes(currentProfile?.email) || currentProfile?.plano_id === 'admin';
      
      if (!isAdmin) {
        console.log('[ADMIN_MANAGEMENT] Usuário não é admin');
        toast.error('Acesso não autorizado');
        return;
      }

      // Se o usuário é admin por email mas não tem plano_id admin, vamos atualizar
      if (ADMIN_EMAILS.includes(currentProfile?.email) && currentProfile?.plano_id !== 'admin') {
        console.log('[ADMIN_MANAGEMENT] Atualizando plano para admin...');
        const { error: updateError } = await supabase
          .from('perfis')
          .update({ 
            plano_id: 'admin',
            limite_calculos_salvos: PLANO_LIMITES.admin.calculos,
            limite_peticoes_salvas: PLANO_LIMITES.admin.peticoes,
            data_atualizacao: new Date().toISOString()
          })
          .eq('id', session.user.id);

        if (updateError) {
          console.error('[ADMIN_MANAGEMENT] Erro ao atualizar plano:', updateError);
        }
      }

      console.log('[ADMIN_MANAGEMENT] Buscando todos os perfis...');
      
      // Agora buscar todos os perfis
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (perfilError) {
        console.error('[ADMIN_MANAGEMENT] Erro ao buscar perfis:', perfilError);
        toast.error('Erro ao carregar lista de usuários');
        return;
      }

      console.log('[ADMIN_MANAGEMENT] Perfis encontrados:', perfilData);

      if (perfilData && perfilData.length > 0) {
        setProfiles(perfilData);
      } else {
        console.log('[ADMIN_MANAGEMENT] Nenhum perfil encontrado');
        setProfiles([]);
      }
    } catch (error) {
      console.error('[ADMIN_MANAGEMENT] Erro inesperado ao buscar perfis:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();

    // Inscrever para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('[ADMIN_MANAGEMENT] Evento de auth:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchProfiles();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfiles]);

  const updateUserPlan = async (userId: string, newPlan: string) => {
    try {
      setLoading(true);
      console.log('[ADMIN_MANAGEMENT] Atualizando plano do usuário:', { userId, newPlan });

      // Obter os limites do novo plano
      const limites = PLANO_LIMITES[newPlan as keyof typeof PLANO_LIMITES];
      if (!limites) {
        toast.error('Plano inválido');
        return;
      }

      const { error } = await supabase
        .from('perfis')
        .update({ 
          plano_id: newPlan,
          limite_calculos_salvos: limites.calculos,
          limite_peticoes_salvas: limites.peticoes,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('[ADMIN_MANAGEMENT] Erro ao atualizar plano:', error);
        toast.error('Erro ao atualizar plano do usuário');
        return;
      }

      await fetchProfiles();
      toast.success('Plano atualizado com sucesso');
    } catch (error) {
      console.error('[ADMIN_MANAGEMENT] Erro inesperado ao atualizar plano:', error);
      toast.error('Erro ao atualizar plano');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      console.log('[ADMIN_MANAGEMENT] Tentando excluir usuário:', userId);
      
      const user = profiles.find(p => p.id === userId);
      if (user?.plano_id === 'admin') {
        toast.error('Não é possível excluir um administrador');
        return;
      }

      const { error } = await supabase
        .from('perfis')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('[ADMIN_MANAGEMENT] Erro ao deletar usuário:', error);
        toast.error('Erro ao excluir usuário');
        return;
      }

      await fetchProfiles();
      toast.success('Usuário excluído com sucesso');
    } catch (error) {
      console.error('[ADMIN_MANAGEMENT] Erro inesperado ao deletar usuário:', error);
      toast.error('Erro ao excluir usuário');
    } finally {
      setLoading(false);
    }
  };

  const createMasterAdmin = async (email: string) => {
    try {
      setLoading(true);
      console.log('[ADMIN_MANAGEMENT] Criando/atualizando admin:', email);

      const { data: existingUser, error: checkError } = await supabase
        .from('perfis')
        .select('*')
        .eq('email', email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('[ADMIN_MANAGEMENT] Erro ao verificar usuário existente:', checkError);
        toast.error('Erro ao verificar usuário existente');
        return;
      }

      if (existingUser) {
        console.log('[ADMIN_MANAGEMENT] Usuário existente, atualizando para admin:', existingUser);
        const { error: updateError } = await supabase
          .from('perfis')
          .update({ 
            plano_id: 'admin',
            limite_calculos_salvos: PLANO_LIMITES.admin.calculos,
            limite_peticoes_salvas: PLANO_LIMITES.admin.peticoes,
            data_atualizacao: new Date().toISOString()
          })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('[ADMIN_MANAGEMENT] Erro ao atualizar usuário para admin:', updateError);
          toast.error('Erro ao atualizar permissões');
          return;
        }
      } else {
        console.log('[ADMIN_MANAGEMENT] Criando novo usuário admin');
        const now = new Date().toISOString();
        const newAdmin: DatabaseProfile = {
          id: `admin-${Date.now()}`,
          email,
          nome_completo: 'Administrador',
          plano_id: 'admin',
          limite_calculos_salvos: PLANO_LIMITES.admin.calculos,
          limite_peticoes_salvas: PLANO_LIMITES.admin.peticoes,
          data_criacao: now,
          data_atualizacao: now
        };

        const { error: createError } = await supabase
          .from('perfis')
          .insert(newAdmin);

        if (createError) {
          console.error('[ADMIN_MANAGEMENT] Erro ao criar admin:', createError);
          toast.error('Erro ao criar administrador');
          return;
        }
      }

      await fetchProfiles();
      toast.success('Administrador configurado com sucesso');
    } catch (error) {
      console.error('[ADMIN_MANAGEMENT] Erro inesperado ao criar admin:', error);
      toast.error('Erro ao configurar administrador');
    } finally {
      setLoading(false);
    }
  };

  return {
    profiles,
    loading,
    fetchProfiles,
    updateUserPlan,
    deleteUser,
    createMasterAdmin
  };
};
