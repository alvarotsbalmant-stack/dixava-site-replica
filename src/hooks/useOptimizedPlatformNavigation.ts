import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSKUNavigationStore } from '@/stores/skuNavigationStore';

export const useOptimizedPlatformNavigation = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();
  
  const {
    getSKUNavigation,
    setOptimisticUpdate,
    setCurrentProduct
  } = useSKUNavigationStore();

  const navigateToPlatform = useCallback(async (
    platform: string, 
    sku: any, 
    currentProductId?: string
  ) => {
    if (!sku || isTransitioning) return;

    const targetProductId = sku.id;
    
    // Skip if already on this product
    if (targetProductId === currentProductId) return;

    setIsTransitioning(true);
    
    try {
      // Check if we have cached data for instant transition
      const cachedSKUNavigation = getSKUNavigation(targetProductId);
      
      if (cachedSKUNavigation) {
        console.log(`⚡ Instant transition to ${targetProductId}`);
        
        // Enable optimistic update mode
        setOptimisticUpdate(true);
        
        // Navigate immediately
        navigate(`/produto/${targetProductId}`, { replace: false });
        
        // Update current product in store
        setCurrentProduct(targetProductId);
        
        // Disable optimistic mode after a brief delay
        transitionTimeoutRef.current = setTimeout(() => {
          setOptimisticUpdate(false);
        }, 100);
      } else {
        console.log(`🔄 Standard navigation to ${targetProductId}`);
        
        // Standard navigation without optimistic update
        navigate(`/produto/${targetProductId}`, { replace: false });
        setCurrentProduct(targetProductId);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      // Clear transition state after a brief delay
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  }, [navigate, getSKUNavigation, setOptimisticUpdate, setCurrentProduct, isTransitioning]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    setIsTransitioning(false);
    setOptimisticUpdate(false);
  }, [setOptimisticUpdate]);

  return {
    navigateToPlatform,
    isTransitioning,
    cleanup
  };
};