
import { useCallback } from 'react';

/**
 * Hook simplificado para operações manuais de scroll
 * Usa o scroll restoration nativo do navegador
 */
export const useScrollPosition = () => {
  // Função para salvar posição manualmente (para casos específicos)
  const saveScrollPosition = useCallback(() => {
    const scrollPos = {
      x: window.scrollX,
      y: window.scrollY,
      path: window.location.pathname,
      timestamp: Date.now()
    };
    
    try {
      const key = `scrollPos_${window.location.pathname}`;
      sessionStorage.setItem(key, JSON.stringify(scrollPos));
      console.log(`[ScrollPosition] Manual save: ${scrollPos.y} for ${window.location.pathname}`);
    } catch (error) {
      console.warn('[ScrollPosition] Failed to manually save:', error);
    }
  }, []);

  // Função para restaurar posição manualmente
  const restoreScrollPosition = useCallback(() => {
    try {
      const key = `scrollPos_${window.location.pathname}`;
      const scrollPosData = sessionStorage.getItem(key);
      
      if (scrollPosData) {
        const scrollPos = JSON.parse(scrollPosData);
        
        // Verifica se não expirou (30 minutos)
        const now = Date.now();
        const expirationTime = 30 * 60 * 1000; // 30 minutos
        
        if (now - scrollPos.timestamp <= expirationTime) {
          setTimeout(() => {
            window.scrollTo({
              left: scrollPos.x,
              top: scrollPos.y,
              behavior: 'auto'
            });
            console.log(`[ScrollPosition] Manual restore: ${scrollPos.y}`);
          }, 100);
        } else {
          // Remove dados expirados
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('[ScrollPosition] Failed to manually restore:', error);
    }
  }, []);

  return {
    saveScrollPosition,
    restoreScrollPosition
  };
};
