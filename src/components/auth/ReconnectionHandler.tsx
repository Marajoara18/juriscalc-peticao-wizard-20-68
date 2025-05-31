import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/auth/useSupabaseAuth';
import { Loader2 } from 'lucide-react';

export const ReconnectionHandler: React.FC = () => {
  const { sessionError, loading, reconnect } = useSupabaseAuth();

  useEffect(() => {
    if (sessionError) {
      const timer = setTimeout(() => {
        reconnect();
      }, 5000); // Tentar reconectar automaticamente após 5 segundos

      return () => clearTimeout(timer);
    }
  }, [sessionError, reconnect]);

  if (!sessionError) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Problema de Conexão
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Houve um problema com sua conexão. Tentando reconectar automaticamente...
        </p>
        <div className="flex flex-col gap-4">
          <Button
            onClick={reconnect}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reconectando...
              </>
            ) : (
              'Tentar Novamente'
            )}
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            Recarregar Página
          </Button>
        </div>
      </div>
    </div>
  );
}; 