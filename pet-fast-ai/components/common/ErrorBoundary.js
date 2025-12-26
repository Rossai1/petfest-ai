'use client';

import { Component } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

/**
 * Error Boundary para capturar erros em componentes React
 * Exibe uma UI amigável quando algo dá errado
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para debugging (apenas em development)
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="organic-card max-w-md w-full text-center space-y-6 p-8">
            {/* Ícone */}
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>

            {/* Mensagem */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Oops! Algo deu errado
              </h1>
              <p className="text-muted-foreground">
                Não se preocupe, estamos cuidando disso. Tente recarregar a página.
              </p>
            </div>

            {/* Detalhes do erro (apenas em development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left text-sm bg-muted/50 rounded-2xl p-4">
                <summary className="cursor-pointer font-medium text-muted-foreground">
                  Detalhes técnicos
                </summary>
                <pre className="mt-2 text-xs overflow-auto text-destructive whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}

            {/* Botões de ação */}
            <div className="flex gap-3 justify-center pt-2">
              <Button
                onClick={this.handleReload}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Página Inicial
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
