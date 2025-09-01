import React, { Suspense, lazy } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminErrorBoundary } from './AdminErrorBoundary';

// Lazy load admin components only when needed
const AdminPanel = lazy(() => 
  import('@/components/Admin/AdminPanel').then(module => ({ 
    default: module.AdminPanel 
  }))
);

const AdminErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Erro no Painel Admin</h2>
      <p className="text-gray-400 mb-4">
        Ocorreu um erro ao carregar o painel administrativo.
      </p>
      <p className="text-gray-500 text-sm mb-6">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);

const AdminLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-white text-lg">Carregando Painel Admin...</p>
      <p className="text-gray-400 text-sm mt-2">Aguarde, estamos preparando as ferramentas administrativas</p>
    </div>
  </div>
);

interface ConditionalAdminLoaderProps {
  children?: React.ReactNode;
}

export const ConditionalAdminLoader: React.FC<ConditionalAdminLoaderProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return <AdminLoadingFallback />;
  }

  // Redirect if not admin
  if (!user || !isAdmin) {
    return null; // Let the parent route handle redirect
  }

  // Only load admin panel for verified admins
  return (
    <AdminErrorBoundary 
      onError={(error) => {
        console.error('Admin panel error:', error);
      }}
    >
      <Suspense fallback={<AdminLoadingFallback />}>
        {children || <AdminPanel />}
      </Suspense>
    </AdminErrorBoundary>
  );
};