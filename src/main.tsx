
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

// Render inicial
console.log('🚀 Aplicação iniciando...')
root.render(<SafeApp />)

// Verificação automática de body vazio
setInterval(() => {
  const rootEl = document.getElementById('root')
  if (rootEl && rootEl.children.length === 0 && !document.hidden) {
    console.warn('Root vazio detectado, forçando re-render...')
    root.render(<SafeApp />)
  }
}, 2000) // Verifica a cada 2 segundos

// Listener para re-render se necessário quando volta à aba
document.addEventListener('visibilitychange', () => {
  const rootContent = document.getElementById('root')?.innerHTML
  const isEmpty = !rootContent || rootContent.trim() === ''
  
  console.log('👁️ Visibilidade mudou:', {
    hidden: document.hidden,
    rootEmpty: isEmpty,
    timestamp: new Date().toLocaleTimeString()
  })
  
  if (!document.hidden && isEmpty) {
    console.log('Body vazio detectado, re-renderizando...')
    root.render(<SafeApp />)
  }
})
