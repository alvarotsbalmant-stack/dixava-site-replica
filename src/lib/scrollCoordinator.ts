/**
 * Centralized Scroll Coordinator
 * Manages all scroll-related systems to prevent conflicts and optimize performance
 */

interface ScrollListener {
  id: string;
  callback: (scrollY: number) => void;
  priority: number; // Higher priority = executed first
  throttleMs?: number;
}

interface ScrollSystem {
  id: string;
  enabled: boolean;
  lastUpdate: number;
}

class ScrollCoordinator {
  private listeners: Map<string, ScrollListener> = new Map();
  private systems: Map<string, ScrollSystem> = new Map();
  private currentScrollY = 0;
  private isScrolling = false;
  private ticking = false;
  private scrollEndTimer: NodeJS.Timeout | null = null;
  
  // Performance tracking
  private lastFrameTime = 0;
  private frameCount = 0;
  private avgFrameTime = 0;
  
  constructor() {
    this.initialize();
  }

  private initialize() {
    // Single scroll event listener with optimal performance
    window.addEventListener('scroll', this.handleScroll, { 
      passive: true,
      capture: false 
    });
    
    // Initialize scroll position
    this.currentScrollY = window.scrollY;
    
    console.log('[ScrollCoordinator] Initialized');
  }

  private handleScroll = () => {
    if (!this.ticking) {
      requestAnimationFrame(this.updateSystems);
      this.ticking = true;
    }
    
    // Track scroll state
    this.isScrolling = true;
    
    // Clear existing timer
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
    }
    
    // Set scroll end detection
    this.scrollEndTimer = setTimeout(() => {
      this.isScrolling = false;
      this.onScrollEnd();
    }, 150);
  };

  private updateSystems = () => {
    const frameStart = performance.now();
    
    // Update scroll position
    this.currentScrollY = window.scrollY;
    
    // Get sorted listeners by priority
    const sortedListeners = Array.from(this.listeners.values())
      .sort((a, b) => b.priority - a.priority);
    
    // Execute listeners with throttling
    sortedListeners.forEach(listener => {
      const system = this.systems.get(listener.id);
      if (!system?.enabled) return;
      
      const now = Date.now();
      const timeSinceLastUpdate = now - system.lastUpdate;
      const throttleMs = listener.throttleMs || 0;
      
      if (timeSinceLastUpdate >= throttleMs) {
        try {
          listener.callback(this.currentScrollY);
          system.lastUpdate = now;
        } catch (error) {
          console.error(`[ScrollCoordinator] Error in listener ${listener.id}:`, error);
        }
      }
    });
    
    // Performance tracking
    const frameEnd = performance.now();
    const frameTime = frameEnd - frameStart;
    
    this.frameCount++;
    this.avgFrameTime = (this.avgFrameTime * (this.frameCount - 1) + frameTime) / this.frameCount;
    
    // Log performance warnings
    if (frameTime > 16.67) { // More than 60fps budget
      console.warn(`[ScrollCoordinator] Slow frame: ${frameTime.toFixed(2)}ms`);
    }
    
    this.ticking = false;
  };

  private onScrollEnd() {
    // Notify systems that scrolling has ended
    this.listeners.forEach(listener => {
      const system = this.systems.get(listener.id);
      if (system?.enabled && typeof (listener.callback as any).onScrollEnd === 'function') {
        (listener.callback as any).onScrollEnd();
      }
    });
  }

  // Public API
  registerSystem(
    id: string, 
    callback: (scrollY: number) => void, 
    options: {
      priority?: number;
      throttleMs?: number;
      enabled?: boolean;
    } = {}
  ) {
    const {
      priority = 5,
      throttleMs = 8,
      enabled = true
    } = options;

    // Register listener
    this.listeners.set(id, {
      id,
      callback,
      priority,
      throttleMs
    });

    // Register system
    this.systems.set(id, {
      id,
      enabled,
      lastUpdate: 0
    });

    console.log(`[ScrollCoordinator] Registered system: ${id}`);
  }

  unregisterSystem(id: string) {
    this.listeners.delete(id);
    this.systems.delete(id);
    console.log(`[ScrollCoordinator] Unregistered system: ${id}`);
  }

  enableSystem(id: string) {
    const system = this.systems.get(id);
    if (system) {
      system.enabled = true;
    }
  }

  disableSystem(id: string) {
    const system = this.systems.get(id);
    if (system) {
      system.enabled = false;
    }
  }

  // Getters for system status
  getCurrentScrollY() {
    return this.currentScrollY;
  }

  isCurrentlyScrolling() {
    return this.isScrolling;
  }

  getPerformanceStats() {
    return {
      avgFrameTime: this.avgFrameTime,
      frameCount: this.frameCount,
      systemCount: this.systems.size
    };
  }

  // Emergency reset for debugging
  resetAllSystems() {
    this.listeners.forEach(listener => {
      try {
        if (typeof (listener.callback as any).reset === 'function') {
          (listener.callback as any).reset();
        }
      } catch (error) {
        console.error(`[ScrollCoordinator] Error resetting ${listener.id}:`, error);
      }
    });
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
    }
    
    this.listeners.clear();
    this.systems.clear();
    
    console.log('[ScrollCoordinator] Destroyed');
  }
}

// Global singleton instance
export const scrollCoordinator = new ScrollCoordinator();