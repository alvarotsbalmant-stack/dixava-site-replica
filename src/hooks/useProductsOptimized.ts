import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { productCache, CachedProduct } from '@/utils/ProductCacheManager';
import { 
  fetchProductsFromDatabase, 
  fetchSingleProductFromDatabase,
  fetchProductsByCriteria
} from './useProducts/productApi';
import { handleProductError } from './useProducts/productErrorHandler';
import { CarouselConfig } from '@/types/specialSections';

// ✅ NOVO: Usar ProductCacheManager unificado em vez de cache local

export const useProductsOptimized = () => {
  const [products, setProducts] = useState<CachedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // ✅ REMOVIDO: Cache local - agora usa ProductCacheManager unificado

  // ✅ NOVO: Função simplificada usando ProductCacheManager
  const fetchProductsWithCache = useCallback(async (cacheKey: string = 'all') => {
    try {
      setLoading(true);
      
      console.log('[useProductsOptimized] 🔍 Buscando produtos via cache unificado');
      
      // Buscar todos os produtos da API (cache será gerenciado internamente)
      const productsData = await fetchProductsFromDatabase();
      
      // Converter para CachedProduct
      const cachedProducts: CachedProduct[] = productsData.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        pro_price: p.pro_price,
        list_price: p.list_price,
        uti_pro_enabled: p.uti_pro_enabled,
        uti_pro_value: p.uti_pro_value,
        uti_pro_custom_price: p.uti_pro_custom_price,
        image: p.image,
        badge_text: p.badge_text,
        badge_color: p.badge_color,
        badge_visible: p.badge_visible,
        platform: p.platform,
        category: p.category,
        tags: p.tags,
        is_active: p.is_active,
        is_featured: p.is_featured,
        stock: p.stock,
        cached_at: Date.now(),
        ttl: 5 * 60 * 1000
      }));
      
      setProducts(cachedProducts);
      console.log(`[useProductsOptimized] ✅ ${cachedProducts.length} produtos carregados`);
      
      return cachedProducts;
    } catch (error: any) {
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

  // ✅ NOVO: Prefetch simplificado usando ProductCacheManager
  const prefetchProduct = useCallback(async (productId: string) => {
    console.log(`[useProductsOptimized] 🚀 Prefetch produto ${productId}`);
    await productCache.getProduct(productId);
  }, []);

  // ✅ NOVO: Busca individual simplificada usando ProductCacheManager
  const fetchSingleProduct = useCallback(async (productId: string) => {
    console.log(`[useProductsOptimized] 🔍 Buscando produto individual ${productId}`);
    return await productCache.getProduct(productId);
  }, []);

  // ✅ NOVO: Prefetch de relacionados usando ProductCacheManager
  const prefetchRelatedProducts = useCallback(async (productIds: string[]) => {
    console.log(`[useProductsOptimized] 🚀 Prefetch de ${productIds.length} produtos relacionados`);
    await productCache.preloadProducts(productIds);
  }, []);

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

  // ✅ NOVO: Limpar cache usando ProductCacheManager
  const clearCache = useCallback(() => {
    console.log('[useProductsOptimized] 🗑️ Limpando cache unificado');
    productCache.clearCache();
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
    // ✅ NOVO: Estatísticas do cache unificado
    getCacheStats: () => productCache.getStats()
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

