import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

// Tipos para configuração de cache
interface CacheConfig {
  staleTime: number;
  gcTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnMount: boolean;
  retry: number | boolean;
}

// Configurações de cache por tipo de dados
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Cache agressivo para dados estáticos
  products: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3
  },
  
  // Cache médio para layout dinâmico
  layout: {
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2
  },
  
  // Cache rápido para seções especiais
  sections: {
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2
  },
  
  // Cache mínimo para dados do usuário
  user: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1
  }
};

// Hook para cache otimizado
export const useOptimizedCache = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  type: keyof typeof CACHE_CONFIGS = 'products',
  customOptions?: Partial<UseQueryOptions<T>>
) => {
  const config = CACHE_CONFIGS[type];
  
  return useQuery({
    queryKey,
    queryFn,
    ...config,
    ...customOptions,
    // Configurações específicas para performance
    structuralSharing: true,
    placeholderData: (previousData) => previousData,
  });
};

// Hook para invalidação inteligente de cache
export const useCacheInvalidation = () => {
  const queryClient = useQueryClient();
  
  const invalidateProducts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    console.log('🔄 Cache de produtos invalidado');
  }, [queryClient]);
  
  const invalidateLayout = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['layout'] });
    queryClient.invalidateQueries({ queryKey: ['sections'] });
    console.log('🔄 Cache de layout invalidado');
  }, [queryClient]);
  
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
    console.log('🔄 Todo cache invalidado');
  }, [queryClient]);
  
  const prefetchData = useCallback(async (
    queryKey: string[],
    queryFn: () => Promise<any>,
    type: keyof typeof CACHE_CONFIGS = 'products'
  ) => {
    const config = CACHE_CONFIGS[type];
    
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: config.staleTime,
      gcTime: config.gcTime,
    });
    
    console.log(`⚡ Dados prefetch: ${queryKey.join('/')}`);
  }, [queryClient]);
  
  return {
    invalidateProducts,
    invalidateLayout,
    invalidateAll,
    prefetchData,
    queryClient
  };
};

// Hook para monitoramento de performance de cache
export const useCachePerformance = () => {
  const queryClient = useQueryClient();
  const metricsRef = useRef({
    hits: 0,
    misses: 0,
    totalQueries: 0
  });
  
  const trackCacheHit = useCallback((queryKey: string[]) => {
    const cached = queryClient.getQueryData(queryKey);
    if (cached) {
      metricsRef.current.hits++;
      console.log(`✅ Cache HIT: ${queryKey.join('/')}`);
    } else {
      metricsRef.current.misses++;
      console.log(`❌ Cache MISS: ${queryKey.join('/')}`);
    }
    metricsRef.current.totalQueries++;
  }, [queryClient]);
  
  const getCacheStats = useCallback(() => {
    const { hits, misses, totalQueries } = metricsRef.current;
    const hitRate = totalQueries > 0 ? (hits / totalQueries) * 100 : 0;
    
    return {
      hits,
      misses,
      totalQueries,
      hitRate: Math.round(hitRate * 100) / 100,
      cacheSize: queryClient.getQueryCache().getAll().length
    };
  }, [queryClient]);
  
  const logCacheStats = useCallback(() => {
    const stats = getCacheStats();
    console.log('📊 Cache Performance:', stats);
  }, [getCacheStats]);
  
  // Log stats periodicamente em desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(logCacheStats, 30000); // A cada 30s
      return () => clearInterval(interval);
    }
  }, [logCacheStats]);
  
  return {
    trackCacheHit,
    getCacheStats,
    logCacheStats
  };
};

// Hook para cache com fallback inteligente
export const useCacheWithFallback = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  fallbackData: T,
  type: keyof typeof CACHE_CONFIGS = 'products'
) => {
  const { trackCacheHit } = useCachePerformance();
  
  const query = useOptimizedCache(
    queryKey,
    queryFn,
    type,
    {
      meta: {
        onSuccess: () => trackCacheHit(queryKey),
        onError: (error: Error) => {
          console.warn(`⚠️ Query error for ${queryKey.join('/')}:`, error);
          trackCacheHit(queryKey);
        }
      }
    }
  );
  
  // Retornar fallback se dados não estão disponíveis
  const data = query.data ?? fallbackData;
  const isUsingFallback = !query.data && !query.isLoading;
  
  return {
    ...query,
    data,
    isUsingFallback
  };
};

// Hook para cache com refresh automático
export const useCacheWithAutoRefresh = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  refreshInterval: number = 5 * 60 * 1000, // 5 minutos
  type: keyof typeof CACHE_CONFIGS = 'products'
) => {
  return useOptimizedCache(
    queryKey,
    queryFn,
    type,
    {
      refetchInterval: refreshInterval,
      refetchIntervalInBackground: false,
    }
  );
};

// Utilitários para chaves de cache
export const CacheKeys = {
  products: (filters?: Record<string, any>) => 
    ['products', ...(filters ? [JSON.stringify(filters)] : [])],
  
  product: (id: string) => ['products', id],
  
  layout: () => ['layout', 'homepage'],
  
  sections: (type?: string) => 
    ['sections', ...(type ? [type] : [])],
  
  section: (id: string) => ['sections', id],
  
  user: (id?: string) => 
    ['user', ...(id ? [id] : [])],
    
  search: (query: string, filters?: Record<string, any>) =>
    ['search', query, ...(filters ? [JSON.stringify(filters)] : [])]
} as const;

