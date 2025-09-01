import { useEffect } from 'react';
import { useLocation, useNavigationType, NavigationType } from 'react-router-dom';
import simpleScrollManager from '@/lib/simpleScrollManager';
import horizontalScrollManager from '@/lib/horizontalScrollManager';
import pageStateManager from '@/lib/pageStateManager';

/**
 * Hook simples e robusto para restauração de scroll
 * - Salva posição vertical a cada 20ms automaticamente
 * - Salva posições horizontais de seções a cada 20ms
 * - Restaura posições após 500ms do carregamento
 * - Sistema obrigatório de restauração para ambos os eixos
 */
export const useSimpleScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  // Desabilita restauração nativa do navegador
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Gerencia mudanças de página
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    console.log(`[SimpleScrollRestoration] 🚀 NOVA PÁGINA: ${currentPath} (${navigationType})`);
    
    // Define a página atual em ambos os managers
    simpleScrollManager.setCurrentPage(currentPath);
    horizontalScrollManager.setCurrentPage(currentPath);
    
    // Sync with page state manager
    const scrollPosition = { x: window.scrollX, y: window.scrollY };
    pageStateManager.saveScrollPosition(currentPath, scrollPosition);
    
    // Lógica baseada no tipo de navegação
    if (navigationType === NavigationType.Pop) {
      // VOLTAR - restaura posições obrigatoriamente (vertical + horizontal)
      console.log(`[SimpleScrollRestoration] ⬅️ VOLTAR detectado - restaurando posições RAPIDAMENTE`);
      
      // Restauração imediata para melhor UX
      const savedPosition = simpleScrollManager.getPagePosition(currentPath);
      if (savedPosition) {
        // Restauração instantânea primeiro
        window.scrollTo({
          left: 0,
          top: savedPosition.y,
          behavior: 'auto'
        });
        console.log(`[SimpleScrollRestoration] ⚡ Restauração instantânea para ${savedPosition.y}px`);
      }
      
      // Depois executa a restauração robusta em paralelo
      Promise.all([
        simpleScrollManager.restoreCurrentPagePosition(),
        horizontalScrollManager.restoreCurrentPageHorizontalPositions()
      ]).then(() => {
        console.log(`[SimpleScrollRestoration] ✅ Restauração robusta finalizada para ${currentPath}`);
      });
      
    } else {
      // NOVA NAVEGAÇÃO - vai para topo/esquerda mas NÃO limpa posições salvas
      console.log(`[SimpleScrollRestoration] ➡️ NOVA navegação - indo para topo (mantendo posições salvas)`);
      // REMOVIDO: simpleScrollManager.clearPagePosition(currentPath);
      // REMOVIDO: horizontalScrollManager.clearPageHorizontalPositions(currentPath);
      window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    }
    
  }, [location.pathname, location.search, navigationType]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      // Não destrói o manager pois é global, apenas limpa listeners se necessário
    };
  }, []);
};