/**
 * Improved Sticky Manager with Better Bounds Handling
 * Fixes the out-of-bounds issues during aggressive scrolling
 */

import { scrollCoordinator } from './scrollCoordinator';

export interface StickyBounds {
  containerTop: number;
  containerBottom: number;
  referenceBottom: number;
}

export interface StickyElement {
  id: string;
  element: HTMLElement;
  bounds: StickyBounds;
  naturalOffset: number;
  originalWidth: number;
  originalHeight: number;
  isActive: boolean;
}

interface ElementState {
  phase: 'before' | 'sticky' | 'bottom-limit' | 'after';
  lastValidPosition: number;
  isStable: boolean; // Prevents flickering during rapid scroll
}

export class ImprovedStickyManager {
  private elements: Map<string, StickyElement> = new Map();
  private elementStates: Map<string, ElementState> = new Map();
  private headerHeight = 0;
  private boundariesCache: Map<string, StickyBounds> = new Map();
  private lastScrollY = 0;
  private scrollDirection: 'up' | 'down' | 'none' = 'none';
  
  // Stability configuration
  private readonly STABILITY_THRESHOLD = 5; // px tolerance for position changes
  private readonly RAPID_SCROLL_THRESHOLD = 50; // px per frame to detect aggressive scrolling
  
  constructor() {
    this.updateHeaderHeight();
    
    // Register with scroll coordinator
    scrollCoordinator.registerSystem('sticky-manager', this.updateScroll.bind(this), {
      priority: 10, // High priority for visual elements
      throttleMs: 8 // ~120fps for smooth scrolling
    });
  }

  addElement(id: string, element: HTMLElement, bounds: StickyBounds, naturalOffset: number = 100) {
    // Store original dimensions before any modifications
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    
    const stickyElement: StickyElement = {
      id,
      element,
      bounds: { ...bounds }, // Deep copy
      naturalOffset,
      originalWidth: rect.width,
      originalHeight: rect.height,
      isActive: true
    };
    
    this.elements.set(id, stickyElement);
    
    // Initialize element state
    this.elementStates.set(id, {
      phase: 'before',
      lastValidPosition: 0,
      isStable: true
    });
    
    // Cache boundaries
    this.boundariesCache.set(id, { ...bounds });
    
    // Setup initial styles
    this.setupElementStyles(element);
    
    // Immediate position update
    this.updateElementPosition(stickyElement);
    
    console.log(`[ImprovedStickyManager] Added element: ${id}`);
  }

  removeElement(id: string) {
    const stickyElement = this.elements.get(id);
    if (stickyElement) {
      this.resetElementStyles(stickyElement.element);
      this.elements.delete(id);
      this.elementStates.delete(id);
      this.boundariesCache.delete(id);
      console.log(`[ImprovedStickyManager] Removed element: ${id}`);
    }
  }

  private updateScroll = (scrollY: number) => {
    // Calculate scroll direction and speed
    const scrollDelta = scrollY - this.lastScrollY;
    const isRapidScroll = Math.abs(scrollDelta) > this.RAPID_SCROLL_THRESHOLD;
    
    this.scrollDirection = scrollDelta > 0 ? 'down' : scrollDelta < 0 ? 'up' : 'none';
    this.lastScrollY = scrollY;
    
    // Update all active elements
    this.elements.forEach(stickyElement => {
      if (stickyElement.isActive) {
        this.updateElementPosition(stickyElement, isRapidScroll);
      }
    });
  };

  private updateElementPosition(stickyElement: StickyElement, isRapidScroll: boolean = false) {
    const { id, element, bounds, naturalOffset, originalWidth, originalHeight } = stickyElement;
    const state = this.elementStates.get(id)!;
    
    const scrollY = this.lastScrollY;
    const desiredPosition = this.headerHeight + naturalOffset;
    
    // Calculate phase boundaries
    const stickyStart = bounds.containerTop - desiredPosition;
    const bottomLimit = bounds.referenceBottom - originalHeight;
    
    // Determine current phase
    let newPhase: ElementState['phase'];
    let calculatedPosition: number;
    
    if (scrollY <= stickyStart) {
      // PHASE 1: Before sticky zone
      newPhase = 'before';
      calculatedPosition = 0; // Relative positioning
      
    } else if (scrollY < (bottomLimit - desiredPosition)) {
      // PHASE 2: Sticky zone
      newPhase = 'sticky';
      calculatedPosition = desiredPosition;
      
    } else if (scrollY <= bottomLimit) {
      // PHASE 3: Approaching bottom limit
      newPhase = 'bottom-limit';
      calculatedPosition = bottomLimit - scrollY;
      
    } else {
      // PHASE 4: Past bottom limit
      newPhase = 'after';
      calculatedPosition = bottomLimit - scrollY; // Allow negative positions
    }
    
    // Stability check during rapid scrolling
    if (isRapidScroll && state.isStable) {
      const positionDelta = Math.abs(calculatedPosition - state.lastValidPosition);
      if (positionDelta < this.STABILITY_THRESHOLD && newPhase === state.phase) {
        // Skip update to prevent flickering
        return;
      }
    }
    
    // Apply position based on phase
    this.applyElementPosition(element, newPhase, calculatedPosition, originalWidth, originalHeight);
    
    // Update state
    state.phase = newPhase;
    state.lastValidPosition = calculatedPosition;
    state.isStable = !isRapidScroll;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[StickyDebug] ${id}: phase=${newPhase}, pos=${calculatedPosition.toFixed(1)}, scroll=${scrollY}`);
    }
  }

  private applyElementPosition(
    element: HTMLElement, 
    phase: ElementState['phase'], 
    position: number, 
    width: number, 
    height: number
  ) {
    // Get parent positioning context
    const parent = element.parentElement;
    if (!parent) {
      console.warn('[ImprovedStickyManager] Parent element not found');
      return;
    }
    
    const parentRect = parent.getBoundingClientRect();
    const leftPosition = parentRect.left + window.scrollX;
    
    switch (phase) {
      case 'before':
        // Natural relative positioning
        element.style.position = 'relative';
        element.style.top = '';
        element.style.left = '';
        element.style.width = '';
        element.style.height = '';
        break;
        
      case 'sticky':
        // Fixed positioning at desired location
        element.style.position = 'fixed';
        element.style.top = `${position}px`;
        element.style.left = `${Math.max(0, leftPosition)}px`;
        element.style.width = `${Math.max(100, width)}px`;
        element.style.height = `${Math.max(50, height)}px`;
        break;
        
      case 'bottom-limit':
      case 'after':
        // Fixed positioning that can go negative (natural behavior)
        element.style.position = 'fixed';
        element.style.top = `${position}px`; // Allow negative values
        element.style.left = `${Math.max(0, leftPosition)}px`;
        element.style.width = `${Math.max(100, width)}px`;
        element.style.height = `${Math.max(50, height)}px`;
        break;
    }
    
    // Ensure consistent z-index and visibility
    element.style.zIndex = '10';
    element.style.visibility = 'visible';
  }

  private setupElementStyles(element: HTMLElement) {
    element.style.position = 'relative';
    element.style.zIndex = '10';
    element.style.visibility = 'visible';
  }

  private resetElementStyles(element: HTMLElement) {
    element.style.position = '';
    element.style.top = '';
    element.style.left = '';
    element.style.width = '';
    element.style.height = '';
    element.style.zIndex = '';
    element.style.transform = '';
    element.style.visibility = '';
  }

  calculateBounds(containerElement: HTMLElement, referenceElement: HTMLElement): StickyBounds {
    const containerRect = containerElement.getBoundingClientRect();
    const referenceRect = referenceElement.getBoundingClientRect();
    const scrollY = window.scrollY;
    
    const bounds: StickyBounds = {
      containerTop: containerRect.top + scrollY,
      containerBottom: containerRect.bottom + scrollY,
      referenceBottom: referenceRect.bottom + scrollY
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[StickyBounds] Calculated:', bounds);
    }
    
    return bounds;
  }

  refreshBounds() {
    // Recalculate bounds for all elements
    this.elements.forEach((stickyElement, id) => {
      const container = stickyElement.element.closest('[data-sticky-container]') as HTMLElement;
      const reference = document.getElementById(stickyElement.bounds.referenceBottom.toString().split('.')[0]);
      
      if (container && reference) {
        const newBounds = this.calculateBounds(container, reference);
        stickyElement.bounds = newBounds;
        this.boundariesCache.set(id, newBounds);
      }
    });
    
    // Update header height
    this.updateHeaderHeight();
    
    // Force update positions
    this.elements.forEach(stickyElement => {
      if (stickyElement.isActive) {
        this.updateElementPosition(stickyElement);
      }
    });
  }

  private updateHeaderHeight() {
    const header = document.querySelector('header') || 
                  document.querySelector('[role="banner"]') || 
                  document.querySelector('nav');
    this.headerHeight = header ? header.offsetHeight : 80;
  }

  // Emergency fallback methods
  resetElement(id: string) {
    const stickyElement = this.elements.get(id);
    if (stickyElement) {
      this.resetElementStyles(stickyElement.element);
      
      // Reset state
      const state = this.elementStates.get(id);
      if (state) {
        state.phase = 'before';
        state.isStable = true;
        state.lastValidPosition = 0;
      }
      
      console.log(`[ImprovedStickyManager] Reset element: ${id}`);
    }
  }

  resetAllElements() {
    this.elements.forEach((_, id) => {
      this.resetElement(id);
    });
  }

  // Debugging methods
  getElementState(id: string) {
    return {
      element: this.elements.get(id),
      state: this.elementStates.get(id),
      bounds: this.boundariesCache.get(id)
    };
  }

  debugAllElements() {
    console.group('[ImprovedStickyManager] Debug All Elements');
    this.elements.forEach((element, id) => {
      console.log(`${id}:`, this.getElementState(id));
    });
    console.groupEnd();
  }

  destroy() {
    // Reset all elements
    this.resetAllElements();
    
    // Unregister from scroll coordinator
    scrollCoordinator.unregisterSystem('sticky-manager');
    
    // Clear all data
    this.elements.clear();
    this.elementStates.clear();
    this.boundariesCache.clear();
    
    console.log('[ImprovedStickyManager] Destroyed');
  }
}