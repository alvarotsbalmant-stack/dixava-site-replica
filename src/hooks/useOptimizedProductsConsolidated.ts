// ⚠️ DISABLED: This file is disabled to ensure ALL products are visible in admin
// The pagination and virtualization here was limiting product display to 50 items
// Use the standard useProducts hook instead for full product visibility
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchProductsFromDatabaseCached, fetchProductDetails } from './useProducts/productApiOptimized';
import { Product } from './useProducts/types';
import { useProductPerformance } from './useProductPerformance';
import { CacheKeys } from './useOptimizedCache';

interface ProductFilters {
  search?: string;
  category?: string;
  featured?: boolean;
  priceRange?: [number, number];
  tags?: string[];
}

interface UseOptimizedProductsOptions {
  enableVirtualization?: boolean;
  pageSize?: number;
  staleTime?: number;
  prefetchNext?: boolean;
}

interface ProductsResult {
  data: Product[];
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  totalCount: number;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  prefetchProduct: (id: string) => void;
}

// Consolidated hook that replaces multiple product hooks
export const useOptimizedProductsConsolidated = (
  filters: ProductFilters = {},
  options: UseOptimizedProductsOptions = {}
): ProductsResult => {
  const {
    enableVirtualization = true,
    pageSize = 50,
    staleTime = 5 * 60 * 1000, // 5 minutes
    prefetchNext = true
  } = options;

  const [currentPage, setCurrentPage] = useState(0);
  const [allLoadedProducts, setAllLoadedProducts] = useState<Product[]>([]);
  const performance = useProductPerformance();
  const queryClient = useQueryClient();
  const loadingRef = useRef(false);

  // Generate unique query key based on filters
  const queryKey = useMemo(() => 
    CacheKeys.products({ 
      page: currentPage,
      pageSize,
      ...filters 
    }), 
    [currentPage, pageSize, filters]
  );

  // Main products query with performance monitoring
  const {
    data: rawProducts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const startTime = Date.now();
      
      try {
        console.log('[ProductsConsolidated] Fetching products with filters:', filters);
        
        // Use cached API for better performance
        const products = await fetchProductsFromDatabaseCached();
        
        performance.logQuery('ProductsConsolidated', startTime, products.length);
        
        return products;
      } catch (err) {
        console.error('[ProductsConsolidated] Query error:', err);
        throw err;
      }
    },
    staleTime,
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Apply filters client-side for better performance
  const filteredProducts = useMemo(() => {
    const renderStart = Date.now();
    
    if (!rawProducts) return [];

    let filtered = rawProducts;

    // Apply search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm) ||
        product.brand?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    // Apply featured filter
    if (filters.featured !== undefined) {
      filtered = filtered.filter(product => 
        Boolean(product.is_featured) === filters.featured
      );
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        return price >= min && price <= max;
      });
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(product =>
        product.tags?.some(tag => 
          filters.tags!.includes(tag.id) || filters.tags!.includes(tag.name)
        )
      );
    }

    performance.logRender('ProductsFilter', renderStart);
    
    console.log('[ProductsConsolidated] Filtered products:', {
      total: rawProducts.length,
      filtered: filtered.length,
      filters
    });

    return filtered;
  }, [rawProducts, filters, performance]);

  // Virtualization logic
  const paginatedProducts = useMemo(() => {
    if (!enableVirtualization) return filteredProducts;
    
    const endIndex = (currentPage + 1) * pageSize;
    return filteredProducts.slice(0, endIndex);
  }, [filteredProducts, currentPage, pageSize, enableVirtualization]);

  // Update all loaded products when new data comes in
  useEffect(() => {
    if (paginatedProducts.length > 0) {
      setAllLoadedProducts(paginatedProducts);
    }
  }, [paginatedProducts]);

  // Load more products (for infinite scroll)
  const loadMore = useCallback(() => {
    if (loadingRef.current || !enableVirtualization) return;
    
    const hasMore = (currentPage + 1) * pageSize < filteredProducts.length;
    if (hasMore) {
      loadingRef.current = true;
      setCurrentPage(prev => prev + 1);
      
      // Prefetch next page if enabled
      if (prefetchNext) {
        setTimeout(() => {
          loadingRef.current = false;
        }, 100);
      }
    }
  }, [currentPage, pageSize, filteredProducts.length, enableVirtualization, prefetchNext]);

  // Prefetch individual product details
  const prefetchProduct = useCallback(async (productId: string) => {
    const queryKey = CacheKeys.product(productId);
    
    // Only prefetch if not already in cache
    const existingData = queryClient.getQueryData(queryKey);
    if (existingData) return;

    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => fetchProductDetails(productId),
        staleTime: 10 * 60 * 1000, // 10 minutes for individual products
      });
    } catch (error) {
      console.warn('[ProductsConsolidated] Prefetch failed for product:', productId, error);
    }
  }, [queryClient]);

  // Refresh function
  const refresh = useCallback(() => {
    setCurrentPage(0);
    setAllLoadedProducts([]);
    refetch();
  }, [refetch]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(0);
    setAllLoadedProducts([]);
  }, [filters]);

  const hasMore = enableVirtualization ? 
    (currentPage + 1) * pageSize < filteredProducts.length : 
    false;

  return {
    data: allLoadedProducts,
    isLoading,
    error: error as Error | null,
    isEmpty: allLoadedProducts.length === 0 && !isLoading,
    totalCount: filteredProducts.length,
    hasMore,
    loadMore,
    refresh,
    prefetchProduct
  };
};