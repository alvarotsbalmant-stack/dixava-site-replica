/**
 * Page Transition Manager
 * Handles DOM state freezing and restoration for ultra-fast page transitions
 */

export interface PageSnapshot {
  path: string;
  html: string;
  scrollPosition: { x: number; y: number };
  timestamp: number;
  expiresAt: number;
  metadata: {
    title: string;
    url: string;
    viewportHeight: number;
    viewportWidth: number;
  };
}

export interface TransitionConfig {
  enableDOMSnapshot: boolean;
  snapshotTTL: number; // TTL in milliseconds
  maxSnapshots: number;
  excludeSelectors: string[]; // Elements to exclude from snapshot
  enablePreventFlash: boolean;
}

class PageTransitionManager {
  private snapshots = new Map<string, PageSnapshot>();
  private config: TransitionConfig;
  private storageKey = 'pageSnapshots';
  private isTransitioning = false;

  constructor(config: Partial<TransitionConfig> = {}) {
    this.config = {
      enableDOMSnapshot: true,
      snapshotTTL: 10 * 60 * 1000, // 10 minutes
      maxSnapshots: 10,
      excludeSelectors: [
        'script',
        'style',
        '[data-exclude-snapshot]',
        '.transition-element',
        '.loading-indicator',
      ],
      enablePreventFlash: true,
      ...config,
    };

    this.loadSnapshots();
  }

  /**
   * Create a snapshot of the current page state
   */
  createSnapshot(path: string): PageSnapshot | null {
    if (!this.config.enableDOMSnapshot) return null;

    try {
      // Clone the document
      const docClone = document.cloneNode(true) as Document;
      
      // Remove excluded elements
      this.config.excludeSelectors.forEach(selector => {
        docClone.querySelectorAll(selector).forEach(el => el.remove());
      });

      // Clean up dynamic content
      this.cleanupDynamicContent(docClone);

      const snapshot: PageSnapshot = {
        path,
        html: docClone.documentElement.outerHTML,
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY,
        },
        timestamp: Date.now(),
        expiresAt: Date.now() + this.config.snapshotTTL,
        metadata: {
          title: document.title,
          url: window.location.href,
          viewportHeight: window.innerHeight,
          viewportWidth: window.innerWidth,
        },
      };

      this.snapshots.set(path, snapshot);
      this.enforceMaxSnapshots();
      this.saveSnapshots();

      console.log(`[PageTransitionManager] 📸 Created snapshot for ${path}`);
      return snapshot;
    } catch (error) {
      console.warn('[PageTransitionManager] Failed to create snapshot:', error);
      return null;
    }
  }

  /**
   * Restore a page from snapshot
   */
  restoreSnapshot(path: string): boolean {
    const snapshot = this.snapshots.get(path);
    
    if (!snapshot || Date.now() > snapshot.expiresAt) {
      if (snapshot) {
        this.snapshots.delete(path);
        this.saveSnapshots();
      }
      return false;
    }

    try {
      this.isTransitioning = true;
      
      // Prevent flash during transition
      if (this.config.enablePreventFlash) {
        this.preventTransitionFlash();
      }

      // Replace document content
      document.documentElement.innerHTML = snapshot.html;
      
      // Restore scroll position
      window.scrollTo({
        left: snapshot.scrollPosition.x,
        top: snapshot.scrollPosition.y,
        behavior: 'auto',
      });

      // Update metadata
      document.title = snapshot.metadata.title;
      
      // Re-initialize any necessary scripts/components
      this.reinitializePage();

      console.log(`[PageTransitionManager] ✅ Restored snapshot for ${path}`);
      
      setTimeout(() => {
        this.isTransitioning = false;
      }, 100);

      return true;
    } catch (error) {
      console.warn('[PageTransitionManager] Failed to restore snapshot:', error);
      this.isTransitioning = false;
      return false;
    }
  }

  /**
   * Check if snapshot exists for path
   */
  hasSnapshot(path: string): boolean {
    const snapshot = this.snapshots.get(path);
    return snapshot ? Date.now() <= snapshot.expiresAt : false;
  }

  /**
   * Clear snapshot for specific path
   */
  clearSnapshot(path: string): void {
    this.snapshots.delete(path);
    this.saveSnapshots();
  }

  /**
   * Clear all snapshots
   */
  clearAllSnapshots(): void {
    this.snapshots.clear();
    this.saveSnapshots();
  }

  /**
   * Get transition status
   */
  getIsTransitioning(): boolean {
    return this.isTransitioning;
  }

  /**
   * Get snapshot statistics
   */
  getSnapshotStats(): { count: number; maxCount: number; totalSize: number } {
    let totalSize = 0;
    this.snapshots.forEach(snapshot => {
      totalSize += snapshot.html.length;
    });

    return {
      count: this.snapshots.size,
      maxCount: this.config.maxSnapshots,
      totalSize,
    };
  }

  private cleanupDynamicContent(doc: Document): void {
    // Remove loading states
    doc.querySelectorAll('[data-loading]').forEach(el => el.remove());
    
    // Clean up form validation states
    doc.querySelectorAll('.error, .success, .warning').forEach(el => {
      el.classList.remove('error', 'success', 'warning');
    });

    // Reset form inputs to prevent stale data
    doc.querySelectorAll('input, textarea, select').forEach(el => {
      const input = el as HTMLInputElement;
      if (input.type !== 'hidden') {
        input.removeAttribute('value');
        input.removeAttribute('checked');
        input.removeAttribute('selected');
      }
    });

    // Remove transition classes
    doc.querySelectorAll('[class*="transition"], [class*="animate"]').forEach(el => {
      const classes = Array.from(el.classList);
      classes.forEach(cls => {
        if (cls.includes('transition') || cls.includes('animate')) {
          el.classList.remove(cls);
        }
      });
    });
  }

  private preventTransitionFlash(): void {
    // Add a temporary overlay to prevent flash
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--background);
      z-index: 9999;
      opacity: 1;
      transition: opacity 150ms ease-out;
    `;
    overlay.setAttribute('data-transition-overlay', 'true');
    
    document.body.appendChild(overlay);
    
    // Remove overlay after DOM update
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
        }, 150);
      });
    });
  }

  private reinitializePage(): void {
    // Trigger custom event for components to reinitialize
    window.dispatchEvent(new CustomEvent('page-snapshot-restored', {
      detail: { timestamp: Date.now() }
    }));

    // Reattach event listeners for critical functionality
    this.reattachCriticalListeners();
  }

  private reattachCriticalListeners(): void {
    // Re-enable router navigation
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('/')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          // This will be handled by the router
          window.dispatchEvent(new CustomEvent('navigate', {
            detail: { href }
          }));
        });
      }
    });
  }

  private enforceMaxSnapshots(): void {
    if (this.snapshots.size <= this.config.maxSnapshots) return;

    const entries = Array.from(this.snapshots.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, this.snapshots.size - this.config.maxSnapshots);
    toRemove.forEach(([path]) => this.snapshots.delete(path));
  }

  private loadSnapshots(): void {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.snapshots = new Map(data);
        this.cleanupExpiredSnapshots();
      }
    } catch (error) {
      console.warn('[PageTransitionManager] Failed to load snapshots:', error);
    }
  }

  private saveSnapshots(): void {
    try {
      const data = Array.from(this.snapshots.entries());
      sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[PageTransitionManager] Failed to save snapshots:', error);
      // If storage is full, clear old snapshots and try again
      this.clearOldestSnapshots(5);
      try {
        const data = Array.from(this.snapshots.entries());
        sessionStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (retryError) {
        console.warn('[PageTransitionManager] Storage still full, disabling snapshots');
      }
    }
  }

  private cleanupExpiredSnapshots(): void {
    const now = Date.now();
    for (const [path, snapshot] of this.snapshots.entries()) {
      if (now > snapshot.expiresAt) {
        this.snapshots.delete(path);
      }
    }
  }

  private clearOldestSnapshots(count: number): void {
    const entries = Array.from(this.snapshots.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, Math.min(count, entries.length));
    toRemove.forEach(([path]) => this.snapshots.delete(path));
  }

  destroy(): void {
    this.snapshots.clear();
    this.isTransitioning = false;
  }
}

// Global singleton instance
const pageTransitionManager = new PageTransitionManager();

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).pageTransitionManager = pageTransitionManager;
}

export default pageTransitionManager;