
import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface AutoSaveOptions<T> {
  data: T;
  key: string;
  onSave?: (data: T) => Promise<void> | void;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = <T,>({
  data,
  key,
  onSave,
  delay = 30000, // 30 segundos por padrão
  enabled = true
}: AutoSaveOptions<T>) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const isInitialLoadRef = useRef(true);

  const saveData = useCallback(async () => {
    if (!enabled || !data) return;

    try {
      // Salvar no localStorage como backup
      localStorage.setItem(`autosave_${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));

      // Chamar função de save personalizada se fornecida
      if (onSave) {
        await onSave(data);
      }

      console.log(`[AUTO_SAVE] Dados salvos automaticamente para ${key}`);
    } catch (error) {
      console.error('[AUTO_SAVE] Erro ao salvar dados:', error);
      toast.error('Erro ao salvar automaticamente. Seus dados podem ser perdidos.');
    }
  }, [data, key, onSave, enabled]);

  // Função para recuperar dados salvos
  const getAutoSavedData = useCallback((): { data: T; timestamp: string } | null => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('[AUTO_SAVE] Erro ao recuperar dados salvos:', error);
      return null;
    }
  }, [key]);

  // Função para limpar dados salvos
  const clearAutoSavedData = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
  }, [key]);

  useEffect(() => {
    if (!enabled || !data) return;

    // Pular o primeiro save (dados iniciais)
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      lastSavedDataRef.current = JSON.stringify(data);
      return;
    }

    // Verificar se os dados mudaram
    const currentDataString = JSON.stringify(data);
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Configurar novo timeout para salvar
    timeoutRef.current = setTimeout(() => {
      saveData();
      lastSavedDataRef.current = currentDataString;
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, saveData]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    getAutoSavedData,
    clearAutoSavedData,
    saveNow: saveData
  };
};
