import { useCallback, useEffect } from 'react';
import { usePageStateCache } from './usePageStateCache';
import { usePageTransitionCache } from './usePageTransitionCache';
import { useSimpleScrollRestoration } from './useSimpleScrollRestoration';

export interface EnhancedScrollSystemOptions {
  enablePageStateCache?: boolean;
  enableTransitionCache?: boolean;
  enableScrollRestoration?: boolean;
  transitionCacheOptions?: {
    enableSnapshots?: boolean;
    snapshotDelay?: number;
    enableInstantTransitions?: boolean;
    preloadRoutes?: string[];
  };
  pageCacheOptions?: {
    enableAutoSave?: boolean;
    saveInterval?: number;
    restoreQueryCache?: boolean;
    enableFormDataCache?: boolean;
    enableFiltersCache?: boolean;
  };
}

/**
 * Enhanced scroll system that combines all caching mechanisms
 * Provides the ultimate performance optimization for page navigation
 */
export const useEnhancedScrollSystem = (options: EnhancedScrollSystemOptions = {}) => {
  const {
    enablePageStateCache = true,
    enableTransitionCache = true,
    enableScrollRestoration = true,
    transitionCacheOptions = {},
    pageCacheOptions = {},
  } = options;

  // Initialize core scroll restoration (always enabled as fallback)
  useSimpleScrollRestoration();

  // Initialize page state caching
  const pageStateCache = usePageStateCache(
    enablePageStateCache ? pageCacheOptions : { enableAutoSave: false }
  );

  // Initialize page transition caching
  const transitionCache = usePageTransitionCache(
    enableTransitionCache ? transitionCacheOptions : { enableSnapshots: false }
  );

  /**
   * Manual save with all systems
   */
  const saveCompleteState = useCallback((additionalData?: Record<string, any>) => {
    if (enablePageStateCache) {
      pageStateCache.saveCurrentState(additionalData);
    }
    if (enableTransitionCache) {
      transitionCache.createSnapshot();
    }
  }, [enablePageStateCache, enableTransitionCache, pageStateCache, transitionCache]);

  /**
   * Enhanced restore that tries transition cache first, then page state
   */
  const restoreOptimalState = useCallback(async (path?: string): Promise<'instant' | 'cached' | 'standard'> => {
    // Try instant transition first (fastest)
    if (enableTransitionCache && transitionCache.hasInstantTransition(path)) {
      const restored = transitionCache.restoreSnapshot(path);
      if (restored) {
        return 'instant';
      }
    }

    // Try page state cache (fast)
    if (enablePageStateCache) {
      const restored = await pageStateCache.restorePageState(path);
      if (restored) {
        return 'cached';
      }
    }

    // Fall back to standard scroll restoration
    return 'standard';
  }, [enableTransitionCache, enablePageStateCache, transitionCache, pageStateCache]);

  /**
   * Get comprehensive cache status
   */
  const getCacheStatus = useCallback(() => {
    const status = {
      pageStateCache: enablePageStateCache ? {
        enabled: true,
        hasCachedState: pageStateCache.hasCachedState(),
      } : { enabled: false },
      transitionCache: enableTransitionCache ? {
        enabled: true,
        hasInstantTransition: transitionCache.hasInstantTransition(),
        stats: transitionCache.getTransitionStats(),
        isTransitioning: transitionCache.isTransitioning,
      } : { enabled: false },
      scrollRestoration: {
        enabled: enableScrollRestoration,
      },
    };

    return status;
  }, [
    enablePageStateCache,
    enableTransitionCache,
    enableScrollRestoration,
    pageStateCache,
    transitionCache,
  ]);

  /**
   * Clear all caches
   */
  const clearAllCaches = useCallback(() => {
    if (enablePageStateCache) {
      pageStateCache.clearCurrentState();
    }
    if (enableTransitionCache) {
      transitionCache.clearCurrentSnapshot();
    }
  }, [enablePageStateCache, enableTransitionCache, pageStateCache, transitionCache]);

  /**
   * Preload and cache a specific route
   */
  const preloadRoute = useCallback(async (path: string, options?: { prefetchData?: boolean }) => {
    console.log(`[EnhancedScrollSystem] 🔄 Preloading route: ${path}`);
    
    // This would involve:
    // 1. Prefetching route data
    // 2. Creating a transition snapshot if possible
    // 3. Caching query data
    
    if (options?.prefetchData && enablePageStateCache) {
      // Trigger data prefetching logic here
      console.log(`[EnhancedScrollSystem] 📊 Prefetching data for ${path}`);
    }
  }, [enablePageStateCache]);

  // Performance monitoring
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logPerformance = () => {
        const status = getCacheStatus();
        console.log('[EnhancedScrollSystem] Performance Status:', status);
      };

      const interval = setInterval(logPerformance, 30000); // Log every 30 seconds
      return () => clearInterval(interval);
    }
  }, [getCacheStatus]);

  return {
    // State management
    saveCompleteState,
    restoreOptimalState,
    clearAllCaches,
    
    // Route management
    preloadRoute,
    
    // Status and debugging
    getCacheStatus,
    
    // Individual system access (for advanced usage)
    pageStateCache: enablePageStateCache ? pageStateCache : null,
    transitionCache: enableTransitionCache ? transitionCache : null,
  };
};