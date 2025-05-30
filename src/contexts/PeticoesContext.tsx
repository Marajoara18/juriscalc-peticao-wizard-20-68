
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

interface PeticoesContextType {
  peticoesRecentes: any[];
  selectedModeloId: number | null;
  selectedPeticaoId: number | null;
  view: 'list' | 'editor' | 'new' | 'user';
  isPremium: boolean;
  isAdmin: boolean;
  isViewingAsUser: boolean;
  viewingBanner: string | null;
  setView: (view: 'list' | 'editor' | 'new' | 'user') => void;
  handleNovaPeticao: () => void;
  handleUseModelo: (id: number) => void;
  handleEditPeticao: (id: number) => void;
  handleVoltar: () => void;
  handleSavePeticao: (data: any) => void;
  handleUserClick: () => void;
  handleDeletePeticao: (id: number) => void;
  handleStopViewingAs: () => void;
}

const PeticoesContext = createContext<PeticoesContextType | undefined>(undefined);

export const usePeticoes = () => {
  const context = useContext(PeticoesContext);
  if (context === undefined) {
    throw new Error('usePeticoes must be used within a PeticoesProvider');
  }
  return context;
};

export const PeticoesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user, profile, loading } = useSupabaseAuth();
  const [selectedModeloId, setSelectedModeloId] = useState<number | null>(null);
  const [selectedPeticaoId, setSelectedPeticaoId] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'editor' | 'new' | 'user'>('list');
  const [peticoesRecentes, setPeticoesRecentes] = useState<any[]>([]);
  
  // Derivar estados de premium e admin do perfil Supabase
  const isPremium = profile?.plano_id?.includes('premium') || profile?.plano_id === 'admin' || false;
  const isAdmin = profile?.plano_id === 'admin' || false;
  
  // Estados para funcionalidade de visualização como usuário (não implementada)
  const isViewingAsUser = false;
  const viewingBanner = null;
  
  // Carrega dados do localStorage apenas como fallback temporário
  useEffect(() => {
    if (loading) return; // Esperar carregar autenticação
    
    if (!user) {
      console.log('PETICOES: Usuário não autenticado, redirecionando para login');
      navigate('/');
      return;
    }
    
    console.log('PETICOES: Usuário autenticado, carregando petições', {
      userId: user.id,
      isPremium,
      isAdmin
    });
    
    // Carregar petições do localStorage (temporário até migrar para Supabase)
    const storedPeticoes = localStorage.getItem('peticoesRecentes');
    if (storedPeticoes) {
      try {
        const allPeticoes = JSON.parse(storedPeticoes);
        
        // Se for admin, mostrar todas as petições; senão, filtrar por usuário
        const filteredPeticoes = isAdmin 
          ? allPeticoes 
          : allPeticoes.filter((p: any) => !p.userId || p.userId === user.id);
        
        setPeticoesRecentes(filteredPeticoes);
      } catch (error) {
        console.error('PETICOES: Erro ao carregar petições:', error);
      }
    }
  }, [user, profile, loading, navigate, isAdmin]);

  const handleNovaPeticao = () => {
    if (!isPremium) {
      const count = parseInt(localStorage.getItem('peticoesCount') || '0');
      if (count >= 3) {
        toast.error('Você atingiu o limite de 3 petições gratuitas. Assine o plano premium para continuar.');
        return;
      }
    }
    
    setView('new');
    setSelectedModeloId(null);
    setSelectedPeticaoId(null);
  };
  
  const handleUseModelo = (id: number) => {
    if (!isPremium) {
      const count = parseInt(localStorage.getItem('peticoesCount') || '0');
      if (count >= 3) {
        toast.error('Você atingiu o limite de 3 petições gratuitas. Assine o plano premium para continuar.');
        return;
      }
    }
    
    setSelectedModeloId(id);
    setView('editor');
    toast.info('Modelo selecionado! Preencha os dados necessários.');
  };
  
  const handleEditPeticao = (id: number) => {
    setSelectedPeticaoId(id);
    setView('editor');
  };
  
  const handleVoltar = () => {
    setView('list');
    setSelectedModeloId(null);
    setSelectedPeticaoId(null);
  };

  const handleSavePeticao = (data: any) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Adicionar ID do usuário Supabase à petição
    const updatedData = {
      ...data,
      userId: user.id
    };
  
    // Carregar todas as petições armazenadas
    const allPeticoes = JSON.parse(localStorage.getItem('peticoesRecentes') || '[]');
    let updatedPeticoes = [...allPeticoes];
    
    const existingIndex = updatedPeticoes.findIndex(p => p.id === data.id);
    
    if (existingIndex >= 0) {
      updatedPeticoes[existingIndex] = updatedData;
    } else {
      updatedPeticoes.unshift(updatedData);
      
      if (!isPremium) {
        const count = parseInt(localStorage.getItem('peticoesCount') || '0');
        localStorage.setItem('peticoesCount', String(count + 1));
      }
    }
    
    localStorage.setItem('peticoesRecentes', JSON.stringify(updatedPeticoes));
    
    const filteredPeticoes = isAdmin
      ? updatedPeticoes
      : updatedPeticoes.filter(p => !p.userId || p.userId === user.id);
    
    setPeticoesRecentes(filteredPeticoes);
    
    toast.success(`Petição ${data.status === 'finalizada' ? 'finalizada' : 'salva como rascunho'} com sucesso!`);
    handleVoltar();
  };

  const handleUserClick = () => {
    setView('user');
  };

  const handleDeletePeticao = (id: number) => {
    const storedPeticoes = localStorage.getItem('peticoesRecentes');
    if (storedPeticoes) {
      try {
        const allPeticoes = JSON.parse(storedPeticoes);
        const updatedPeticoes = allPeticoes.filter((p: any) => p.id !== id);
        
        localStorage.setItem('peticoesRecentes', JSON.stringify(updatedPeticoes));
        
        const filteredPeticoes = isAdmin
          ? updatedPeticoes
          : updatedPeticoes.filter(p => !p.userId || p.userId === user.id);
        
        setPeticoesRecentes(filteredPeticoes);
        toast.success('Petição excluída com sucesso!');
      } catch (error) {
        console.error('PETICOES: Erro ao excluir petição:', error);
        toast.error('Erro ao excluir petição. Tente novamente.');
      }
    }
  };

  const handleStopViewingAs = () => {
    // Funcionalidade não implementada
    toast.info('Funcionalidade não disponível');
  };

  const value = {
    peticoesRecentes,
    selectedModeloId,
    selectedPeticaoId,
    view,
    isPremium,
    isAdmin,
    isViewingAsUser,
    viewingBanner,
    setView,
    handleNovaPeticao,
    handleUseModelo,
    handleEditPeticao,
    handleVoltar,
    handleSavePeticao,
    handleUserClick,
    handleDeletePeticao,
    handleStopViewingAs,
  };

  return (
    <PeticoesContext.Provider value={value}>
      {children}
    </PeticoesContext.Provider>
  );
};

export default PeticoesContext;
