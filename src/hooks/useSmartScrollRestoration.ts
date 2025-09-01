import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

interface ScrollCache {
  [path: string]: ScrollPosition;
}

/**
 * Hook inteligente para scroll restoration
 * - Coleta posição a cada 200ms (throttled)
 * - Salva no sessionStorage por rota
 * - Restaura automaticamente quando volta
 * - Funciona perfeitamente com cache agressivo
 */
export const useSmartScrollRestoration = () => {
  const location = useLocation();
  const throttleRef = useRef<NodeJS.Timeout | null>(null);
  const isRestoringRef = useRef(false);
  const currentPathRef = useRef(location.pathname);

  // Salvar posição atual com throttle de 20  // Função para salvar posição com throttle
  const saveScrollPosition = () => {
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }

    throttleRef.current = setTimeout(() => {
      const currentPath = currentPathRef.current;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      // Só salva se houve scroll significativo (> 10px)
      if (scrollY > 10) {
        try {
          const existingCache = sessionStorage.getItem('uti-scroll-cache');
          const cache: ScrollCache = existingCache ? JSON.parse(existingCache) : {};
          
          cache[currentPath] = {
            x: scrollX,
            y: scrollY,
            timestamp: Date.now()
          };

          sessionStorage.setItem('uti-scroll-cache', JSON.stringify(cache));
          
          // Debug log DETALHADO
          console.log(`[ScrollRestoration] 📍 SALVANDO posição para ${currentPath}:`, {
            x: scrollX,
            y: scrollY,
            documentHeight,
            viewportHeight,
            timestamp: new Date().toLocaleTimeString()
          });
        } catch (error) {
          console.warn('[ScrollRestoration] Erro ao salvar posição:', error);
        }
      }
    }, 200); // Throttle de 200ms
  };

  // Restaurar posição salva
  const restoreScrollPosition = (path: string): boolean => {
    try {
      const existingCache = sessionStorage.getItem('uti-scroll-cache');
      if (!existingCache) return false;

      const cache: ScrollCache = JSON.parse(existingCache);
      const savedPosition = cache[path];

      if (savedPosition) {
        // Verificar se a posição não é muito antiga (máximo 1 hora)
        const isRecent = Date.now() - savedPosition.timestamp < 60 * 60 * 1000;
        
        if (isRecent) {
          isRestoringRef.current = true;
          
          // Capturar informações do ambiente atual
          const currentScrollX = window.scrollX;
          const currentScrollY = window.scrollY;
          const documentHeight = document.documentElement.scrollHeight;
          const viewportHeight = window.innerHeight;
          
          // 🔧 CORREÇÃO DO HEADER FIXO
          // Detectar altura do header fixo apenas se há scroll
          let headerOffset = 0;
          if (savedPosition.y > 0) {
            const fixedHeader = document.querySelector('[class*="fixed"][class*="top-0"]') as HTMLElement;
            if (fixedHeader) {
              headerOffset = fixedHeader.offsetHeight;
              console.log(`[ScrollRestoration] 📏 Header fixo detectado: ${headerOffset}px`);
            }
          }
          
          // Posição corrigida considerando o header fixo
          const correctedY = Math.max(0, savedPosition.y - headerOffset);
          const correctedPosition = { x: savedPosition.x, y: correctedY };
          
          console.log(`[ScrollRestoration] 🔄 RESTAURANDO posição para ${path}:`, {
            salva: savedPosition,
            atual: { x: currentScrollX, y: currentScrollY },
            headerOffset,
            corrigida: correctedPosition,
            diferenca: { x: savedPosition.x - currentScrollX, y: correctedY - currentScrollY },
            documentHeight,
            viewportHeight,
            timestamp: new Date().toLocaleTimeString()
          });
          
          // SOLUÇÃO ROBUSTA: Desabilitar TODAS as animações temporariamente
          const disableAnimationsStyle = document.createElement('style');
          disableAnimationsStyle.id = 'disable-animations-temp';
          disableAnimationsStyle.textContent = `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
              scroll-behavior: auto !important;
            }
            html {
              scroll-behavior: auto !important;
            }
          `;
          document.head.appendChild(disableAnimationsStyle);
          
          // Forçar reflow para aplicar os estilos
          document.body.offsetHeight;
          
          // Restauração INSTANTÂNEA com correção de header
          window.scrollTo(correctedPosition.x, correctedPosition.y);
          
          // Verificar se a restauração foi bem-sucedida
          setTimeout(() => {
            const finalScrollX = window.scrollX;
            const finalScrollY = window.scrollY;
            const precision = Math.abs(correctedPosition.y - finalScrollY);
            
            console.log(`[ScrollRestoration] ✅ VERIFICAÇÃO pós-restauração:`, {
              esperado: correctedPosition,
              obtido: { x: finalScrollX, y: finalScrollY },
              diferenca: { x: correctedPosition.x - finalScrollX, y: correctedPosition.y - finalScrollY },
              precisao: `${precision}px`,
              sucesso: precision <= 5
            });
            
            // Se ainda há imprecisão significativa, tentar correção
            if (precision > 5) {
              console.warn(`[ScrollRestoration] ⚠️ Imprecisão detectada (${precision}px), aplicando correção...`);
              window.scrollTo(correctedPosition.x, correctedPosition.y);
            }
          }, 50);
          
          // Remover estilos de desabilitação após 2 frames
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const tempStyle = document.getElementById('disable-animations-temp');
              if (tempStyle) {
                tempStyle.remove();
              }
            });
          });
          
          // Reset flag imediatamente
          isRestoringRef.current = false;
          
          return true;
        }
      }
    } catch (error) {
      console.warn('[ScrollRestoration] Erro ao restaurar posição:', error);
    }
    
    return false;
  };

  // Limpar cache antigo (posições > 1 hora)
  const cleanOldCache = () => {
    try {
      const existingCache = sessionStorage.getItem('uti-scroll-cache');
      if (!existingCache) return;

      const cache: ScrollCache = JSON.parse(existingCache);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      const cleanedCache: ScrollCache = {};
      let hasChanges = false;

      Object.entries(cache).forEach(([path, position]) => {
        if (now - position.timestamp < oneHour) {
          cleanedCache[path] = position;
        } else {
          hasChanges = true;
        }
      });

      if (hasChanges) {
        sessionStorage.setItem('uti-scroll-cache', JSON.stringify(cleanedCache));
        console.log('[ScrollRestoration] Cache antigo limpo');
      }
    } catch (error) {
      console.warn('[ScrollRestoration] Erro ao limpar cache:', error);
    }
  };

  // Effect para mudanças de rota
  useEffect(() => {
    const newPath = location.pathname;
    const previousPath = currentPathRef.current;

    // Se mudou de rota, tentar restaurar posição
    if (newPath !== previousPath) {
      console.log(`[ScrollRestoration] Mudança de rota: ${previousPath} → ${newPath}`);
      
      // Tentar restaurar posição da nova rota
      const restored = restoreScrollPosition(newPath);
      
      if (!restored) {
        // Se não há posição salva, scroll para o topo INSTANTANEAMENTE
        const disableAnimationsStyle = document.createElement('style');
        disableAnimationsStyle.id = 'disable-animations-temp-top';
        disableAnimationsStyle.textContent = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
            scroll-behavior: auto !important;
          }
          html {
            scroll-behavior: auto !important;
          }
        `;
        document.head.appendChild(disableAnimationsStyle);
        
        // Forçar reflow
        document.body.offsetHeight;
        
        window.scrollTo(0, 0);
        
        // Remover estilos após 2 frames
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const tempStyle = document.getElementById('disable-animations-temp-top');
            if (tempStyle) {
              tempStyle.remove();
            }
          });
        });
      }
    }

    // Atualizar referência da rota atual
    currentPathRef.current = newPath;

    // Limpar cache antigo periodicamente
    cleanOldCache();
  }, [location.pathname]);

  // Effect para monitorar scroll
  useEffect(() => {
    const handleScroll = () => {
      saveScrollPosition();
    };

    // Adicionar listener de scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  // API pública para controle manual (se necessário)
  return {
    savePosition: () => saveScrollPosition(),
    restorePosition: (path?: string) => restoreScrollPosition(path || location.pathname),
    clearCache: () => {
      try {
        sessionStorage.removeItem('uti-scroll-cache');
        console.log('[ScrollRestoration] Cache limpo manualmente');
      } catch (error) {
        console.warn('[ScrollRestoration] Erro ao limpar cache:', error);
      }
    }
  };
};

