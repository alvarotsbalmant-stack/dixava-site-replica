import React from 'react';

interface AdminErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AdminErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>;
  onError?: (error: Error) => void;
}

export class AdminErrorBoundary extends React.Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Admin error boundary caught an error:', error, errorInfo);
    this.props.onError?.(error);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultAdminErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultAdminErrorFallback: React.FC<{ error?: Error; resetError?: () => void }> = ({ 
  error, 
  resetError 
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Erro no Painel Admin</h2>
      <p className="text-gray-400 mb-4">
        Ocorreu um erro ao carregar o painel administrativo.
      </p>
      {error && (
        <p className="text-gray-500 text-sm mb-6">{error.message}</p>
      )}
      {resetError && (
        <button 
          onClick={resetError}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
        >
          Tentar Novamente
        </button>
      )}
    </div>
  </div>
);