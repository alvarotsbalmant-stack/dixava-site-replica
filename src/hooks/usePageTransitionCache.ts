import { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigationType, NavigationType } from 'react-router-dom';
import pageTransitionManager from '@/lib/pageTransitionManager';

export interface UsePageTransitionCacheOptions {
  enableSnapshots?: boolean;
  snapshotDelay?: number;
  enableInstantTransitions?: boolean;
  preloadRoutes?: string[];
}

/**
 * React hook for ultra-fast page transitions using DOM snapshots
 */
export const usePageTransitionCache = (options: UsePageTransitionCacheOptions = {}) => {
  const {
    enableSnapshots = true,
    snapshotDelay = 1000,
    enableInstantTransitions = true,
    preloadRoutes = [],
  } = options;

  const location = useLocation();
  const navigationType = useNavigationType();
  const snapshotTimeoutRef = useRef<number | null>(null);
  const currentPath = location.pathname + location.search;
  const isInitialLoad = useRef(true);

  /**
   * Create snapshot of current page
   */
  const createSnapshot = useCallback((path?: string) => {
    if (!enableSnapshots) return;
    
    const targetPath = path || currentPath;
    
    // Clear any pending snapshot
    if (snapshotTimeoutRef.current) {
      clearTimeout(snapshotTimeoutRef.current);
    }

    // Create snapshot after content has settled
    snapshotTimeoutRef.current = window.setTimeout(() => {
      pageTransitionManager.createSnapshot(targetPath);
    }, snapshotDelay);
  }, [currentPath, enableSnapshots, snapshotDelay]);

  /**
   * Attempt to restore page from snapshot
   */
  const restoreSnapshot = useCallback((path?: string): boolean => {
    if (!enableInstantTransitions) return false;
    
    const targetPath = path || currentPath;
    return pageTransitionManager.restoreSnapshot(targetPath);
  }, [currentPath, enableInstantTransitions]);

  /**
   * Check if instant transition is available
   */
  const hasInstantTransition = useCallback((path?: string): boolean => {
    const targetPath = path || currentPath;
    return pageTransitionManager.hasSnapshot(targetPath);
  }, [currentPath]);

  /**
   * Force clear current page snapshot
   */
  const clearCurrentSnapshot = useCallback(() => {
    pageTransitionManager.clearSnapshot(currentPath);
  }, [currentPath]);

  /**
   * Preload route snapshots
   */
  const preloadRouteSnapshots = useCallback(() => {
    preloadRoutes.forEach(route => {
      if (!pageTransitionManager.hasSnapshot(route)) {
        // This would typically involve navigating to the route briefly
        // For now, we'll just mark it as a route to preload
        console.log(`[PageTransitionCache] 📋 Route marked for preload: ${route}`);
      }
    });
  }, [preloadRoutes]);

  /**
   * Get transition statistics
   */
  const getTransitionStats = useCallback(() => {
    return pageTransitionManager.getSnapshotStats();
  }, []);

  // Handle navigation with instant transitions
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    console.log(`[PageTransitionCache] 🔄 Navigation to ${currentPath} (${navigationType})`);

    if (navigationType === NavigationType.Pop && enableInstantTransitions) {
      // Back/forward navigation - try instant restore
      const restored = restoreSnapshot();
      if (restored) {
        console.log(`[PageTransitionCache] ⚡ Instant transition successful for ${currentPath}`);
        return;
      }
    }

    // Normal navigation flow
    console.log(`[PageTransitionCache] 🚀 Normal navigation to ${currentPath}`);
    
    // Create snapshot for this page after it loads
    createSnapshot();
  }, [currentPath, navigationType, enableInstantTransitions, restoreSnapshot, createSnapshot]);

  // Create snapshot when page content changes significantly
  useEffect(() => {
    if (isInitialLoad.current) return;

    let observer: MutationObserver | null = null;

    try {
      // Listen for significant DOM changes that should trigger a new snapshot
      observer = new MutationObserver((mutations) => {
        const significantChange = mutations.some(mutation => {
          // Check if this is a significant content change
          return mutation.type === 'childList' && 
                 mutation.addedNodes.length > 0 && 
                 Array.from(mutation.addedNodes).some(node => 
                   node.nodeType === Node.ELEMENT_NODE &&
                   !(node as Element).matches('.transition-element, .loading-indicator, [data-exclude-snapshot]')
                 );
        });

        if (significantChange) {
          console.log(`[PageTransitionCache] 📝 Significant content change detected`);
          createSnapshot();
        }
      });

      // Observe the main content area
      const mainContent = document.querySelector('main, #root, [data-main-content]');
      if (mainContent) {
        observer.observe(mainContent, {
          childList: true,
          subtree: true,
        });
      }
    } catch (error) {
      console.warn('[PageTransitionCache] Failed to create MutationObserver:', error);
    }

    return () => {
      if (observer) {
        try {
          observer.disconnect();
        } catch (error) {
          console.warn('[PageTransitionCache] Failed to disconnect observer:', error);
        }
      }
    };
  }, [createSnapshot]);

  // Preload routes on mount
  useEffect(() => {
    if (preloadRoutes.length > 0) {
      // Delay preloading to not interfere with initial page load
      const timeout = setTimeout(preloadRouteSnapshots, 2000);
      return () => clearTimeout(timeout);
    }
  }, [preloadRoutes, preloadRouteSnapshots]);

  // Listen for page snapshot restoration events
  useEffect(() => {
    const handleSnapshotRestored = (event: CustomEvent) => {
      console.log(`[PageTransitionCache] 🔄 Page snapshot restored at ${event.detail.timestamp}`);
      
      // Reinitialize any React components that need it
      // This could trigger a re-render or state sync
    };

    window.addEventListener('page-snapshot-restored', handleSnapshotRestored as EventListener);
    
    return () => {
      window.removeEventListener('page-snapshot-restored', handleSnapshotRestored as EventListener);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (snapshotTimeoutRef.current) {
        clearTimeout(snapshotTimeoutRef.current);
      }
    };
  }, []);

  return {
    createSnapshot,
    restoreSnapshot,
    hasInstantTransition,
    clearCurrentSnapshot,
    getTransitionStats,
    isTransitioning: pageTransitionManager.getIsTransitioning(),
  };
};