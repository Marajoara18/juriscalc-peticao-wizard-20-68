
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface VisibilityErrorBoundaryProps {
  children: React.ReactNode;
}

const VisibilityErrorBoundary: React.FC<VisibilityErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Detectar erros relacionados à visibilidade da página
      const visibilityRelatedErrors = [
        'cannot read property',
        'undefined is not a function',
        'permission denied',
        'network error',
        'fetch failed'
      ];

      const isVisibilityError = visibilityRelatedErrors.some(errorType => 
        event.message?.toLowerCase().includes(errorType) ||
        event.error?.message?.toLowerCase().includes(errorType)
      );

      if (isVisibilityError) {
        console.error('[VISIBILITY_ERROR_BOUNDARY] Erro relacionado à visibilidade capturado:', {
          message: event.message,
          filename: event.filename,
          error: event.error
        });
        
        setErrorCount(prev => prev + 1);
        
        // Se tiver muitos erros em sequência, considerar erro fatal
        if (errorCount >= 3) {
          setHasError(true);
        }
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[VISIBILITY_ERROR_BOUNDARY] Promise rejection capturada:', event.reason);
      
      // Prevenir alguns tipos de erro que não são críticos
      if (typeof event.reason === 'string') {
        const ignoredErrors = [
          'network error',
          'aborted',
          'timeout',
          'cancelled'
        ];
        
        const shouldIgnore = ignoredErrors.some(ignored => 
          event.reason.toLowerCase().includes(ignored)
        );
        
        if (!shouldIgnore) {
          setErrorCount(prev => prev + 1);
          if (errorCount >= 2) {
            setHasError(true);
          }
        }
      }
    };

    // Reset error count após período sem erros
    const resetErrorCount = setInterval(() => {
      setErrorCount(0);
    }, 30000); // Reset a cada 30 segundos

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(resetErrorCount);
    };
  }, [errorCount]);

  // Detectar mudanças de visibilidade que podem estar causando problemas
  useEffect(() => {
    let visibilityChangeCount = 0;
    
    const handleVisibilityChange = () => {
      visibilityChangeCount++;
      
      // Se houve muitas mudanças de visibilidade em pouco tempo, pode indicar problema
      if (visibilityChangeCount > 10) {
        console.warn('[VISIBILITY_ERROR_BOUNDARY] Muitas mudanças de visibilidade detectadas');
      }
      
      // Reset contador após 1 minuto
      setTimeout(() => {
        visibilityChangeCount = Math.max(0, visibilityChangeCount - 1);
      }, 60000);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
              <RefreshCw className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-juriscalc-navy">Problema de Visibilidade Detectado</CardTitle>
            <CardDescription>
              A aplicação encontrou um problema ao alternar entre abas. Recarregar a página deve resolver.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-juriscalc-navy hover:bg-juriscalc-blue"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar Página
            </Button>
            <Button 
              onClick={() => setHasError(false)}
              variant="outline"
              className="w-full"
            >
              Tentar Continuar
            </Button>
            
            <div className="text-xs text-gray-500 text-center">
              Erros detectados: {errorCount}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default VisibilityErrorBoundary;
