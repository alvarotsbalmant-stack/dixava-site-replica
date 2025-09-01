import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fetchSingleProductFromDatabase } from './useProducts/productApi';
import useInheritanceManager from './useInheritanceManager';
import { Product, SKUNavigation, ProductSKU, MasterProduct } from './useProducts/types';
import { useSKUNavigationStore } from '@/stores/skuNavigationStore';
import { useProductPrefetch } from './useProductPrefetch';

// Optimized cache for product details
const productDetailCache = new Map<string, {
  product: Product;
  skuNavigation: SKUNavigation;
  timestamp: number;
}>();

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useOptimizedProductDetail = (productId: string | undefined) => {
  const [error, setError] = useState<string | null>(null);
  const { inheritFromMaster } = useInheritanceManager;
  const { prefetchProducts } = useProductPrefetch();
  
  // Global state for SKU navigation
  const {
    getSKUNavigation,
    setSKUNavigation,
    setCurrentProduct,
    isOptimisticUpdate,
    setOptimisticUpdate
  } = useSKUNavigationStore();

  // Memoized cache check
  const getCachedData = useCallback((id: string) => {
    const cached = productDetailCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    return null;
  }, []);

  // Main product query with React Query
  const productQuery = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');

      // Check cache first
      const cached = getCachedData(productId);
      if (cached) {
        console.log(`🚀 Using cached data for product ${productId}`);
        return cached;
      }

      console.log(`📡 Fetching product details for ${productId}`);
      
      // Fetch product
      const productData = await fetchSingleProductFromDatabase(productId);
      if (!productData) {
        throw new Error('Produto não encontrado');
      }

      // Apply inheritance if needed
      const inheritedProduct = await inheritFromMaster(productData);

      // Build SKU navigation
      const skuNavigation = await buildSKUNavigation(inheritedProduct);

      const result = {
        product: inheritedProduct,
        skuNavigation,
        timestamp: Date.now()
      };

      // Cache the result
      productDetailCache.set(productId, result);
      
      // Store in global state
      setSKUNavigation(productId, skuNavigation);

      // Prefetch related SKUs in background
      prefetchRelatedSKUs(skuNavigation);

      return result;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: 2,
    retryDelay: 1000
  });

  // Optimistic navigation helper
  const getOptimisticData = useCallback((targetProductId: string) => {
    // Try to get from global state first
    const cachedSKUNav = getSKUNavigation(targetProductId);
    if (cachedSKUNav) {
      const targetSKU = cachedSKUNav.availableSKUs.find(sku => sku.id === targetProductId);
      if (targetSKU) {
        return {
          product: targetSKU,
          skuNavigation: {
            ...cachedSKUNav,
            currentSKU: targetSKU
          }
        };
      }
    }

    // Try local cache
    const cached = getCachedData(targetProductId);
    if (cached) {
      return {
        product: cached.product,
        skuNavigation: cached.skuNavigation
      };
    }

    return null;
  }, [getSKUNavigation, getCachedData]);

  // Build SKU navigation
  const buildSKUNavigation = async (currentProduct: Product): Promise<SKUNavigation> => {
    try {
      let masterProductId = currentProduct.parent_product_id || currentProduct.id;
      
      // If this is already the master, use it directly
      let masterProduct = currentProduct;
      if (currentProduct.parent_product_id) {
        masterProduct = await fetchSingleProductFromDatabase(masterProductId);
        if (!masterProduct) {
          console.warn('Master product not found, using current product');
          masterProduct = currentProduct;
          masterProductId = currentProduct.id;
        }
      }

      // Fetch all SKUs for this master product
      const { data: allSKUsRaw } = await import('@/integrations/supabase/client').then(m => 
        m.supabase
          .from('view_product_with_tags')
          .select('*')
          .or(`id.eq.${masterProductId},parent_product_id.eq.${masterProductId}`)
      );

      if (!allSKUsRaw) {
        throw new Error('Failed to fetch SKU data');
      }

      // Apply inheritance to all SKUs
      const allSKUs = await Promise.all(
        allSKUsRaw.map(sku => inheritFromMaster(sku as any))
      );

      // Group by platform
      const platformGroups = new Map<string, ProductSKU[]>();
      allSKUs.forEach(sku => {
        const platform = sku.variant_attributes?.platform || 'unknown';
        if (!platformGroups.has(platform)) {
          platformGroups.set(platform, []);
        }
        platformGroups.get(platform)!.push(sku as ProductSKU);
      });

      // Build platforms array
      const platforms = Array.from(platformGroups.entries()).map(([platform, skus]) => ({
        platform,
        sku: skus[0] || null, // Take first SKU for platform representation
        available: skus.some(sku => sku.is_active !== false)
      }));

      return {
        masterProduct: masterProduct as MasterProduct,
        currentSKU: currentProduct as ProductSKU,
        availableSKUs: allSKUs as ProductSKU[],
        platforms
      };

    } catch (error) {
      console.error('Error building SKU navigation:', error);
      // Fallback navigation
      return {
        masterProduct: currentProduct as MasterProduct,
        currentSKU: currentProduct as ProductSKU,
        availableSKUs: [currentProduct as ProductSKU],
        platforms: [{
          platform: currentProduct.variant_attributes?.platform || 'unknown',
          sku: currentProduct as ProductSKU,
          available: currentProduct.is_active !== false
        }]
      };
    }
  };

  // Prefetch related SKUs
  const prefetchRelatedSKUs = useCallback(async (skuNavigation: SKUNavigation) => {
    const skuIds = skuNavigation.availableSKUs
      .map(sku => sku.id)
      .filter(id => id !== productId);

    if (skuIds.length > 0) {
      console.log(`🚀 Prefetching ${skuIds.length} related SKUs`);
      prefetchProducts(skuIds);
    }
  }, [productId, prefetchProducts]);

  // Update current product in store
  useEffect(() => {
    if (productId) {
      setCurrentProduct(productId);
    }
  }, [productId, setCurrentProduct]);

  // Handle errors
  useEffect(() => {
    if (productQuery.error) {
      const errorMessage = productQuery.error.message || 'Erro ao carregar produto';
      setError(errorMessage);
      toast.error(errorMessage);
    } else {
      setError(null);
    }
  }, [productQuery.error]);

  // Memoized return value
  return useMemo(() => {
    console.log('[useOptimizedProductDetail] Return values:', {
      hasProduct: !!productQuery.data?.product,
      hasSkuNavigation: !!productQuery.data?.skuNavigation,
      platformsCount: productQuery.data?.skuNavigation?.platforms?.length,
      loading: productQuery.isLoading,
      error,
      isOptimistic: isOptimisticUpdate
    });

    return {
      product: productQuery.data?.product || null,
      skuNavigation: productQuery.data?.skuNavigation || null,
      loading: productQuery.isLoading,
      error,
      isOptimistic: isOptimisticUpdate,
      
      // Optimistic navigation helper
      getOptimisticData,
      
      // Cache utilities
      invalidateCache: () => {
        productQuery.refetch();
        if (productId) {
          productDetailCache.delete(productId);
        }
      },
      
      // Prefetch utilities
      prefetchSKU: (skuId: string) => {
        prefetchProducts([skuId]);
      }
    };
  }, [
    productQuery.data,
    productQuery.isLoading,
    error,
    isOptimisticUpdate,
    getOptimisticData,
    productQuery.refetch,
    productId,
    prefetchProducts
  ]);
};