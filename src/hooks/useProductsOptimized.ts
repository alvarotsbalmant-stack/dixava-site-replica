import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product } from './useProducts/types';
import { 
  fetchProductsFromDatabase, 
  fetchSingleProductFromDatabase,
  fetchProductsByCriteria
} from './useProducts/productApi';
import { handleProductError } from './useProducts/productErrorHandler';
import { CarouselConfig } from '@/types/specialSections';

// Cache global para produtos
const productCache = new Map<string, { data: Product[], timestamp: number }>();
const singleProductCache = new Map<string, { data: Product, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Prefetch queue para produtos
const prefetchQueue = new Set<string>();
const prefetchPromises = new Map<string, Promise<any>>();

export const useProductsOptimized = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Função para verificar se cache é válido
  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  // Função para buscar produtos com cache
  const fetchProductsWithCache = useCallback(async (cacheKey: string = 'all') => {
    // Verificar cache primeiro
    const cached = productCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      setProducts(cached.data);
      setLoading(false);
      return cached.data;
    }

    try {
      setLoading(true);
      
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const productsData = await fetchProductsFromDatabase();
      
      // Salvar no cache
      productCache.set(cacheKey, {
        data: productsData,
        timestamp: Date.now()
      });
      
      setProducts(productsData);
      return productsData;
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      const errorMessage = handleProductError(error, 'ao carregar produtos');
      
      if (errorMessage) {
        toast({
          title: "Erro ao carregar produtos",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Função para prefetch de produto individual
  const prefetchProduct = useCallback(async (productId: string) => {
    if (prefetchQueue.has(productId) || singleProductCache.has(productId)) {
      return;
    }

    prefetchQueue.add(productId);

    try {
      // Evitar múltiplas requisições para o mesmo produto
      if (prefetchPromises.has(productId)) {
        return prefetchPromises.get(productId);
      }

      const promise = fetchSingleProductFromDatabase(productId);
      prefetchPromises.set(productId, promise);

      const product = await promise;
      
      // Salvar no cache
      singleProductCache.set(productId, {
        data: product,
        timestamp: Date.now()
      });

      prefetchPromises.delete(productId);
    } catch (error) {
      console.warn('Prefetch failed for product:', productId, error);
      prefetchPromises.delete(productId);
    } finally {
      prefetchQueue.delete(productId);
    }
  }, []);

  // Função para buscar produto individual com cache
  const fetchSingleProduct = useCallback(async (productId: string) => {
    // Verificar cache primeiro
    const cached = singleProductCache.get(productId);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const product = await fetchSingleProductFromDatabase(productId);
      
      // Salvar no cache
      singleProductCache.set(productId, {
        data: product,
        timestamp: Date.now()
      });
      
      return product;
    } catch (error: any) {
      const errorMessage = handleProductError(error, 'ao carregar produto');
      
      if (errorMessage) {
        toast({
          title: "Erro ao carregar produto",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    }
  }, [toast]);

  // Função para prefetch de produtos relacionados
  const prefetchRelatedProducts = useCallback(async (productIds: string[]) => {
    const promises = productIds.map(id => prefetchProduct(id));
    await Promise.allSettled(promises);
  }, [prefetchProduct]);

  // Função para buscar produtos por critério com cache
  const fetchProductsByConfig = useCallback(async (config: CarouselConfig) => {
    if (!config) return [];

    const cacheKey = `config_${JSON.stringify(config)}`;
    
    // Verificar cache primeiro
    const cached = productCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const productsData = await fetchProductsByCriteria(config);
      
      // Salvar no cache
      productCache.set(cacheKey, {
        data: productsData,
        timestamp: Date.now()
      });
      
      return productsData;
    } catch (error: any) {
      const errorMessage = handleProductError(error, 'ao carregar produtos por critério');
      
      if (errorMessage) {
        toast({
          title: "Erro ao carregar produtos",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      return [];
    }
  }, [toast]);

  // Função para limpar cache
  const clearCache = useCallback(() => {
    productCache.clear();
    singleProductCache.clear();
    prefetchPromises.clear();
    prefetchQueue.clear();
  }, []);

  // Função para preload de recursos críticos
  const preloadCriticalResources = useCallback(() => {
    // Preload das primeiras imagens de produtos
    if (products.length > 0) {
      products.slice(0, 6).forEach(product => {
        if (product.image_url) {
          const img = new Image();
          img.src = product.image_url;
        }
      });
    }
  }, [products]);

  // Carregar produtos iniciais
  useEffect(() => {
    fetchProductsWithCache();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProductsWithCache]);

  // Preload de recursos críticos quando produtos carregam
  useEffect(() => {
    if (products.length > 0) {
      preloadCriticalResources();
    }
  }, [products, preloadCriticalResources]);

  return {
    products,
    loading,
    fetchProducts: fetchProductsWithCache,
    fetchSingleProduct,
    fetchProductsByConfig,
    prefetchProduct,
    prefetchRelatedProducts,
    clearCache,
    // Estatísticas do cache para debug
    getCacheStats: () => ({
      productCacheSize: productCache.size,
      singleProductCacheSize: singleProductCache.size,
      prefetchQueueSize: prefetchQueue.size
    })
  };
};

// Hook para prefetch baseado em hover
export const useProductPrefetch = () => {
  const { prefetchProduct } = useProductsOptimized();

  const handleProductHover = useCallback((productId: string) => {
    // Delay pequeno para evitar prefetch desnecessário
    const timeoutId = setTimeout(() => {
      prefetchProduct(productId);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [prefetchProduct]);

  return { handleProductHover };
};

