// ⚠️ DISABLED: This file is disabled to ensure ALL products are visible in admin
// The optimizations in this file were preventing all products from being displayed
// Use the standard useProducts hook instead for full product visibility
import { useCallback, useMemo } from 'react';
import { useOptimizedCache, useCacheWithFallback, CacheKeys } from './useOptimizedCache';
import { fetchProductsFromDatabase, fetchSingleProductFromDatabase } from './useProducts/productApi';
import { Product } from './useProducts/types';
import { CarouselConfig } from '@/types/specialSections';

// Hook otimizado para todos os produtos
export const useOptimizedProducts = (includeAdmin: boolean = false) => {
  const queryKey = useMemo(() => 
    CacheKeys.products({ includeAdmin }), 
    [includeAdmin]
  );
  
  const queryFn = useCallback(() => 
    fetchProductsFromDatabase(includeAdmin), 
    [includeAdmin]
  );
  
  return useCacheWithFallback(
    queryKey,
    queryFn,
    [] as Product[], // fallback vazio
    'products'
  );
};

// Hook otimizado para produto único
export const useOptimizedProduct = (productId: string) => {
  const queryKey = useMemo(() => 
    CacheKeys.product(productId), 
    [productId]
  );
  
  const queryFn = useCallback(() => 
    fetchSingleProductFromDatabase(productId), 
    [productId]
  );
  
  return useOptimizedCache(
    queryKey,
    queryFn,
    'products',
    {
      enabled: !!productId,
      staleTime: 10 * 60 * 1000, // 10 minutos para produto individual
    }
  );
};

// Hook otimizado para produtos por categoria
export const useOptimizedProductsByCategory = (category: string) => {
  const { data: allProducts, isLoading, error } = useOptimizedProducts();
  
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(product => 
      product.category?.toLowerCase() === category.toLowerCase()
    );
  }, [allProducts, category]);
  
  return {
    data: filteredProducts,
    isLoading,
    error,
    isEmpty: filteredProducts.length === 0 && !isLoading
  };
};

// Hook otimizado para produtos em destaque
export const useOptimizedFeaturedProducts = (limit: number = 10) => {
  const { data: allProducts, isLoading, error } = useOptimizedProducts();
  
  const featuredProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts
      .filter(product => product.is_featured)
      .slice(0, limit);
  }, [allProducts, limit]);
  
  return {
    data: featuredProducts,
    isLoading,
    error,
    isEmpty: featuredProducts.length === 0 && !isLoading
  };
};

// Hook otimizado para busca de produtos
export const useOptimizedProductSearch = (
  searchTerm: string,
  filters?: Record<string, any>
) => {
  const { data: allProducts, isLoading, error } = useOptimizedProducts();
  
  const searchResults = useMemo(() => {
    if (!allProducts || !searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    let results = allProducts.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.brand?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term)
    );
    
    // Aplicar filtros adicionais se fornecidos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          results = results.filter(product => {
            const productValue = (product as any)[key];
            if (Array.isArray(value)) {
              return value.includes(productValue);
            }
            return productValue === value;
          });
        }
      });
    }
    
    return results;
  }, [allProducts, searchTerm, filters]);
  
  return {
    data: searchResults,
    isLoading,
    error,
    isEmpty: searchResults.length === 0 && !isLoading,
    hasSearchTerm: searchTerm.trim().length > 0
  };
};

// Hook otimizado para produtos relacionados
export const useOptimizedRelatedProducts = (
  currentProductId: string,
  category?: string,
  limit: number = 5
) => {
  const { data: allProducts, isLoading, error } = useOptimizedProducts();
  
  const relatedProducts = useMemo(() => {
    if (!allProducts || !currentProductId) return [];
    
    return allProducts
      .filter(product => 
        product.id !== currentProductId && // Excluir produto atual
        (!category || product.category === category) // Mesma categoria se especificada
      )
      .slice(0, limit);
  }, [allProducts, currentProductId, category, limit]);
  
  return {
    data: relatedProducts,
    isLoading,
    error,
    isEmpty: relatedProducts.length === 0 && !isLoading
  };
};

// Hook otimizado para produtos por configuração de carrossel
export const useOptimizedProductsByConfig = (config: CarouselConfig) => {
  const queryKey = useMemo(() => 
    CacheKeys.products({ config: JSON.stringify(config) }), 
    [config]
  );
  
  const queryFn = useCallback(async () => {
    // Aqui você pode implementar lógica específica baseada na config
    // Por enquanto, vamos usar a função existente
    const { fetchProductsByCriteria } = await import('./useProducts/productApi');
    return fetchProductsByCriteria(config);
  }, [config]);
  
  return useOptimizedCache(
    queryKey,
    queryFn,
    'products',
    {
      enabled: !!config,
      staleTime: 3 * 60 * 1000, // 3 minutos para configurações específicas
    }
  );
};

// Hook para prefetch inteligente de produtos
export const useProductPrefetch = () => {
  const { prefetchData } = useCacheInvalidation();
  
  const prefetchProduct = useCallback(async (productId: string) => {
    await prefetchData(
      CacheKeys.product(productId),
      () => fetchSingleProductFromDatabase(productId),
      'products'
    );
  }, [prefetchData]);
  
  const prefetchCategory = useCallback(async (category: string) => {
    await prefetchData(
      CacheKeys.products({ category }),
      () => fetchProductsFromDatabase().then(products => 
        products.filter(p => p.category === category)
      ),
      'products'
    );
  }, [prefetchData]);
  
  const prefetchFeatured = useCallback(async () => {
    await prefetchData(
      CacheKeys.products({ featured: true }),
      () => fetchProductsFromDatabase().then(products => 
        products.filter(p => p.is_featured)
      ),
      'products'
    );
  }, [prefetchData]);
  
  return {
    prefetchProduct,
    prefetchCategory,
    prefetchFeatured
  };
};

// Importar hook de invalidação
import { useCacheInvalidation } from './useOptimizedCache';

