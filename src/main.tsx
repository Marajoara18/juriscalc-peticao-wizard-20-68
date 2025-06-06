
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

// Componente seguro com error handling
function SafeApp() {
  try {
    return <App />
  } catch (error) {
    console.error('Erro no App:', error)
    return (
      <div style={{ padding: '20px', textAlign: 'center', minHeight: '100vh' }}>
        <h2>Erro de renderização</h2>
        <p>{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', fontSize: '16px', margin: '10px' }}
        >
          Recarregar Sistema
        </button>
      </div>
    )
  }
}

// Função para limpar iframes problemáticos
const removeProblematicIframes = () => {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    const src = iframe.src || '';
    const allowList = iframe.getAttribute('allow') || '';
    
    // Remove iframes suspeitos
    if (src.includes('doubleclick.net') || 
        src.includes('googletagmanager') ||
        src.includes('netlify') ||
        allowList.includes('join-ad-interest-group')) {
      console.log('🗑️ Removendo iframe problemático:', src);
      iframe.remove();
    }
  });
};

// Render inicial
console.log('🚀 Aplicação iniciando...')
root.render(<SafeApp />)

// Verificação mais agressiva de body vazio
const checkAndFixEmptyBody = () => {
  const rootEl = document.getElementById('root')
  const bodyIsEmpty = !rootEl || rootEl.children.length === 0
  const isVisible = !document.hidden
  
  if (bodyIsEmpty && isVisible) {
    console.warn('⚠️ Root vazio detectado, forçando re-render...')
    
    // Limpar iframes problemáticos primeiro
    removeProblematicIframes();
    
    // Re-render da aplicação
    root.render(<SafeApp />)
    
    // Verificar novamente após 500ms
    setTimeout(() => {
      const stillEmpty = !document.getElementById('root')?.children.length
      if (stillEmpty) {
        console.error('❌ Re-render falhou, tentando reload completo...')
        window.location.reload()
      }
    }, 500)
  }
}

// Verificação a cada 1 segundo (mais frequente)
setInterval(checkAndFixEmptyBody, 1000)

// Listener para re-render quando volta à aba
document.addEventListener('visibilitychange', () => {
  const rootContent = document.getElementById('root')?.innerHTML
  const isEmpty = !rootContent || rootContent.trim() === ''
  
  console.log('👁️ Visibilidade mudou:', {
    hidden: document.hidden,
    rootEmpty: isEmpty,
    timestamp: new Date().toLocaleTimeString()
  })
  
  if (!document.hidden) {
    // Limpar scripts/iframes problemáticos quando volta à aba
    removeProblematicIframes();
    
    if (isEmpty) {
      console.log('🔄 Body vazio detectado ao voltar à aba, re-renderizando...')
      checkAndFixEmptyBody()
    }
  }
})

// Observer para detectar mudanças no DOM
const observer = new MutationObserver((mutations) => {
  let shouldCleanup = false
  
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeName === 'IFRAME') {
        const iframe = node as HTMLIFrameElement
        const src = iframe.src || ''
        
        if (src.includes('doubleclick.net') || 
            src.includes('googletagmanager') ||
            src.includes('netlify')) {
          shouldCleanup = true
        }
      }
    })
  })
  
  if (shouldCleanup) {
    setTimeout(removeProblematicIframes, 100)
  }
})

observer.observe(document.body, { childList: true, subtree: true })

// Cleanup inicial de scripts problemáticos
setTimeout(() => {
  removeProblematicIframes()
  
  // Remover scripts do Google Tag Manager e similares
  const scripts = document.querySelectorAll('script')
  scripts.forEach(script => {
    const src = script.src || ''
    if (src.includes('googletagmanager') || 
        src.includes('doubleclick') ||
        script.innerHTML.includes('Google Tag Manager')) {
      console.log('🗑️ Removendo script problemático:', src || 'inline script')
      script.remove()
    }
  })
}, 1000)
