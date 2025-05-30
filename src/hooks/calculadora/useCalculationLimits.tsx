
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { hasUnlimitedAccess } from '@/hooks/auth/authUtils';

const LIMITE_CALCULOS_GRATUITOS = 3;
const KEY_CONTADOR_CALCULOS = 'calculosRealizados';

export const useCalculationLimits = () => {
  const { user, profile } = useSupabaseAuth();
  
  // Estado para controlar se o usuário pode realizar mais cálculos
  const [podeCalcular, setPodeCalcular] = useState<boolean>(true);
  
  // Estado para controlar a modal de assinatura
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  
  // Verificar número de cálculos realizados pelo usuário
  useEffect(() => {
    if (!user) {
      console.log('CALCULATION_LIMITS: No user authenticated');
      setPodeCalcular(false);
      return;
    }

    const userId = user.id;
    
    // Verificar número de cálculos realizados
    const calculosKey = `${KEY_CONTADOR_CALCULOS}_${userId}`;
    const calculosRealizados = localStorage.getItem(calculosKey) 
      ? parseInt(localStorage.getItem(calculosKey) || '0', 10) 
      : 0;
    
    // Usar a função centralizada para verificar acesso ilimitado
    const hasUnlimited = hasUnlimitedAccess(profile, user.email);
    
    console.log('CALCULATION_LIMITS: Verificação de limites:', {
      userId,
      userEmail: user.email,
      calculosRealizados,
      hasUnlimited,
      planId: profile?.plano_id,
      remainingCalculations: hasUnlimited ? 'unlimited' : Math.max(0, LIMITE_CALCULOS_GRATUITOS - calculosRealizados)
    });
    
    // Para usuários com acesso ilimitado, sempre permitir calcular
    if (hasUnlimited) {
      console.log('CALCULATION_LIMITS: Unlimited access - no calculation limits');
      setPodeCalcular(true);
      return;
    }
    
    // Para usuários sem acesso ilimitado, verificar limite de cálculos
    const podeCalcularNovo = calculosRealizados < LIMITE_CALCULOS_GRATUITOS;
    console.log('CALCULATION_LIMITS: Setting podeCalcular to:', podeCalcularNovo, 
      `(${calculosRealizados}/${LIMITE_CALCULOS_GRATUITOS} used)`);
    setPodeCalcular(podeCalcularNovo);
  }, [user, profile]);

  // Função para verificar e incrementar contador de cálculos
  const verificarLimiteCalculos = (originalCalc: () => void) => {
    if (!user) {
      console.error('CALCULATION_LIMITS: No user authenticated');
      toast.error('Você precisa estar logado para realizar cálculos');
      return;
    }

    const userId = user.id;
    
    // Usar a função centralizada para verificar acesso ilimitado
    const hasUnlimited = hasUnlimitedAccess(profile, user.email);
    
    console.log('CALCULATION_LIMITS: Verificando limites antes da execução:', { 
      userId, 
      userEmail: user.email,
      hasUnlimited,
      planId: profile?.plano_id
    });
    
    // Para usuários com acesso ilimitado, não há limitação
    if (hasUnlimited) {
      console.log('CALCULATION_LIMITS: Unlimited access - executing calculation without limits');
      return originalCalc();
    }
    
    // Para usuários sem acesso ilimitado, verificar e incrementar contador
    const calculosKey = `${KEY_CONTADOR_CALCULOS}_${userId}`;
    const calculosRealizados = localStorage.getItem(calculosKey) 
      ? parseInt(localStorage.getItem(calculosKey) || '0', 10) 
      : 0;
    
    console.log('CALCULATION_LIMITS: Current calculations count:', calculosRealizados, 'of', LIMITE_CALCULOS_GRATUITOS);
    
    // Se atingiu o limite, mostrar modal de assinatura
    if (calculosRealizados >= LIMITE_CALCULOS_GRATUITOS) {
      console.log('CALCULATION_LIMITS: Calculation limit reached - showing subscription modal');
      toast.error(`Você atingiu o limite de ${LIMITE_CALCULOS_GRATUITOS} cálculos gratuitos. Assine o plano premium para continuar.`);
      setShowSubscriptionModal(true);
      return;
    }
    
    // Incrementar contador e salvar
    const novoValor = calculosRealizados + 1;
    localStorage.setItem(calculosKey, novoValor.toString());
    console.log('CALCULATION_LIMITS: Updated calculation count to:', novoValor, 
      `(${LIMITE_CALCULOS_GRATUITOS - novoValor} calculations remaining)`);
    
    // Atualizar estado se necessário
    if (novoValor >= LIMITE_CALCULOS_GRATUITOS) {
      console.log('CALCULATION_LIMITS: Limit reached after this calculation');
      setPodeCalcular(false);
    }
    
    // Executar o cálculo original
    return originalCalc();
  };

  return {
    podeCalcular,
    showSubscriptionModal,
    setShowSubscriptionModal,
    verificarLimiteCalculos
  };
};
