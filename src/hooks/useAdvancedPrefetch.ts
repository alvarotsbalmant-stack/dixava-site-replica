import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { CacheKeys } from './useOptimizedCache';

// Tipos para configuração de prefetch
interface PrefetchConfig {
  delay: number;
  priority: 'high' | 'medium' | 'low';
  condition?: () => boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

interface PrefetchItem {
  id: string;
  queryKey: string[];
  queryFn: () => Promise<any>;
  config: PrefetchConfig;
  status: 'pending' | 'loading' | 'success' | 'error';
}

// Hook principal para prefetch avançado
export const useAdvancedPrefetch = () => {
  const queryClient = useQueryClient();
  const [prefetchQueue, setPrefetchQueue] = useState<PrefetchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Adicionar item à fila de prefetch
  const addToPrefetchQueue = useCallback((
    id: string,
    queryKey: string[],
    queryFn: () => Promise<any>,
    config: PrefetchConfig
  ) => {
    setPrefetchQueue(prev => {
      // Evitar duplicatas
      if (prev.some(item => item.id === id)) {
        return prev;
      }
      
      const newItem: PrefetchItem = {
        id,
        queryKey,
        queryFn,
        config,
        status: 'pending'
      };
      
      // Inserir na posição correta baseado na prioridade
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const insertIndex = prev.findIndex(item => 
        priorityOrder[item.config.priority] > priorityOrder[config.priority]
      );
      
      if (insertIndex === -1) {
        return [...prev, newItem];
      } else {
        return [
          ...prev.slice(0, insertIndex),
          newItem,
          ...prev.slice(insertIndex)
        ];
      }
    });
  }, []);

  // Processar fila de prefetch
  const processPrefetchQueue = useCallback(async () => {
    if (isProcessing || prefetchQueue.length === 0) return;
    
    setIsProcessing(true);
    abortControllerRef.current = new AbortController();
    
    try {
      for (const item of prefetchQueue) {
        if (abortControllerRef.current?.signal.aborted) break;
        
        // Verificar condição se existir
        if (item.config.condition && !item.config.condition()) {
          continue;
        }
        
        // Verificar se já está em cache
        const cached = queryClient.getQueryData(item.queryKey);
        if (cached) {
          console.log(`✅ Prefetch skip (cached): ${item.id}`);
          continue;
        }
        
        try {
          // Atualizar status
          setPrefetchQueue(prev => 
            prev.map(p => p.id === item.id ? { ...p, status: 'loading' } : p)
          );
          
          // Aguardar delay
          await new Promise(resolve => setTimeout(resolve, item.config.delay));
          
          if (abortControllerRef.current?.signal.aborted) break;
          
          // Executar prefetch
          console.log(`⚡ Prefetch iniciado: ${item.id}`);
          await queryClient.prefetchQuery({
            queryKey: item.queryKey,
            queryFn: item.queryFn,
            staleTime: 5 * 60 * 1000, // 5 minutos
          });
          
          // Atualizar status de sucesso
          setPrefetchQueue(prev => 
            prev.map(p => p.id === item.id ? { ...p, status: 'success' } : p)
          );
          
          item.config.onSuccess?.();
          console.log(`✅ Prefetch concluído: ${item.id}`);
          
        } catch (error) {
          console.warn(`❌ Prefetch erro: ${item.id}`, error);
          
          setPrefetchQueue(prev => 
            prev.map(p => p.id === item.id ? { ...p, status: 'error' } : p)
          );
          
          item.config.onError?.(error);
        }
        
        // Pequena pausa entre prefetches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      setIsProcessing(false);
      // Limpar itens processados
      setPrefetchQueue(prev => prev.filter(item => item.status === 'pending'));
    }
  }, [isProcessing, prefetchQueue, queryClient]);

  // Processar fila automaticamente
  useEffect(() => {
    if (prefetchQueue.length > 0 && !isProcessing) {
      const timer = setTimeout(processPrefetchQueue, 100);
      return () => clearTimeout(timer);
    }
  }, [prefetchQueue, isProcessing, processPrefetchQueue]);

  // Cancelar prefetches
  const cancelPrefetch = useCallback(() => {
    abortControllerRef.current?.abort();
    setPrefetchQueue([]);
    setIsProcessing(false);
  }, []);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    addToPrefetchQueue,
    cancelPrefetch,
    prefetchQueue,
    isProcessing
  };
};

// Hook para prefetch baseado em hover
export const useHoverPrefetch = () => {
  const { addToPrefetchQueue } = useAdvancedPrefetch();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefetchOnHover = useCallback((
    id: string,
    queryKey: string[],
    queryFn: () => Promise<any>,
    delay: number = 300
  ) => {
    return {
      onMouseEnter: () => {
        hoverTimeoutRef.current = setTimeout(() => {
          addToPrefetchQueue(id, queryKey, queryFn, {
            delay: 0,
            priority: 'high',
            condition: () => true
          });
        }, delay);
      },
      onMouseLeave: () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
      }
    };
  }, [addToPrefetchQueue]);

  return { prefetchOnHover };
};

// Hook para lazy loading com intersection observer
export const useLazyLoading = <T extends HTMLElement = HTMLDivElement>(
  onIntersect: () => void,
  options: IntersectionObserverInit = {}
) => {
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<T>(null);

  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '100px',
    ...options
  };

  useIntersectionObserver(
    elementRef,
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
        onIntersect();
      }
    },
    defaultOptions
  );

  return {
    elementRef,
    hasIntersected,
    isVisible: hasIntersected
  };
};

// Hook para prefetch de produtos relacionados
export const useProductPrefetch = () => {
  const { addToPrefetchQueue } = useAdvancedPrefetch();
  const { prefetchOnHover } = useHoverPrefetch();

  const prefetchProduct = useCallback((productId: string) => {
    const queryKey = CacheKeys.product(productId);
    const queryFn = async () => {
      const { fetchSingleProductFromDatabase } = await import('./useProducts/productApi');
      return fetchSingleProductFromDatabase(productId);
    };

    addToPrefetchQueue(
      `product-${productId}`,
      queryKey,
      queryFn,
      {
        delay: 200,
        priority: 'high'
      }
    );
  }, [addToPrefetchQueue]);

  const prefetchCategory = useCallback((category: string) => {
    const queryKey = CacheKeys.products({ category });
    const queryFn = async () => {
      const { fetchProductsFromDatabase } = await import('./useProducts/productApi');
      const products = await fetchProductsFromDatabase();
      return products.filter(p => p.category === category);
    };

    addToPrefetchQueue(
      `category-${category}`,
      queryKey,
      queryFn,
      {
        delay: 500,
        priority: 'medium'
      }
    );
  }, [addToPrefetchQueue]);

  const getProductHoverProps = useCallback((productId: string) => {
    return prefetchOnHover(
      `product-${productId}`,
      CacheKeys.product(productId),
      async () => {
        const { fetchSingleProductFromDatabase } = await import('./useProducts/productApi');
        return fetchSingleProductFromDatabase(productId);
      }
    );
  }, [prefetchOnHover]);

  return {
    prefetchProduct,
    prefetchCategory,
    getProductHoverProps
  };
};

// Hook para prefetch de seções dinâmicas
export const useSectionPrefetch = () => {
  const { addToPrefetchQueue } = useAdvancedPrefetch();

  const prefetchSection = useCallback((sectionId: string) => {
    const queryKey = CacheKeys.section(sectionId);
    const queryFn = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('special_sections')
        .select('*')
        .eq('id', sectionId)
        .single();
      return data;
    };

    addToPrefetchQueue(
      `section-${sectionId}`,
      queryKey,
      queryFn,
      {
        delay: 300,
        priority: 'medium'
      }
    );
  }, [addToPrefetchQueue]);

  const prefetchLayout = useCallback(() => {
    const queryKey = CacheKeys.layout();
    const queryFn = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('homepage_layout')
        .select('*')
        .order('display_order');
      return data;
    };

    addToPrefetchQueue(
      'homepage-layout',
      queryKey,
      queryFn,
      {
        delay: 100,
        priority: 'high'
      }
    );
  }, [addToPrefetchQueue]);

  return {
    prefetchSection,
    prefetchLayout
  };
};

// Hook para lazy loading de componentes
export const useLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const module = await importFn();
      setComponent(() => module.default);
    } catch (err) {
      setError(err as Error);
      console.error('Erro ao carregar componente lazy:', err);
    } finally {
      setLoading(false);
    }
  }, [Component, loading, importFn]);

  return {
    Component,
    loading,
    error,
    loadComponent,
    Fallback: fallback
  };
};

