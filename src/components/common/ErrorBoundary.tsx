import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    window.location.href = '/home';
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-juriscalc-blue via-juriscalc-navy to-juriscalc-gold">
          <div className="text-center text-white max-w-md mx-auto px-4">
            <div className="mb-4">
              <AlertCircle className="mx-auto h-16 w-16 text-red-400" />
            </div>
            <h2 className="text-xl font-medium mb-2">Ops! Algo deu errado</h2>
            <p className="text-sm opacity-75 mb-4">
              Desculpe, ocorreu um erro inesperado. Por favor, tente novamente.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={this.handleRetry}
                className="w-full bg-white text-juriscalc-navy hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full border-white text-white hover:bg-white/10"
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar para Home
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-4 bg-black/20 rounded text-left">
                <p className="text-red-400 font-mono text-sm">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-xs text-white/70 overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 