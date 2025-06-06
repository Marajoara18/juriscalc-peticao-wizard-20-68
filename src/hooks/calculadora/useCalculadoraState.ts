
import { useState, useEffect } from 'react';
import { DadosContrato } from '@/types/calculadora';
import { useAutoSave } from '@/hooks/useAutoSave';
import { toast } from 'sonner';

const dadosIniciais: DadosContrato = {
  nomeEmpregado: '',
  nomeEmpregador: '',
  dataAdmissao: '',
  dataDemissao: '',
  salario: 0,
  motivoDemissao: 'sem-justa-causa',
  tempoAvisoPrevio: 30,
  insalubridade: 0,
  periculosidade: 0,
  adicionalNoturno: 0,
  horasExtras50: 0,
  horasExtras100: 0,
  dsrHorasExtras: false,
  salarioFamilia: 0,
  auxilioCreche: 0,
  outrosBeneficios: 0,
  pensaoAlimenticia: 0,
  emprestimos: 0,
  outrosDescontos: 0
};

export const useCalculadoraState = () => {
  const [dadosContrato, setDadosContrato] = useState<DadosContrato>(dadosIniciais);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  const { getAutoSavedData, clearAutoSavedData, saveNow } = useAutoSave({
    data: dadosContrato,
    key: 'calculadora_dados',
    delay: 15000, // Salvar a cada 15 segundos
    enabled: true
  });

  // Verificar se há dados salvos ao carregar
  useEffect(() => {
    const autoSaved = getAutoSavedData();
    if (autoSaved && autoSaved.data) {
      const timeDiff = Date.now() - new Date(autoSaved.timestamp).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Se os dados foram salvos há menos de 24 horas, oferecer para restaurar
      if (hoursDiff < 24) {
        toast.info(
          `Encontramos dados salvos automaticamente de ${new Date(autoSaved.timestamp).toLocaleString()}. Deseja restaurá-los?`,
          {
            action: {
              label: 'Restaurar',
              onClick: () => {
                setDadosContrato(autoSaved.data);
                toast.success('Dados restaurados com sucesso!');
              }
            },
            duration: 10000
          }
        );
      }
    }
  }, [getAutoSavedData]);

  // Marcar mudanças não salvas
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [dadosContrato]);

  // Função para limpar dados e auto-save
  const resetCalculadora = () => {
    setDadosContrato(dadosIniciais);
    clearAutoSavedData();
    setHasUnsavedChanges(false);
    toast.success('Calculadora resetada!');
  };

  // Função para salvar manualmente
  const saveManually = async () => {
    await saveNow();
    setHasUnsavedChanges(false);
    toast.success('Dados salvos!');
  };

  return {
    dadosContrato,
    setDadosContrato,
    hasUnsavedChanges,
    resetCalculadora,
    saveManually,
    clearAutoSavedData
  };
};
