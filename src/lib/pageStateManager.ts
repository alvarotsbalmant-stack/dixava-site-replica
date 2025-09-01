/**
 * Comprehensive Page State Caching System
 * Manages page state in SessionStorage with TTL for instantaneous navigation
 */

export interface PageState {
  path: string;
  scrollPosition: { x: number; y: number };
  horizontalScrolls: Record<string, number>;
  queryCache: Record<string, any>;
  formData: Record<string, any>;
  filters: Record<string, any>;
  timestamp: number;
  expiresAt: number;
}

export interface PageCacheConfig {
  ttl: number; // Time to live in ms
  maxEntries: number;
  enabledFeatures: {
    scroll: boolean;
    queryCache: boolean;
    formData: boolean;
    filters: boolean;
  };
}

class PageStateManager {
  private cache = new Map<string, PageState>();
  private config: PageCacheConfig;
  private storageKey = 'pageStateCache';
  private cleanupInterval: number | null = null;

  constructor(config: Partial<PageCacheConfig> = {}) {
    this.config = {
      ttl: 30 * 60 * 1000, // 30 minutes
      maxEntries: 50,
      enabledFeatures: {
        scroll: true,
        queryCache: true,
        formData: true,
        filters: true,
      },
      ...config,
    };

    this.loadFromStorage();
    this.startCleanupInterval();
  }

  /**
   * Save complete page state
   */
  savePageState(path: string, partialState: Partial<Omit<PageState, 'path' | 'timestamp' | 'expiresAt'>>): void {
    const now = Date.now();
    const existingState = this.cache.get(path);
    
    const pageState: PageState = {
      path,
      scrollPosition: partialState.scrollPosition || existingState?.scrollPosition || { x: 0, y: 0 },
      horizontalScrolls: partialState.horizontalScrolls || existingState?.horizontalScrolls || {},
      queryCache: partialState.queryCache || existingState?.queryCache || {},
      formData: partialState.formData || existingState?.formData || {},
      filters: partialState.filters || existingState?.filters || {},
      timestamp: now,
      expiresAt: now + this.config.ttl,
    };

    this.cache.set(path, pageState);
    this.enforceMaxEntries();
    this.saveToStorage();
    
    console.log(`[PageStateManager] 💾 Saved state for ${path}`, pageState);
  }

  /**
   * Restore complete page state
   */
  restorePageState(path: string): PageState | null {
    const state = this.cache.get(path);
    
    if (!state) {
      console.log(`[PageStateManager] ❌ No state found for ${path}`);
      return null;
    }

    if (Date.now() > state.expiresAt) {
      console.log(`[PageStateManager] ⏰ State expired for ${path}`);
      this.cache.delete(path);
      this.saveToStorage();
      return null;
    }

    console.log(`[PageStateManager] ✅ Restored state for ${path}`, state);
    return state;
  }

  /**
   * Save specific scroll position
   */
  saveScrollPosition(path: string, position: { x: number; y: number }): void {
    if (!this.config.enabledFeatures.scroll) return;
    
    this.savePageState(path, { scrollPosition: position });
  }

  /**
   * Save horizontal scroll positions
   */
  saveHorizontalScrolls(path: string, scrolls: Record<string, number>): void {
    if (!this.config.enabledFeatures.scroll) return;
    
    this.savePageState(path, { horizontalScrolls: scrolls });
  }

  /**
   * Save query cache data
   */
  saveQueryCache(path: string, queryData: Record<string, any>): void {
    if (!this.config.enabledFeatures.queryCache) return;
    
    this.savePageState(path, { queryCache: queryData });
  }

  /**
   * Save form data
   */
  saveFormData(path: string, formData: Record<string, any>): void {
    if (!this.config.enabledFeatures.formData) return;
    
    this.savePageState(path, { formData });
  }

  /**
   * Save filters state
   */
  saveFilters(path: string, filters: Record<string, any>): void {
    if (!this.config.enabledFeatures.filters) return;
    
    this.savePageState(path, { filters });
  }

  /**
   * Check if page has cached state
   */
  hasPageState(path: string): boolean {
    const state = this.cache.get(path);
    return state ? Date.now() <= state.expiresAt : false;
  }

  /**
   * Clear specific page state
   */
  clearPageState(path: string): void {
    this.cache.delete(path);
    this.saveToStorage();
    console.log(`[PageStateManager] 🗑️ Cleared state for ${path}`);
  }

  /**
   * Clear all page states
   */
  clearAllStates(): void {
    this.cache.clear();
    this.saveToStorage();
    console.log(`[PageStateManager] 🗑️ Cleared all page states`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxEntries: number; ttl: number } {
    return {
      size: this.cache.size,
      maxEntries: this.config.maxEntries,
      ttl: this.config.ttl,
    };
  }

  private loadFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data);
        this.cleanupExpired();
      }
    } catch (error) {
      console.warn('[PageStateManager] Failed to load from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[PageStateManager] Failed to save to storage:', error);
    }
  }

  private enforceMaxEntries(): void {
    if (this.cache.size <= this.config.maxEntries) return;

    // Remove oldest entries
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, this.cache.size - this.config.maxEntries);
    toRemove.forEach(([path]) => this.cache.delete(path));
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [path, state] of this.cache.entries()) {
      if (now > state.expiresAt) {
        this.cache.delete(path);
      }
    }
    this.saveToStorage();
  }

  private startCleanupInterval(): void {
    // Cleanup every 5 minutes
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Global singleton instance
const pageStateManager = new PageStateManager();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).pageStateManager = pageStateManager;
}

export default pageStateManager;