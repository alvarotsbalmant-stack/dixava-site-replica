import { useCallback, useRef } from 'react';
import { fetchSingleProductFromDatabase } from './useProducts/productApi';

// Cache global para produtos prefetchados
const productPrefetchCache = new Map<string, {
  data: any;
  timestamp: number;
  promise?: Promise<any>;
}>();

const PREFETCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useProductPrefetch = () => {
  const prefetchTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Função para verificar se o cache é válido
  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < PREFETCH_CACHE_DURATION;
  }, []);

  // Função para prefetch de produto
  const prefetchProduct = useCallback(async (productId: string) => {
    // Verificar se já está no cache válido
    const cached = productPrefetchCache.get(productId);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    // Verificar se já está sendo carregado
    if (cached?.promise) {
      return cached.promise;
    }

    try {
      // Criar promise de carregamento
      const promise = fetchSingleProductFromDatabase(productId);
      
      // Salvar promise no cache para evitar múltiplas requisições
      productPrefetchCache.set(productId, {
        data: null,
        timestamp: Date.now(),
        promise
      });

      const productData = await promise;

      // Salvar dados no cache
      productPrefetchCache.set(productId, {
        data: productData,
        timestamp: Date.now()
      });

      console.log(`✅ Produto ${productId} prefetchado com sucesso`);
      return productData;
    } catch (error) {
      console.warn(`❌ Erro no prefetch do produto ${productId}:`, error);
      // Remover do cache em caso de erro
      productPrefetchCache.delete(productId);
      throw error;
    }
  }, [isCacheValid]);

  // Função para prefetch com delay (para hover)
  const prefetchProductWithDelay = useCallback((productId: string, delay: number = 300) => {
    // Limpar timeout anterior se existir
    const existingTimeout = prefetchTimeouts.current.get(productId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Criar novo timeout
    const timeout = setTimeout(() => {
      prefetchProduct(productId);
      prefetchTimeouts.current.delete(productId);
    }, delay);

    prefetchTimeouts.current.set(productId, timeout);

    // Retornar função de cleanup
    return () => {
      clearTimeout(timeout);
      prefetchTimeouts.current.delete(productId);
    };
  }, [prefetchProduct]);

  // Função para cancelar prefetch
  const cancelPrefetch = useCallback((productId: string) => {
    const timeout = prefetchTimeouts.current.get(productId);
    if (timeout) {
      clearTimeout(timeout);
      prefetchTimeouts.current.delete(productId);
    }
  }, []);

  // Função para obter produto do cache
  const getCachedProduct = useCallback((productId: string) => {
    const cached = productPrefetchCache.get(productId);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }, [isCacheValid]);

  // Função para prefetch de múltiplos produtos
  const prefetchProducts = useCallback(async (productIds: string[]) => {
    const promises = productIds.map(id => prefetchProduct(id));
    try {
      await Promise.allSettled(promises);
      console.log(`✅ Prefetch de ${productIds.length} produtos concluído`);
    } catch (error) {
      console.warn('❌ Erro no prefetch de múltiplos produtos:', error);
    }
  }, [prefetchProduct]);

  // Função para limpar cache
  const clearPrefetchCache = useCallback(() => {
    productPrefetchCache.clear();
    // Limpar todos os timeouts
    prefetchTimeouts.current.forEach(timeout => clearTimeout(timeout));
    prefetchTimeouts.current.clear();
    console.log('🧹 Cache de prefetch limpo');
  }, []);

  // Função para obter estatísticas do cache
  const getCacheStats = useCallback(() => {
    const totalCached = productPrefetchCache.size;
    const validCached = Array.from(productPrefetchCache.values())
      .filter(item => isCacheValid(item.timestamp)).length;
    
    return {
      total: totalCached,
      valid: validCached,
      expired: totalCached - validCached,
      pendingPrefetches: prefetchTimeouts.current.size
    };
  }, [isCacheValid]);

  return {
    prefetchProduct,
    prefetchProductWithDelay,
    cancelPrefetch,
    getCachedProduct,
    prefetchProducts,
    clearPrefetchCache,
    getCacheStats
  };
};

// Hook para usar em componentes de produto
export const useProductHover = (productId: string) => {
  const { prefetchProductWithDelay, cancelPrefetch } = useProductPrefetch();

  const handleMouseEnter = useCallback(() => {
    return prefetchProductWithDelay(productId, 200); // 200ms delay
  }, [productId, prefetchProductWithDelay]);

  const handleMouseLeave = useCallback(() => {
    cancelPrefetch(productId);
  }, [productId, cancelPrefetch]);

  return {
    handleMouseEnter,
    handleMouseLeave
  };
};

