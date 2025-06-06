
import { useEffect } from 'react';
import { toast } from 'sonner';

const ScriptErrorHandler = () => {
  useEffect(() => {
    console.log('[SCRIPT_ERROR_HANDLER] Iniciando limpeza de scripts...');

    // Função para remover TODOS os scripts do CloudFlare
    const removeCloudFlareScripts = () => {
      // Scripts conhecidos do CloudFlare
      const cloudflareSelectors = [
        'script[src*="cloudflareinsights.com"]',
        'script[src*="cf-beacon"]',
        'script[src*="cloudflare-insights"]',
        'script[src*="cf-insights"]',
        'script[data-cf-beacon]',
        'script[data-cf-settings]'
      ];

      cloudflareSelectors.forEach(selector => {
        const scripts = document.querySelectorAll(selector);
        scripts.forEach(script => {
          console.log('[SCRIPT_ERROR_HANDLER] Removendo script CloudFlare:', script.getAttribute('src') || script.outerHTML);
          script.remove();
        });
      });

      // Remover qualquer script que contenha 'cloudflare' no src
      const allScripts = document.querySelectorAll('script[src]');
      allScripts.forEach(script => {
        const src = script.getAttribute('src') || '';
        if (src.toLowerCase().includes('cloudflare') || 
            src.toLowerCase().includes('cf-') ||
            src.toLowerCase().includes('beacon')) {
          console.log('[SCRIPT_ERROR_HANDLER] Removendo script suspeito:', src);
          script.remove();
        }
      });
    };

    // Handler para erros de scripts externos
    const handleScriptError = (event: ErrorEvent) => {
      const { error, filename, message } = event;
      
      console.log('[SCRIPT_ERROR_HANDLER] Erro detectado:', { message, filename });

      // Lista expandida de erros ignorados
      const ignoredErrors = [
        'cloudflare',
        'cf-insights',
        'cf-beacon',
        'cloudflareinsights',
        'gtag',
        'google-analytics',
        'facebook.net',
        'Non-Error promise rejection captured',
        'Script error',
        'ResizeObserver loop limit exceeded',
        'Network request failed',
        'Loading chunk'
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
      console.error('[SCRIPT_ERROR_HANDLER] Erro de script crítico:', {
        message,
        filename,
        error: error?.stack,
        timestamp: new Date().toISOString()
      });

      return false;
    };

    // Handler para promises rejeitadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      console.log('[SCRIPT_ERROR_HANDLER] Promise rejection:', reason);

      if (typeof reason === 'string') {
        const ignoredReasons = [
          'cloudflare',
          'cf-insights',
          'cf-beacon',
          'non-error promise rejection',
          'network error',
          'loading chunk'
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

      console.error('[SCRIPT_ERROR_HANDLER] Promise rejection crítica:', reason);
    };

    // Registrar handlers
    window.addEventListener('error', handleScriptError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Remover scripts imediatamente
    removeCloudFlareScripts();

    // Remover scripts periodicamente (a cada 5 segundos)
    const cleanupInterval = setInterval(removeCloudFlareScripts, 5000);

    // Observer para novos scripts adicionados
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            const script = node as HTMLScriptElement;
            const src = script.src || '';
            if (src.toLowerCase().includes('cloudflare') || 
                src.toLowerCase().includes('cf-') ||
                src.toLowerCase().includes('beacon')) {
              console.log('[SCRIPT_ERROR_HANDLER] Bloqueando novo script CloudFlare:', src);
              script.remove();
            }
          }
        });
      });
    });

    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => {
      window.removeEventListener('error', handleScriptError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(cleanupInterval);
      observer.disconnect();
    };
  }, []);

  return null;
};

export default ScriptErrorHandler;
