import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';

const NOVOS_LIMITES = {
  calculos: 6,
  peticoes: 6
};

// Usar a mesma versão que o useCalculationLimits usa
const STORAGE_VERSION = 'v2';
const KEY_CONTADOR_CALCULOS = `calculosRealizados_${STORAGE_VERSION}`;

export const UpdateLimits: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string>('');
  const { profile } = useSupabaseAuth();

  const limparLocalStorage = () => {
    // Limpar todos os contadores de cálculos (incluindo versões antigas)
    const keys = Object.keys(localStorage);
    const calculosKeys = keys.filter(key => key.startsWith('calculosRealizados'));
    const peticoesKeys = keys.filter(key => key.startsWith('peticoesCount'));
    
    calculosKeys.forEach(key => {
      console.log('Removendo contador:', key);
      localStorage.removeItem(key);
    });
    peticoesKeys.forEach(key => localStorage.removeItem(key));
    
    // Limpar outros contadores relacionados
    localStorage.removeItem('calculosCount');
    localStorage.removeItem('peticoesCount');
    
    return {
      calculosLimpos: calculosKeys.length,
      peticoesLimpas: peticoesKeys.length
    };
  };

  const atualizarLimites = async () => {
    console.log('Iniciando atualização de limites...');
    setLoading(true);
    try {
      // 1. Buscar todos os usuários com plano gratuito
      const { data: usuarios, error: errorBusca } = await supabase
        .from('perfis')
        .select('*')
        .eq('plano_id', 'gratuito');

      if (errorBusca) {
        throw new Error(`Erro ao buscar usuários: ${errorBusca.message}`);
      }

      console.log(`Encontrados ${usuarios?.length || 0} usuários gratuitos para atualizar`);
      setResultado(`Encontrados ${usuarios?.length || 0} usuários para atualizar...`);

      // 2. Atualizar cada usuário no banco
      let atualizados = 0;
      let erros = 0;

      for (const usuario of usuarios || []) {
        try {
          const { error: errorUpdate } = await supabase
            .from('perfis')
            .update({
              limite_calculos_salvos: NOVOS_LIMITES.calculos,
              limite_peticoes_salvas: NOVOS_LIMITES.peticoes,
              data_atualizacao: new Date().toISOString()
            })
            .eq('id', usuario.id);

          if (errorUpdate) {
            console.error(`Erro ao atualizar usuário ${usuario.id}:`, errorUpdate);
            erros++;
          } else {
            atualizados++;
            console.log(`Usuário ${usuario.id} atualizado com sucesso`);
          }
        } catch (error) {
          console.error(`Erro ao processar usuário ${usuario.id}:`, error);
          erros++;
        }
      }

      // 3. Limpar o localStorage
      const { calculosLimpos, peticoesLimpas } = limparLocalStorage();
      
      // 4. Atualizar o perfil atual se for um usuário gratuito
      if (profile && profile.plano_id === 'gratuito') {
        const { error: errorUpdateProfile } = await supabase
          .from('perfis')
          .update({
            limite_calculos_salvos: NOVOS_LIMITES.calculos,
            limite_peticoes_salvas: NOVOS_LIMITES.peticoes,
            data_atualizacao: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (errorUpdateProfile) {
          console.error('Erro ao atualizar perfil atual:', errorUpdateProfile);
        } else {
          console.log('Perfil atual atualizado com sucesso');
        }
      }

      const mensagem = `
        Atualização concluída!\n
        - Total de usuários: ${usuarios?.length || 0}\n
        - Atualizados com sucesso: ${atualizados}\n
        - Erros: ${erros}\n\n
        Limpeza do localStorage:\n
        - Contadores de cálculos limpos: ${calculosLimpos}\n
        - Contadores de petições limpos: ${peticoesLimpas}\n\n
        O localStorage foi limpo e o perfil foi atualizado.\n
        Por favor, faça logout e login novamente para garantir que as alterações sejam aplicadas.
      `;

      setResultado(mensagem);
      toast.success('Atualização de limites concluída! Por favor, faça logout e login novamente.');

    } catch (error: any) {
      const mensagem = `Erro na atualização: ${error.message}`;
      setResultado(mensagem);
      toast.error(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Atualização de Limites</CardTitle>
        <CardDescription>
          Atualiza os limites de todos os usuários gratuitos para {NOVOS_LIMITES.calculos} cálculos e {NOVOS_LIMITES.peticoes} petições.
          Também limpa todos os contadores locais e força uma atualização do perfil.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={atualizarLimites} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Atualizando...' : 'Atualizar Limites'}
          </Button>

          {resultado && (
            <pre className="bg-slate-100 p-4 rounded-lg whitespace-pre-wrap">
              {resultado}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpdateLimits; 