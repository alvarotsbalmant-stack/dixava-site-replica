import { useEffect, useRef, useCallback } from 'react';

interface ContentLoadingState {
  layoutLoaded: boolean;
  sectionsLoaded: boolean;
  specialSectionsLoaded: boolean;
  productsLoaded: boolean;
  imagesLoaded: boolean;
}

interface UseContentLoadingOptions {
  onContentReady?: () => void;
  timeout?: number;
}

/**
 * Hook para detectar quando todo o conteúdo da página foi carregado
 * Monitora layout, seções, produtos e imagens antes de considerar pronto
 */
export const useContentLoading = (
  isLoading: boolean,
  productsLoading: boolean,
  sectionsLoading: boolean,
  specialSectionsLoading: boolean,
  options: UseContentLoadingOptions = {}
) => {
  const { onContentReady, timeout = 10000 } = options;
  const loadingStateRef = useRef<ContentLoadingState>({
    layoutLoaded: false,
    sectionsLoaded: false,
    specialSectionsLoaded: false,
    productsLoaded: false,
    imagesLoaded: false,
  });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isReadyRef = useRef(false);

  // Função para verificar se tudo está carregado
  const checkIfReady = useCallback(() => {
    const state = loadingStateRef.current;
    const allLoaded = Object.values(state).every(loaded => loaded);
    
    if (allLoaded && !isReadyRef.current) {
      isReadyRef.current = true;
      console.log('[ContentLoading] All content loaded, triggering callback');
      onContentReady?.();
    }
    
    return allLoaded;
  }, [onContentReady]);

  // Função para aguardar carregamento de imagens
  const waitForImages = useCallback(() => {
    const images = document.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) {
        return Promise.resolve();
      }
      
      return new Promise<void>((resolve) => {
        const onLoad = () => {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onLoad);
          resolve();
        };
        
        img.addEventListener('load', onLoad);
        img.addEventListener('error', onLoad);
        
        // Timeout para imagens que não carregam
        setTimeout(onLoad, 3000);
      });
    });

    Promise.all(imagePromises).then(() => {
      console.log('[ContentLoading] All images loaded');
      loadingStateRef.current.imagesLoaded = true;
      checkIfReady();
    });
  }, [checkIfReady]);

  // Função para aguardar elementos DOM críticos
  const waitForCriticalElements = useCallback(() => {
    const checkElements = () => {
      // Verificar se elementos críticos existem
      const criticalSelectors = [
        '[data-section="products"]',
        '[data-section="jogos-da-galera"]',
        '.product-card',
        '[data-testid="section-renderer"]'
      ];

      const elementsExist = criticalSelectors.some(selector => {
        const elements = document.querySelectorAll(selector);
        return elements.length > 0;
      });

      if (elementsExist) {
        console.log('[ContentLoading] Critical elements found in DOM');
        return true;
      }

      return false;
    };

    // Verificar imediatamente
    if (checkElements()) {
      waitForImages();
      return;
    }

    // Usar MutationObserver para detectar quando elementos são adicionados
    const observer = new MutationObserver(() => {
      if (checkElements()) {
        observer.disconnect();
        waitForImages();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup após timeout
    setTimeout(() => {
      observer.disconnect();
      console.log('[ContentLoading] Timeout waiting for critical elements');
      loadingStateRef.current.imagesLoaded = true;
      checkIfReady();
    }, 5000);
  }, [waitForImages]);

  // Monitorar mudanças nos estados de loading
  useEffect(() => {
    loadingStateRef.current.layoutLoaded = !isLoading;
    loadingStateRef.current.sectionsLoaded = !sectionsLoading;
    loadingStateRef.current.specialSectionsLoaded = !specialSectionsLoading;
    loadingStateRef.current.productsLoaded = !productsLoading;

    console.log('[ContentLoading] Loading states updated:', loadingStateRef.current);

    // Se todos os dados estão carregados, aguardar elementos DOM
    if (!isLoading && !sectionsLoading && !specialSectionsLoading && !productsLoading) {
      console.log('[ContentLoading] Data loading complete, waiting for DOM elements');
      
      // Aguardar próximo tick para garantir que o DOM foi atualizado
      setTimeout(() => {
        waitForCriticalElements();
      }, 100);
    }
  }, [isLoading, sectionsLoading, specialSectionsLoading, productsLoading, waitForCriticalElements]);

  // Timeout de segurança
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!isReadyRef.current) {
        console.log('[ContentLoading] Timeout reached, forcing ready state');
        isReadyRef.current = true;
        onContentReady?.();
      }
    }, timeout);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeout, onContentReady]);

  // Reset quando a página muda
  useEffect(() => {
    return () => {
      isReadyRef.current = false;
      loadingStateRef.current = {
        layoutLoaded: false,
        sectionsLoaded: false,
        specialSectionsLoaded: false,
        productsLoaded: false,
        imagesLoaded: false,
      };
    };
  }, []);

  return {
    isContentReady: isReadyRef.current,
    loadingState: loadingStateRef.current
  };
};

