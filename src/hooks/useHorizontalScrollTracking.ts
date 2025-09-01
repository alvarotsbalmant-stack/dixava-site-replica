import { useEffect, useRef } from 'react';
import horizontalScrollManager from '@/lib/horizontalScrollManager';

/**
 * Hook SIMPLIFICADO para rastrear scroll horizontal em seções de produtos
 * Identifica automaticamente a seção e rastreia a posição
 */
export const useHorizontalScrollTracking = (sectionId?: string, enabled: boolean = true) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;
    
    // Rastreia elemento com ID específico se fornecido
    horizontalScrollManager.trackElement(element, sectionId);
    
    return () => {
      // Remove elemento do rastreamento
      horizontalScrollManager.untrackElement(element);
    };
  }, [enabled, sectionId]);

  return elementRef;
};