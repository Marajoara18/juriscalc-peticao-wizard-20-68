
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  nome_completo: string;
  email: string;
  plano_id: string;
  oab?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export const useAdminManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
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
        .single();

      if (existingProfile) {
        // Update existing user to admin
        const { error } = await supabase
          .from('perfis')
          .update({ 
            plano_id: 'premium_anual'
          })
          .eq('email', email);

        if (error) throw error;
        
        toast.success('Usuário promovido a premium!');
        fetchAllProfiles();
      } else {
        toast.error('Usuário não encontrado. O usuário deve se cadastrar primeiro.');
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
