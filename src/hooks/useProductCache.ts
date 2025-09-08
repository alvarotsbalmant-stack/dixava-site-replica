/**
 * useProductCache - Hook Unificado para Cache de Produtos
 * 
 * Hook que substitui useProducts() e outras chamadas diretas à API.
 * Implementa estratégia cache-first com fallback para API.
 * Usado por todos os componentes que precisam de dados de produtos.
 */

import { useState, useEffect, useCallback } from 'react';
import { productCache, CachedProduct } from '@/utils/ProductCacheManager';

// Interface para resultado do hook
interface UseProductCacheResult {
  product: CachedProduct | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  retry: () => void;
}

// Interface para resultado de múltiplos produtos
interface UseMultipleProductsResult {
  products: CachedProduct[];
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  refresh: () => void;
}

// Interface para produtos relacionados
interface UseRelatedProductsResult {
  relatedProducts: CachedProduct[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Hook para buscar produto individual
 * Substitui chamadas diretas à API para produto único
 */
export const useProductCache = (productId: string): UseProductCacheResult => {
  const [product, setProduct] = useState<CachedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`[useProductCache] 🔍 Buscando produto ${productId}`);
      
      const result = await productCache.getProduct(productId);
      
      if (result) {
        setProduct(result);
        setFromCache(true); // Sempre vem do cache (mesmo que tenha buscado da API)
        console.log(`[useProductCache] ✅ Produto ${productId} carregado`);
      } else {
        setError('Produto não encontrado');
        console.log(`[useProductCache] ❌ Produto ${productId} não encontrado`);
      }
    } catch (err: any) {
      console.error(`[useProductCache] ❌ Erro ao buscar produto ${productId}:`, err);
      setError(err.message || 'Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const retry = useCallback(() => {
    // Invalidar cache e tentar novamente
    if (productId) {
      productCache.invalidateProduct(productId);
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    fromCache,
    retry
  };
};

/**
 * Hook para buscar múltiplos produtos
 * Usado em listas, homepage, seções, etc.
 */
export const useMultipleProducts = (productIds: string[]): UseMultipleProductsResult => {
  const [products, setProducts] = useState<CachedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!productIds || productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`[useMultipleProducts] 🔍 Buscando ${productIds.length} produtos`);
      
      const results = await productCache.getMultipleProducts(productIds);
      
      setProducts(results);
      setFromCache(true);
      console.log(`[useMultipleProducts] ✅ ${results.length} produtos carregados`);
    } catch (err: any) {
      console.error(`[useMultipleProducts] ❌ Erro ao buscar produtos:`, err);
      setError(err.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [productIds]);

  const refresh = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fromCache,
    refresh
  };
};

/**
 * Hook especializado para produtos relacionados
 * SUBSTITUI o over-fetching atual que busca todos os produtos
 */
export const useRelatedProducts = (
  product: CachedProduct | null,
  limit: number = 8
): UseRelatedProductsResult => {
  const [relatedProducts, setRelatedProducts] = useState<CachedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelated = useCallback(async () => {
    if (!product) {
      setRelatedProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`[useRelatedProducts] 🔍 Buscando produtos relacionados para ${product.id}`);
      
      const tags = product.tags?.map(tag => tag.id) || [];
      const results = await productCache.getRelatedProducts(
        product.id,
        tags,
        product.platform,
        product.category,
        limit
      );
      
      setRelatedProducts(results);
      console.log(`[useRelatedProducts] ✅ ${results.length} produtos relacionados carregados`);
    } catch (err: any) {
      console.error(`[useRelatedProducts] ❌ Erro ao buscar produtos relacionados:`, err);
      setError(err.message || 'Erro ao carregar produtos relacionados');
    } finally {
      setLoading(false);
    }
  }, [product, limit]);

  const refresh = useCallback(() => {
    fetchRelated();
  }, [fetchRelated]);

  useEffect(() => {
    fetchRelated();
  }, [fetchRelated]);

  return {
    relatedProducts,
    loading,
    error,
    refresh
  };
};

/**
 * Hook para preload de produtos (otimização)
 * Usado para carregar produtos em background
 */
export const useProductPreload = () => {
  const preload = useCallback(async (productIds: string[]) => {
    if (productIds.length > 0) {
      console.log(`[useProductPreload] 🚀 Preload de ${productIds.length} produtos`);
      await productCache.preloadProducts(productIds);
    }
  }, []);

  return { preload };
};

/**
 * Hook para estatísticas do cache (debug)
 */
export const useCacheStats = () => {
  const [stats, setStats] = useState(productCache.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(productCache.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearCache = useCallback(() => {
    productCache.clearCache();
    setStats(productCache.getStats());
  }, []);

  return {
    stats,
    clearCache
  };
};

/**
 * Hook de compatibilidade - substitui useProducts() gradualmente
 * Mantém interface similar para facilitar migração
 */
export const useProductsOptimized = () => {
  const [products, setProducts] = useState<CachedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Por enquanto, retorna array vazio para forçar uso dos hooks especializados
    // Em produção, pode implementar busca paginada ou por categoria
    console.warn('[useProductsOptimized] ⚠️ Use hooks especializados: useProductCache, useRelatedProducts, etc.');
    setProducts([]);
    setLoading(false);
  }, []);

  return {
    products,
    loading,
    refreshProducts: () => {
      console.warn('[useProductsOptimized] ⚠️ Use refresh dos hooks especializados');
    }
  };
};

export default useProductCache;

