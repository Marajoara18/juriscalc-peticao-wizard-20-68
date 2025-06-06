
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isAutoReloading: boolean;
  reloadAttempts: number;
}

class ErrorBoundary extends Component<Props, State> {
  private autoReloadTimer: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isAutoReloading: false,
      reloadAttempts: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ERROR_BOUNDARY] Erro capturado:', error, errorInfo);
    
    // Log detalhado do erro
    this.logError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Chamar callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-reload após 3 segundos se for primeiro erro
    if (this.state.reloadAttempts < 2) {
      this.startAutoReload();
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      reloadAttempts: this.state.reloadAttempts
    };

    console.error('[ERROR_BOUNDARY] Log detalhado:', errorLog);
    
    // Salvar no localStorage para debug
    try {
      localStorage.setItem('last_error', JSON.stringify(errorLog));
    } catch (e) {
      console.error('Erro ao salvar log no localStorage:', e);
    }
  };

  private startAutoReload = () => {
    this.setState({ 
      isAutoReloading: true,
      reloadAttempts: this.state.reloadAttempts + 1
    });

    console.log('[ERROR_BOUNDARY] Iniciando auto-reload em 3 segundos...');
    
    this.autoReloadTimer = setTimeout(() => {
      console.log('[ERROR_BOUNDARY] Executando auto-reload');
      window.location.reload();
    }, 3000);
  };

  private handleManualReload = () => {
    console.log('[ERROR_BOUNDARY] Reload manual solicitado');
    if (this.autoReloadTimer) {
      clearTimeout(this.autoReloadTimer);
    }
    window.location.reload();
  };

  private handleGoHome = () => {
    console.log('[ERROR_BOUNDARY] Redirecionando para home');
    if (this.autoReloadTimer) {
      clearTimeout(this.autoReloadTimer);
    }
    window.location.href = '/home';
  };

  private handleRetry = () => {
    console.log('[ERROR_BOUNDARY] Tentando recuperar sem reload');
    if (this.autoReloadTimer) {
      clearTimeout(this.autoReloadTimer);
    }
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isAutoReloading: false
    });
  };

  componentWillUnmount() {
    if (this.autoReloadTimer) {
      clearTimeout(this.autoReloadTimer);
    }
  }

  render() {
    if (this.state.hasError) {
      // Se um componente de fallback personalizado foi fornecido, usar ele
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Se está fazendo auto-reload
      if (this.state.isAutoReloading) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                  <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <CardTitle className="text-juriscalc-navy">Recarregando aplicação...</CardTitle>
                <CardDescription>
                  A aplicação será recarregada automaticamente em alguns segundos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={this.handleManualReload}
                  className="w-full bg-juriscalc-navy hover:bg-juriscalc-blue"
                >
                  Recarregar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Componente de erro padrão
      return (
        <div className="min-h-screen bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-juriscalc-navy">Aplicação Parou de Funcionar</CardTitle>
              <CardDescription>
                {this.state.reloadAttempts >= 2 
                  ? "Ocorreram múltiplos erros. Use os botões abaixo para tentar recuperar."
                  : "Ocorreu um erro inesperado. A aplicação pode ser recarregada automaticamente."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button 
                  onClick={this.handleManualReload}
                  className="w-full bg-juriscalc-navy hover:bg-juriscalc-blue"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recarregar Página
                </Button>
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  className="w-full"
                >
                  Tentar Recuperar
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="w-full text-sm"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir para Início
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Detalhes técnicos (desenvolvimento)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Erro:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Tentativas de reload:</strong> {this.state.reloadAttempts}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">{this.state.error.stack}</pre>
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
