
import { useEffect } from 'react';
import { toast } from 'sonner';

const ScriptErrorHandler = () => {
  useEffect(() => {
    // Handler para erros de scripts externos
    const handleScriptError = (event: ErrorEvent) => {
      const { error, filename, message } = event;
      
      // Filtrar erros conhecidos do CloudFlare Insights e outros scripts externos
      const ignoredErrors = [
        'cloudflare',
        'cf-insights',
        'gtag',
        'google-analytics',
        'facebook.net',
        'Non-Error promise rejection captured',
        'Script error',
        'ResizeObserver loop limit exceeded'
      ];

      const shouldIgnore = ignoredErrors.some(ignored => 
        filename?.toLowerCase().includes(ignored) || 
        message?.toLowerCase().includes(ignored)
      );

      if (shouldIgnore) {
        console.log('[SCRIPT_ERROR_HANDLER] Erro ignorado de script externo:', { filename, message });
        event.preventDefault();
        return true;
      }

      // Log de erros não ignorados
      console.error('[SCRIPT_ERROR_HANDLER] Erro de script:', {
        message,
        filename,
        error: error?.stack,
        timestamp: new Date().toISOString()
      });

      return false;
    };

    // Handler para promises rejeitadas não capturadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      // Ignorar erros comuns de scripts externos
      if (typeof reason === 'string') {
        const ignoredReasons = [
          'cloudflare',
          'cf-insights',
          'non-error promise rejection'
        ];

        const shouldIgnore = ignoredReasons.some(ignored => 
          reason.toLowerCase().includes(ignored)
        );

        if (shouldIgnore) {
          console.log('[SCRIPT_ERROR_HANDLER] Promise rejection ignorada:', reason);
          event.preventDefault();
          return;
        }
      }

      console.error('[SCRIPT_ERROR_HANDLER] Promise rejection não tratada:', reason);
      
      // Para erros críticos, mostrar um toast discreto
      if (reason?.name !== 'ChunkLoadError') {
        toast.error('Ocorreu um erro inesperado. Se persistir, recarregue a página.');
      }
    };

    // Registrar os handlers
    window.addEventListener('error', handleScriptError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Função para remover scripts problemáticos do CloudFlare Insights
    const removeProblematicScripts = () => {
      const scripts = document.querySelectorAll('script[src*="cloudflare"], script[src*="cf-insights"]');
      scripts.forEach(script => {
        if (script.getAttribute('src')?.includes('beacon') || 
            script.getAttribute('src')?.includes('insights')) {
          console.log('[SCRIPT_ERROR_HANDLER] Removendo script problemático:', script.getAttribute('src'));
          script.remove();
        }
      });
    };

    // Executar limpeza após o carregamento da página
    if (document.readyState === 'complete') {
      removeProblematicScripts();
    } else {
      window.addEventListener('load', removeProblematicScripts);
    }

    // Cleanup
    return () => {
      window.removeEventListener('error', handleScriptError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('load', removeProblematicScripts);
    };
  }, []);

  return null;
};

export default ScriptErrorHandler;
