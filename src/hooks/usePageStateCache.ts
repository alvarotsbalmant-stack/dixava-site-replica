import { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigationType, NavigationType } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import pageStateManager, { PageState } from '@/lib/pageStateManager';

export interface UsePageStateCacheOptions {
  enableAutoSave?: boolean;
  saveInterval?: number;
  restoreQueryCache?: boolean;
  enableFormDataCache?: boolean;
  enableFiltersCache?: boolean;
}

/**
 * React hook for page state caching integration
 * Provides seamless state restoration and saving
 */
export const usePageStateCache = (options: UsePageStateCacheOptions = {}) => {
  const {
    enableAutoSave = true,
    saveInterval = 2000,
    restoreQueryCache = true,
    enableFormDataCache = true,
    enableFiltersCache = true,
  } = options;

  const location = useLocation();
  const navigationType = useNavigationType();
  const queryClient = useQueryClient();
  const autoSaveRef = useRef<number | null>(null);
  const currentPath = location.pathname + location.search;

  /**
   * Save current page state manually
   */
  const saveCurrentState = useCallback((additionalData: Partial<PageState> = {}) => {
    const scrollPosition = {
      x: window.scrollX,
      y: window.scrollY,
    };

    // Gather horizontal scroll positions
    const horizontalScrolls: Record<string, number> = {};
    try {
      document.querySelectorAll('[data-scroll-section]').forEach((element) => {
        const sectionId = element.getAttribute('data-scroll-section');
        if (sectionId && element.scrollLeft > 0) {
          horizontalScrolls[sectionId] = element.scrollLeft;
        }
      });
    } catch (error) {
      console.warn('[PageStateCache] Failed to gather horizontal scrolls:', error);
    }

    // Gather query cache data if enabled
    const queryCache: Record<string, any> = {};
    if (restoreQueryCache) {
      try {
        const cache = queryClient.getQueryCache();
        cache.getAll().forEach((query) => {
          if (query.state.data && query.queryKey) {
            queryCache[JSON.stringify(query.queryKey)] = {
              data: query.state.data,
              dataUpdatedAt: query.state.dataUpdatedAt,
            };
          }
        });
      } catch (error) {
        console.warn('[PageStateCache] Failed to gather query cache:', error);
      }
    }

    pageStateManager.savePageState(currentPath, {
      scrollPosition,
      horizontalScrolls,
      queryCache,
      ...additionalData,
    });
  }, [currentPath, queryClient, restoreQueryCache]);

  /**
   * Restore page state from cache
   */
  const restorePageState = useCallback(async (path?: string): Promise<boolean> => {
    const targetPath = path || currentPath;
    const cachedState = pageStateManager.restorePageState(targetPath);
    
    if (!cachedState) return false;

    // Restore query cache
    if (restoreQueryCache && cachedState.queryCache) {
      Object.entries(cachedState.queryCache).forEach(([queryKeyStr, cacheData]) => {
        try {
          const queryKey = JSON.parse(queryKeyStr);
          queryClient.setQueryData(queryKey, cacheData.data, {
            updatedAt: cacheData.dataUpdatedAt,
          });
        } catch (error) {
          console.warn('[PageStateCache] Failed to restore query cache:', error);
        }
      });
    }

    // Restore scroll positions with delay for DOM readiness
    setTimeout(() => {
      if (cachedState.scrollPosition) {
        window.scrollTo({
          left: cachedState.scrollPosition.x,
          top: cachedState.scrollPosition.y,
          behavior: 'auto',
        });
      }

      // Restore horizontal scrolls
      if (cachedState.horizontalScrolls) {
        Object.entries(cachedState.horizontalScrolls).forEach(([sectionId, scrollLeft]) => {
          const element = document.querySelector(`[data-scroll-section="${sectionId}"]`);
          if (element) {
            element.scrollLeft = scrollLeft;
          }
        });
      }
    }, 100);

    console.log(`[PageStateCache] ✅ Restored complete state for ${targetPath}`);
    return true;
  }, [currentPath, queryClient, restoreQueryCache]);

  /**
   * Save form data to cache
   */
  const saveFormData = useCallback((formData: Record<string, any>) => {
    if (!enableFormDataCache) return;
    pageStateManager.saveFormData(currentPath, formData);
  }, [currentPath, enableFormDataCache]);

  /**
   * Restore form data from cache
   */
  const restoreFormData = useCallback((): Record<string, any> | null => {
    if (!enableFormDataCache) return null;
    const state = pageStateManager.restorePageState(currentPath);
    return state?.formData || null;
  }, [currentPath, enableFormDataCache]);

  /**
   * Save filters to cache
   */
  const saveFilters = useCallback((filters: Record<string, any>) => {
    if (!enableFiltersCache) return;
    pageStateManager.saveFilters(currentPath, filters);
  }, [currentPath, enableFiltersCache]);

  /**
   * Restore filters from cache
   */
  const restoreFilters = useCallback((): Record<string, any> | null => {
    if (!enableFiltersCache) return null;
    const state = pageStateManager.restorePageState(currentPath);
    return state?.filters || null;
  }, [currentPath, enableFiltersCache]);

  /**
   * Check if current page has cached state
   */
  const hasCachedState = useCallback((path?: string): boolean => {
    return pageStateManager.hasPageState(path || currentPath);
  }, [currentPath]);

  /**
   * Clear current page state
   */
  const clearCurrentState = useCallback(() => {
    pageStateManager.clearPageState(currentPath);
  }, [currentPath]);

  // Auto-save current state periodically
  useEffect(() => {
    if (!enableAutoSave) return;

    const startAutoSave = () => {
      autoSaveRef.current = window.setInterval(() => {
        saveCurrentState();
      }, saveInterval);
    };

    const stopAutoSave = () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
        autoSaveRef.current = null;
      }
    };

    startAutoSave();

    return stopAutoSave;
  }, [enableAutoSave, saveInterval, saveCurrentState]);

  // Handle navigation changes
  useEffect(() => {
    console.log(`[PageStateCache] 🚀 Navigation to ${currentPath} (${navigationType})`);

    if (navigationType === NavigationType.Pop) {
      // Back/forward navigation - try to restore state
      console.log(`[PageStateCache] ⬅️ Back/forward navigation - attempting restore`);
      restorePageState();
    } else {
      // New navigation - save state but don't clear (keep for back navigation)
      console.log(`[PageStateCache] ➡️ New navigation - maintaining state cache`);
    }
  }, [currentPath, navigationType, restorePageState]);

  // Save state before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCurrentState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveCurrentState();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveCurrentState]);

  return {
    saveCurrentState,
    restorePageState,
    saveFormData,
    restoreFormData,
    saveFilters,
    restoreFilters,
    hasCachedState,
    clearCurrentState,
  };
};
