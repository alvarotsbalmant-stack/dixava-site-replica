import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ConditionalImportOptions {
  condition?: () => boolean;
  delay?: number;
}

/**
 * Hook para importação condicional de módulos pesados
 * Útil para carregar dependências apenas quando necessário (ex: admin features)
 */
export const useConditionalImport = <T>(
  importFn: () => Promise<T>,
  options: ConditionalImportOptions = {}
) => {
  const [module, setModule] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isAdmin, user } = useAuth();

  const { condition = () => !!user && isAdmin, delay = 0 } = options;

  const loadModule = useCallback(async () => {
    if (!condition()) return;
    
    setLoading(true);
    setError(null);

    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const loadedModule = await importFn();
      setModule(loadedModule);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load module'));
      console.error('Conditional import failed:', err);
    } finally {
      setLoading(false);
    }
  }, [importFn, condition, delay]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  const retry = useCallback(() => {
    setError(null);
    loadModule();
  }, [loadModule]);

  return {
    module,
    loading,
    error,
    retry,
    isReady: !!module && !loading && !error
  };
};

/**
 * Hook específico para carregar funcionalidades de admin
 */
export const useAdminImport = <T>(importFn: () => Promise<T>, delay = 1000) => {
  const { isAdmin, user, loading: authLoading } = useAuth();
  
  return useConditionalImport(importFn, {
    condition: () => !authLoading && !!user && isAdmin,
    delay
  });
};