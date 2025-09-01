import { useCallback, useEffect, useRef } from 'react';
import { useProductPrefetch } from './useProductPrefetch';
import { SKUNavigation } from './useProducts/types';
import { useSKUNavigationStore } from '@/stores/skuNavigationStore';

interface PrefetchOptions {
  prefetchOnHover?: boolean;
  prefetchDelay?: number;
  prefetchSiblings?: boolean;
  maxConcurrentPrefetches?: number;
}

export const useIntelligentSKUPrefetch = (options: PrefetchOptions = {}) => {
  const {
    prefetchOnHover = true,
    prefetchDelay = 200,
    prefetchSiblings = true,
    maxConcurrentPrefetches = 3
  } = options;

  const { prefetchProduct, prefetchProducts, cancelPrefetch } = useProductPrefetch();
  const { getSKUNavigation } = useSKUNavigationStore();
  
  const prefetchQueue = useRef<Set<string>>(new Set());
  const activePrefetches = useRef<Set<string>>(new Set());
  const hoverTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Prefetch SKU with intelligent batching
  const prefetchSKUIntelligent = useCallback(async (productId: string) => {
    // Skip if already prefetched or in progress
    if (activePrefetches.current.has(productId)) {
      return;
    }

    // Check concurrent prefetch limit
    if (activePrefetches.current.size >= maxConcurrentPrefetches) {
      prefetchQueue.current.add(productId);
      return;
    }

    activePrefetches.current.add(productId);
    
    try {
      await prefetchProduct(productId);
      console.log(`✅ SKU ${productId} prefetched`);
      
        // Prefetch siblings if enabled
        if (prefetchSiblings) {
          const skuNavigation = getSKUNavigation(productId);
          if (skuNavigation) {
            const siblingIds = skuNavigation.availableSKUs
              .map(sku => sku.id)
              .filter(id => id !== productId && !activePrefetches.current.has(id))
              .slice(0, 2); // Limit siblings
            
            if (siblingIds.length > 0) {
              console.log(`🔗 Prefetching ${siblingIds.length} siblings for ${productId}`);
              prefetchProducts(siblingIds);
            }
          }
        }
    } catch (error) {
      console.warn(`❌ Failed to prefetch SKU ${productId}:`, error);
    } finally {
      activePrefetches.current.delete(productId);
      
      // Process queue
      if (prefetchQueue.current.size > 0) {
        const nextProductId = prefetchQueue.current.values().next().value;
        prefetchQueue.current.delete(nextProductId);
        prefetchSKUIntelligent(nextProductId);
      }
    }
  }, [prefetchProduct, prefetchProducts, getSKUNavigation, prefetchSiblings, maxConcurrentPrefetches]);

  // Hover-based prefetching
  const handlePlatformHover = useCallback((sku: any) => {
    if (!prefetchOnHover || !sku) return;

    const productId = sku.id;
    
    // Clear existing timeout
    const existingTimeout = hoverTimeouts.current.get(productId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      prefetchSKUIntelligent(productId);
      hoverTimeouts.current.delete(productId);
    }, prefetchDelay);

    hoverTimeouts.current.set(productId, timeout);

    // Return cleanup function
    return () => {
      clearTimeout(timeout);
      hoverTimeouts.current.delete(productId);
      cancelPrefetch(productId);
    };
  }, [prefetchOnHover, prefetchDelay, prefetchSKUIntelligent, cancelPrefetch]);

  // Cancel hover prefetch
  const cancelPlatformHover = useCallback((sku: any) => {
    if (!sku) return;

    const productId = sku.id;
    const timeout = hoverTimeouts.current.get(productId);
    
    if (timeout) {
      clearTimeout(timeout);
      hoverTimeouts.current.delete(productId);
    }
    
    cancelPrefetch(productId);
  }, [cancelPrefetch]);

  // Prefetch all platforms for a SKU navigation
  const prefetchAllPlatforms = useCallback((skuNavigation: SKUNavigation) => {
    const platformSKUs = skuNavigation.platforms
      .filter(p => p.available && p.sku)
      .map(p => p.sku.id);

    if (platformSKUs.length > 0) {
      console.log(`🚀 Prefetching all ${platformSKUs.length} platforms`);
      prefetchProducts(platformSKUs);
    }
  }, [prefetchProducts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all timeouts
      hoverTimeouts.current.forEach(timeout => clearTimeout(timeout));
      hoverTimeouts.current.clear();
      
      // Clear queue and active prefetches
      prefetchQueue.current.clear();
      activePrefetches.current.clear();
    };
  }, []);

  return {
    prefetchSKUIntelligent,
    handlePlatformHover,
    cancelPlatformHover,
    prefetchAllPlatforms,
    
    // Stats
    getStats: () => ({
      queueSize: prefetchQueue.current.size,
      activePrefetches: activePrefetches.current.size,
      pendingHovers: hoverTimeouts.current.size
    })
  };
};