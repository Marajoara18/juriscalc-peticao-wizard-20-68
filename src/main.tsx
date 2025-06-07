
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './hooks/auth/useSupabaseAuth'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

// Componente seguro com error handling melhorado
function SafeApp() {
  try {
    return (
      <AuthProvider>
        <App />
      </AuthProvider>
    )
  } catch (error) {
    console.error('Erro no App:', error)
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to bottom right, #1e40af, #1e3a8a, #d97706)'
      }}>
        <h2 style={{ color: 'white', marginBottom: '20px' }}>Erro de renderização</h2>
        <p style={{ color: 'white', marginBottom: '20px' }}>
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            padding: '12px 24px', 
            fontSize: '16px', 
            backgroundColor: 'white',
            color: '#1e40af',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Recarregar Sistema
        </button>
      </div>
    )
  }
}

// Render inicial
console.log('🚀 Aplicação iniciando...')
root.render(<SafeApp />)

// Verificação menos agressiva de body vazio
const checkAndFixEmptyBody = () => {
  const rootEl = document.getElementById('root')
  const bodyIsEmpty = !rootEl || rootEl.children.length === 0
  const isVisible = !document.hidden
  
  if (bodyIsEmpty && isVisible) {
    console.warn('⚠️ Root vazio detectado, forçando re-render...')
    root.render(<SafeApp />)
  }
}

// Verificação a cada 10 segundos (menos agressivo)
setInterval(checkAndFixEmptyBody, 10000)

// Listener para re-render quando volta à aba
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    const rootContent = document.getElementById('root')?.innerHTML
    const isEmpty = !rootContent || rootContent.trim() === ''
    
    console.log('👁️ Visibilidade mudou:', {
      hidden: document.hidden,
      rootEmpty: isEmpty,
      timestamp: new Date().toLocaleTimeString()
    })
    
    if (isEmpty) {
      console.log('🔄 Body vazio detectado ao voltar à aba, re-renderizando...')
      setTimeout(checkAndFixEmptyBody, 1000)
    }
  }
})
