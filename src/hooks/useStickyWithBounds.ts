import { useEffect, useRef, useCallback } from 'react';
import { ImprovedStickyManager } from '@/lib/improvedStickyManager';
import { scrollCoordinator } from '@/lib/scrollCoordinator';

interface UseStickyWithBoundsProps {
  enabled?: boolean;
  referenceElementId: string; // ID of the element that defines the bottom boundary
  naturalOffset?: number; // Offset natural do elemento para não grudar no header
}

export const useStickyWithBounds = ({ 
  enabled = true, 
  referenceElementId,
  naturalOffset = 100 // Offset padrão de 100px do header
}: UseStickyWithBoundsProps) => {
  const managerRef = useRef<ImprovedStickyManager | null>(null);
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const isInitializedRef = useRef(false);

  // Initialize the sticky manager
  useEffect(() => {
    if (!enabled) return;

    managerRef.current = new ImprovedStickyManager();
    
    return () => {
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, [enabled]);

  // Setup resize listener (scroll is handled by scrollCoordinator)
  useEffect(() => {
    if (!enabled || !managerRef.current) return;

    const handleResize = () => {
      // Debounce resize events
      setTimeout(() => {
        if (managerRef.current) {
          updateAllBounds();
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  // Update bounds for all registered elements
  const updateAllBounds = useCallback(() => {
    const referenceElement = document.getElementById(referenceElementId);
    if (!referenceElement || !managerRef.current) return;

    elementsRef.current.forEach((element, id) => {
      const bounds = managerRef.current!.calculateBounds(element, referenceElement);
      
      managerRef.current!.removeElement(id);
      managerRef.current!.addElement(id, element, bounds, naturalOffset);
    });
    
    // Also refresh bounds in manager
    managerRef.current!.refreshBounds();
  }, [referenceElementId, naturalOffset]);

  // Register a sticky element
  const registerStickyElement = useCallback((id: string, element: HTMLElement | null) => {
    if (!enabled || !element || !managerRef.current) return;

    const referenceElement = document.getElementById(referenceElementId);
    if (!referenceElement) {
      console.warn(`Reference element with id "${referenceElementId}" not found`);
      return;
    }

    // Store the element
    elementsRef.current.set(id, element);

    // Calculate bounds
    const bounds = managerRef.current.calculateBounds(element, referenceElement);

    // Add to manager
    managerRef.current.addElement(id, element, bounds, naturalOffset);
  }, [enabled, referenceElementId, naturalOffset]);

  // Unregister a sticky element
  const unregisterStickyElement = useCallback((id: string) => {
    if (!managerRef.current) return;

    managerRef.current.removeElement(id);
    elementsRef.current.delete(id);
  }, []);

  // Refresh bounds (useful when layout changes)
  const refreshBounds = useCallback(() => {
    updateAllBounds();
  }, [updateAllBounds]);

  // Reset all transforms (useful for cleanup)
  const resetTransforms = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.resetAllElements();
    }
  }, []);

  // Emergency reset for debugging
  const emergencyReset = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.resetAllElements();
      console.log('[StickyHook] Emergency reset performed');
    }
  }, []);

  // Debug function
  const debugSticky = useCallback(() => {
    if (managerRef.current && process.env.NODE_ENV === 'development') {
      managerRef.current.debugAllElements();
      console.log('ScrollCoordinator stats:', scrollCoordinator.getPerformanceStats());
    }
  }, []);

  return {
    registerStickyElement,
    unregisterStickyElement,
    refreshBounds,
    resetTransforms,
    emergencyReset,
    debugSticky,
    isEnabled: enabled
  };
};