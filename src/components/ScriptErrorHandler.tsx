
import { useEffect } from 'react';
import { toast } from 'sonner';

const ScriptErrorHandler = () => {
  useEffect(() => {
    console.log('[SCRIPT_ERROR_HANDLER] Iniciando proteção contra scripts problemáticos...');

    // Função para remover TODOS os scripts e iframes problemáticos
    const removeProblematicElements = () => {
      // Scripts conhecidos problemáticos
      const problematicSelectors = [
        'script[src*="googletagmanager.com"]',
        'script[src*="doubleclick.net"]',
        'script[src*="google-analytics.com"]',
        'script[src*="netlify"]',
        'iframe[src*="doubleclick.net"]',
        'iframe[src*="googletagmanager"]',
        'iframe[allow*="join-ad-interest-group"]'
      ];

      problematicSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          console.log('[SCRIPT_ERROR_HANDLER] Removendo elemento problemático:', element.getAttribute('src') || element.outerHTML.substring(0, 100));
          element.remove();
        });
      });

      // Remover qualquer script que contenha palavras-chave problemáticas
      const allScripts = document.querySelectorAll('script');
      allScripts.forEach(script => {
        const src = script.getAttribute('src') || '';
        const content = script.innerHTML || '';
        
        const problematicKeywords = [
          'googletagmanager',
          'doubleclick',
          'google-analytics',
          'gtag',
          'fbevents',
          'netlify'
        ];
        
        const isProblematic = problematicKeywords.some(keyword => 
          src.toLowerCase().includes(keyword) || 
          content.toLowerCase().includes(keyword)
        );
        
        if (isProblematic) {
          console.log('[SCRIPT_ERROR_HANDLER] Removendo script suspeito:', src || 'inline script');
          script.remove();
        }
      });

      // Remover iframes problemáticos
      const allIframes = document.querySelectorAll('iframe');
      allIframes.forEach(iframe => {
        const src = iframe.getAttribute('src') || '';
        const allow = iframe.getAttribute('allow') || '';
        
        if (src.includes('doubleclick') || 
            src.includes('googletagmanager') ||
            allow.includes('join-ad-interest-group')) {
          console.log('[SCRIPT_ERROR_HANDLER] Removendo iframe problemático:', src);
          iframe.remove();
        }
      });
    };

    // Handler para erros de scripts externos
    const handleScriptError = (event: ErrorEvent) => {
      const { error, filename, message } = event;
      
      console.log('[SCRIPT_ERROR_HANDLER] Erro detectado:', { message, filename });

      // Lista de erros sempre ignorados
      const ignoredErrors = [
        'googletagmanager',
        'doubleclick',
        'google-analytics',
        'gtag',
        'fbevents',
        'netlify',
        'Script error',
        'ResizeObserver loop limit exceeded',
        'Network request failed',
        'Loading chunk',
        'Non-Error promise rejection'
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

      // Para erros não ignorados, apenas log (não quebrar a aplicação)
      console.warn('[SCRIPT_ERROR_HANDLER] Erro de script não crítico:', {
        message,
        filename,
        timestamp: new Date().toISOString()
      });

      return false;
    };

    // Handler para promises rejeitadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      if (typeof reason === 'string') {
        const ignoredReasons = [
          'googletagmanager',
          'doubleclick',
          'google-analytics',
          'netlify',
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

      console.warn('[SCRIPT_ERROR_HANDLER] Promise rejection não crítica:', reason);
    };

    // Registrar handlers
    window.addEventListener('error', handleScriptError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Remover elementos problemáticos imediatamente
    removeProblematicElements();

    // Remover elementos problemáticos a cada 3 segundos
    const cleanupInterval = setInterval(removeProblematicElements, 3000);

    // Observer para novos elementos adicionados
    const observer = new MutationObserver((mutations) => {
      let needsCleanup = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT' || node.nodeName === 'IFRAME') {
            const element = node as HTMLElement;
            const src = element.getAttribute('src') || '';
            
            if (src.includes('googletagmanager') || 
                src.includes('doubleclick') ||
                src.includes('netlify')) {
              needsCleanup = true;
            }
          }
        });
      });
      
      if (needsCleanup) {
        setTimeout(removeProblematicElements, 100);
      }
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
