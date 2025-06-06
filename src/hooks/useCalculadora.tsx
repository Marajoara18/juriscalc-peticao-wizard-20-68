import { useState } from 'react';
import { DadosContrato, Adicionais, Resultados } from '@/types/calculadora';
import { resultadosIniciais } from '@/utils/calculadoraConstants';
import { useDadosContrato } from './calculadora/useDadosContrato';
import { useAdicionais } from './calculadora/useAdicionais';
import { useCalculos } from './calculadora/useCalculos';
import { useCalculadoraState } from './calculadora/useCalculadoraState';
import { useCalculationLimits } from './calculadora/useCalculationLimits';

const useCalculadora = () => {
  // Estado para os inputs
  const [dadosContrato, setDadosContrato] = useState<DadosContrato>({
    dataAdmissao: '',
    dataDemissao: '',
    salarioBase: '',
    tipoRescisao: 'sem_justa_causa',
    diasTrabalhados: '',
    mesesTrabalhados: '',
    aviso_previo_cumprido: false,
    fgts_depositado: false,
    contrato_tempo_determinado: false,
    meses_restantes_contrato: '',
  });

  // Estado para calcular adicionais
  const [adicionais, setAdicionais] = useState<Adicionais>({
    calcularInsalubridade: false,
    grauInsalubridade: 'minimo',
    baseCalculoInsalubridade: 'salario_minimo',
    // Novos campos para período específico de insalubridade
    insalubridadePeriodoEspecifico: false,
    dataInicioInsalubridade: '',
    dataFimInsalubridade: '',
    
    calcularPericulosidade: false,
    percentualPericulosidade: '30',
    baseCalculoPericulosidade: 'salario_base',
    // Novos campos para período específico de periculosidade
    periculosidadePeriodoEspecifico: false,
    dataInicioPericulosidade: '',
    dataFimPericulosidade: '',
    
    calcularMulta467: false,
    calcularMulta477: false,
    calcularAdicionalNoturno: false,
    percentualAdicionalNoturno: '20',
    horasNoturnas: '',
    calcularHorasExtras: false,
    quantidadeHorasExtras: '',
    percentualHorasExtras: '50',
    horasExtrasCalculos: [],
    calcularFeriasVencidas: false,
    periodosFeriasVencidas: '1',
    calcularIndenizacaoDemissao: false,
    valorIndenizacaoDemissao: '',
    calcularValeTransporte: false,
    valorDiarioVT: '',
    diasValeTransporte: '',
    calcularValeAlimentacao: false,
    valorDiarioVA: '',
    diasValeAlimentacao: '',
    calcularAdicionalTransferencia: false,
    percentualAdicionalTransferencia: '25',
    calcularDescontosIndevidos: false,
    valorDescontosIndevidos: '',
    calcularDiferencasSalariais: false,
    valorDiferencasSalariais: '',
    calcularCustom: false,
    calculosCustom: [],
    descricaoCustom: '',
    valorCustom: '',
    calcularSeguroDesemprego: false,
    tipoTrabalhador: 'padrao',
    salarioUltimos3Meses: 'sim',
    ultimoSalario: '',
    salarioMes1: '',
    salarioMes2: '',
    mesesTrabalhadosUltimoEmprego: '',
    tempoContribuicaoINSS: '',
    calcularSalarioFamilia: false,
    quantidadeFilhos: '',
    calcularHonorariosAdvocaticios: false,
    percentualHonorariosAdvocaticios: '20',
    valorHonorariosAdvocaticios: '',
    incluirTotalGeralHonorarios: false,
  });

  // Estado para os resultados
  const [resultados, setResultados] = useState<Resultados>(resultadosIniciais);
  
  // Hooks específicos
  const { handleDadosContratoChange, handleCheckboxChange, handleTipoRescisaoChange } = useDadosContrato(dadosContrato, setDadosContrato);
  const { handleAdicionaisChange } = useAdicionais(adicionais, setAdicionais);
  const { calcularResultados: originalCalcular } = useCalculos(dadosContrato, adicionais, setResultados);
  const calculadoraState = useCalculadoraState();
  const { podeCalcular, showSubscriptionModal, setShowSubscriptionModal, verificarLimiteCalculos } = useCalculationLimits();
  
  // Função para carregar um cálculo salvo
  const handleLoadCalculo = (calculo: any) => {
    // Implementação da função de carregar cálculo
    setDadosContrato(calculo.dadosContrato || dadosContrato);
    setAdicionais(calculo.adicionais || adicionais);
    setResultados(calculo.resultados || resultados);
  };
  
  // Função modificada para verificar limites antes de calcular
  const calcularResultados = () => {
    return verificarLimiteCalculos(originalCalcular);
  };

  return {
    dadosContrato,
    adicionais,
    resultados,
    setDadosContrato,
    setAdicionais,
    setResultados,
    handleDadosContratoChange,
    handleCheckboxChange,
    handleTipoRescisaoChange,
    handleAdicionaisChange,
    calcularResultados,
    podeCalcular,
    showSubscriptionModal,
    setShowSubscriptionModal,
    totalAdicionais: 0, // Placeholder
    totalGeral: 0, // Placeholder
    hasCalculos: false, // Placeholder
    handleLoadCalculo,
    ...calculadoraState
  };
};

export default useCalculadora;
