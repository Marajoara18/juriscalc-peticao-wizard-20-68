
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
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ERROR_BOUNDARY] Erro capturado:', error, errorInfo);
    
    // Log do erro para monitoramento
    this.logError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Chamar callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Log estruturado para facilitar debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('[ERROR_BOUNDARY] Log detalhado:', errorLog);
    
    // Aqui você pode enviar para um serviço de monitoramento como Sentry
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/home';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Se um componente de fallback personalizado foi fornecido, usar ele
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Componente de erro padrão
      return (
        <div className="min-h-screen bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-juriscalc-navy">Ops! Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado na aplicação. Não se preocupe, seus dados estão seguros.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full bg-juriscalc-navy hover:bg-juriscalc-blue"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir para Início
                </Button>
                <Button 
                  onClick={this.handleReload}
                  variant="ghost"
                  className="w-full text-sm"
                >
                  Recarregar Página
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
