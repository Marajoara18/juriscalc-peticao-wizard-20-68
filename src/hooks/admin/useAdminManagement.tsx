
<<<<<<< HEAD
import { useState, useEffect } from 'react';
=======
import { useState, useEffect, useCallback } from 'react';
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

<<<<<<< HEAD
interface Profile {
  id: string;
  nome_completo: string;
  email: string;
  plano_id: string;
  oab?: string;
  data_criacao: string;
  data_atualizacao: string;
}
=======
type Profile = Database['public']['Tables']['perfis']['Row'];
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4

export const useAdminManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
=======
  const [loading, setLoading] = useState(true);
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4

  const fetchAllProfiles = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const { data, error } = await supabase
=======
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
      const isAdmin = ADMIN_EMAILS.includes(currentProfile?.email || '') || currentProfile?.plano_id === 'admin';
      
      if (!isAdmin) {
        console.log('[ADMIN_MANAGEMENT] Usuário não é admin');
        toast.error('Acesso não autorizado');
        return;
      }

      // Se o usuário é admin por email mas não tem plano_id admin, vamos atualizar
      if (ADMIN_EMAILS.includes(currentProfile?.email || '') && currentProfile?.plano_id !== 'admin') {
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
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4
        .from('perfis')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      
      setProfiles(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar usuários: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProfiles();
  }, []);

  const updateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ plano_id: newPlan })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === userId 
            ? { ...profile, plano_id: newPlan }
            : profile
        )
      );

      toast.success('Plano do usuário atualizado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao atualizar plano: ' + error.message);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete the auth user (this will cascade to delete the profile via RLS)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) throw authError;

      // Update local state
      setProfiles(prev => prev.filter(profile => profile.id !== userId));
      
      toast.success('Usuário excluído com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao excluir usuário: ' + error.message);
    }
  };

  const createMasterAdmin = async (email: string) => {
    try {
      // First check if user already exists
      const { data: existingProfile } = await supabase
        .from('perfis')
        .select('*')
        .eq('email', email)
        .maybeSingle();

<<<<<<< HEAD
      if (existingProfile) {
        // Update existing user to admin
        const { error } = await supabase
=======
      if (checkError) {
        console.error('[ADMIN_MANAGEMENT] Erro ao verificar usuário existente:', checkError);
        toast.error('Erro ao verificar usuário existente');
        return;
      }

      if (existingUser) {
        console.log('[ADMIN_MANAGEMENT] Usuário existente, atualizando para admin:', existingUser);
        const { error: updateError } = await supabase
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4
          .from('perfis')
          .update({ 
            plano_id: 'premium_anual'
          })
          .eq('email', email);

        if (error) throw error;
        
        toast.success('Usuário promovido a premium!');
        fetchAllProfiles();
      } else {
<<<<<<< HEAD
        toast.error('Usuário não encontrado. O usuário deve se cadastrar primeiro.');
=======
        toast.error('Usuário não encontrado. O usuário deve se registrar primeiro.');
        return;
>>>>>>> 6ca043c0b4381c38d76feee2e98709e02eabccb4
      }
    } catch (error: any) {
      toast.error('Erro ao criar administrador: ' + error.message);
    }
  };

  return {
    profiles,
    loading,
    fetchAllProfiles,
    updateUserPlan,
    deleteUser,
    createMasterAdmin
  };
};
