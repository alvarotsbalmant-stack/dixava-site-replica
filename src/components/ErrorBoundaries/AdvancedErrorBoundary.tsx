import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Tipos para error boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  level?: 'page' | 'section' | 'component';
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  retry: () => void;
  goHome: () => void;
  goBack: () => void;
  retryCount: number;
  maxRetries: number;
  level: 'page' | 'section' | 'component';
}

// Componente de fallback padrão
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
  goHome,
  goBack,
  retryCount,
  maxRetries,
  level
}) => {
  const getErrorMessage = () => {
    switch (level) {
      case 'page':
        return 'Ops! Algo deu errado na página.';
      case 'section':
        return 'Esta seção não pôde ser carregada.';
      case 'component':
        return 'Componente indisponível no momento.';
      default:
        return 'Algo deu errado.';
    }
  };

  const getErrorDescription = () => {
    switch (level) {
      case 'page':
        return 'A página encontrou um erro inesperado. Tente recarregar ou volte à página inicial.';
      case 'section':
        return 'Esta seção está temporariamente indisponível. O resto da página deve funcionar normalmente.';
      case 'component':
        return 'Este componente não pôde ser exibido. Tente novamente em alguns instantes.';
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  };

  const showRetry = retryCount < maxRetries;
  const showNavigation = level === 'page';

  return (
    <Card className="w-full max-w-md mx-auto my-8">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-lg">{getErrorMessage()}</CardTitle>
        <CardDescription>{getErrorDescription()}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {showRetry && (
          <Button 
            onClick={retry} 
            className="w-full"
            variant="default"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente ({maxRetries - retryCount} tentativas restantes)
          </Button>
        )}
        
        {showNavigation && (
          <div className="flex space-x-2">
            <Button 
              onClick={goBack} 
              variant="outline" 
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button 
              onClick={goHome} 
              variant="outline" 
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Início
            </Button>
          </div>
        )}
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Detalhes do erro (desenvolvimento)
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

// Error Boundary principal
export class AdvancedErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    });

    // Log do erro
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Callback personalizado
    this.props.onError?.(error, errorInfo);
    
    // Enviar erro para serviço de monitoramento (se configurado)
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;
    
    if (hasError && prevProps.resetOnPropsChange !== resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, idx) => prevProps.resetKeys?.[idx] !== key
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        error_id: this.state.errorId
      });
    }
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    });
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;
    
    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
      
      // Reset automático após um tempo se o erro persistir
      this.resetTimeoutId = window.setTimeout(() => {
        if (this.state.hasError) {
          this.resetErrorBoundary();
        }
      }, 10000); // 10 segundos
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.handleGoHome();
    }
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback: CustomFallback, maxRetries = 3, level = 'component' } = this.props;

    if (hasError && error && errorInfo) {
      const FallbackComponent = CustomFallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          retry={this.handleRetry}
          goHome={this.handleGoHome}
          goBack={this.handleGoBack}
          retryCount={retryCount}
          maxRetries={maxRetries}
          level={level}
        />
      );
    }

    return children;
  }
}

// HOC para envolver componentes com error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <AdvancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </AdvancedErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook para usar error boundary programaticamente
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);
  
  const resetError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);
  
  // Throw error para ser capturado pelo error boundary
  if (error) {
    throw error;
  }
  
  return { captureError, resetError };
};

// Componentes específicos para diferentes níveis
export const PageErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <AdvancedErrorBoundary {...props} level="page" />
);

export const SectionErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <AdvancedErrorBoundary {...props} level="section" />
);

export const ComponentErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => (
  <AdvancedErrorBoundary {...props} level="component" />
);

// Fallback específico para produtos
export const ProductErrorFallback: React.FC<ErrorFallbackProps> = ({ retry, retryCount, maxRetries }) => (
  <Card className="w-full h-64 flex items-center justify-center">
    <CardContent className="text-center space-y-3">
      <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto" />
      <div>
        <h3 className="font-medium">Produto indisponível</h3>
        <p className="text-sm text-gray-600">Não foi possível carregar este produto.</p>
      </div>
      {retryCount < maxRetries && (
        <Button onClick={retry} size="sm" variant="outline">
          <RefreshCw className="w-3 h-3 mr-1" />
          Tentar novamente
        </Button>
      )}
    </CardContent>
  </Card>
);

// Fallback específico para seções
export const SectionErrorFallback: React.FC<ErrorFallbackProps> = ({ retry, retryCount, maxRetries }) => (
  <div className="w-full py-8 text-center space-y-3 border-2 border-dashed border-gray-200 rounded-lg">
    <AlertTriangle className="w-6 h-6 text-gray-400 mx-auto" />
    <div>
      <h3 className="font-medium text-gray-700">Seção temporariamente indisponível</h3>
      <p className="text-sm text-gray-500">Esta seção será carregada em breve.</p>
    </div>
    {retryCount < maxRetries && (
      <Button onClick={retry} size="sm" variant="ghost">
        <RefreshCw className="w-3 h-3 mr-1" />
        Recarregar seção
      </Button>
    )}
  </div>
);

