import { useEffect } from 'react';
import { useLocation, useNavigationType, NavigationType } from 'react-router-dom';
import simpleHorizontalScroll from '@/lib/simpleHorizontalScroll';

/**
 * Hook para integrar o sistema simples de scroll horizontal com a navegação
 * Restaura automaticamente as posições quando volta para uma página
 */
export const usePageScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const currentPage = location.pathname + location.search;
    
    // Define página atual no sistema
    simpleHorizontalScroll.setCurrentPage(currentPage);
    
    // Se for navegação POP (voltar), restaura posições após delay
    if (navigationType === NavigationType.Pop) {
      console.log(`[PageScrollRestoration] 🔄 Voltando para: ${currentPage}`);
      
      // Aguarda elementos carregarem e restaura posições
      setTimeout(() => {
        simpleHorizontalScroll.restoreAllPositions();
      }, 300);
    } else {
      console.log(`[PageScrollRestoration] ➡️ Nova navegação para: ${currentPage}`);
    }
  }, [location.pathname, location.search, navigationType]);
};

