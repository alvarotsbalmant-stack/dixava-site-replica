
// Sistema de restauração de scroll simplificado e robusto
interface ScrollPosition {
  x: number;
  y: number;
  timestamp: number;
}

class ScrollRestorationManager {
  private positions = new Map<string, ScrollPosition>();
  private isRestoring = false;
  private cleanupInterval: number;

  constructor() {
    // Limpa posições antigas a cada 10 minutos
    this.cleanupInterval = window.setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  savePosition(path: string, source: string = 'unknown'): void {
    if (this.isRestoring) {
      console.log(`[ScrollManager] Skipping save - currently restoring`);
      return;
    }

    const position: ScrollPosition = {
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    };

    // Salva qualquer posição de scroll
    this.positions.set(path, position);
    console.log(`[ScrollManager] ✅ SALVOU posição para ${path} (${source}): y=${position.y}px`);
  }

  async restorePosition(path: string, context: string = 'unknown', waitForContent: boolean = false): Promise<boolean> {
    const savedPosition = this.positions.get(path);
    
    if (!savedPosition) {
      console.log(`[ScrollManager] No saved position for ${path}`);
      return false;
    }

    // Verifica se não expirou (15 minutos)
    const now = Date.now();
    const maxAge = 15 * 60 * 1000;
    
    if (now - savedPosition.timestamp > maxAge) {
      console.log(`[ScrollManager] Position expired for ${path}`);
      this.positions.delete(path);
      return false;
    }

    // Se já está restaurando, aguarda um pouco e tenta novamente
    if (this.isRestoring) {
      console.log(`[ScrollManager] Already restoring, queuing for ${path}`);
      await new Promise(resolve => setTimeout(resolve, 200));
      if (this.isRestoring) {
        console.log(`[ScrollManager] Still restoring, aborting for ${path}`);
        return false;
      }
    }

    console.log(`[ScrollManager] 🎯 TENTANDO RESTAURAR posição para ${path}: ${savedPosition.y}px (context: ${context})`);
    
    this.isRestoring = true;

    return new Promise((resolve) => {
      const attemptRestore = (attempt: number = 1) => {
        console.log(`[ScrollManager] Restore attempt ${attempt} for ${path}`);
        
        window.scrollTo({
          left: savedPosition.x,
          top: savedPosition.y,
          behavior: 'auto'
        });

        // Verifica se conseguiu restaurar
        setTimeout(() => {
          const currentY = window.scrollY;
          const tolerance = 100; // Tolerância aumentada para lidar com conflitos CSS
          const success = Math.abs(currentY - savedPosition.y) <= tolerance;
          
          console.log(`[ScrollManager] 🏁 RESULTADO tentativa ${attempt}: target=${savedPosition.y}px, atual=${currentY}px, sucesso=${success}`);
          
          if (!success && attempt < 3) {
            // Tenta mais uma vez com delay maior
            setTimeout(() => attemptRestore(attempt + 1), 200);
          } else {
            this.isRestoring = false;
            resolve(success);
          }
        }, attempt === 1 ? 200 : 400); // Delay progressivo
      };

      if (waitForContent) {
        // Aguardar carregamento de conteúdo para homepage
        this.waitForContentLoaded().then(() => {
          console.log(`[ScrollManager] Content loaded, attempting restore`);
          attemptRestore();
        }).catch(() => {
          console.log(`[ScrollManager] Content loading timeout, attempting restore anyway`);
          attemptRestore();
        });
      } else {
        // Delay inicial menor para outras páginas
        setTimeout(() => attemptRestore(), 100);
      }
    });
  }

  private waitForContentLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = 10000; // 10 segundos timeout
      const checkInterval = 50; // Verificar a cada 50ms (mais frequente)
      let elapsed = 0;

      const checkContent = () => {
        // Verificar se elementos críticos existem e têm altura
        const criticalSelectors = [
          '[data-section="products"]',
          '[data-section="jogos-da-galera"]', 
          '.product-card',
          '[data-testid="section-renderer"]',
          '[data-testid="product-card"]',
          '.grid', // Para grids de produtos
          '.container' // Para containers principais
        ];

        const hasContent = criticalSelectors.some(selector => {
          const elements = document.querySelectorAll(selector);
          if (elements.length === 0) return false;
          
          // Verificar se pelo menos um elemento tem altura significativa
          return Array.from(elements).some(el => {
            const rect = el.getBoundingClientRect();
            return rect.height > 50;
          });
        });

        // Verificar se o documento está completamente carregado
        const isDocumentReady = document.readyState === 'complete';
        
        // Verificar se há pelo menos algum conteúdo visível na página
        const hasVisibleContent = document.body.scrollHeight > window.innerHeight;

        if (hasContent || isDocumentReady || hasVisibleContent) {
          console.log(`[ScrollManager] ✅ Conteúdo detectado após ${elapsed}ms (hasContent: ${hasContent}, docReady: ${isDocumentReady}, hasVisible: ${hasVisibleContent})`);
          resolve();
          return;
        }

        elapsed += checkInterval;
        if (elapsed >= timeout) {
          console.log(`[ScrollManager] ⏱️ Timeout de carregamento após ${elapsed}ms`);
          resolve(); // Resolver mesmo com timeout para continuar
          return;
        }

        setTimeout(checkContent, checkInterval);
      };

      // Verificar imediatamente
      checkContent();
    });
  }

  removePosition(path: string): void {
    if (this.positions.has(path)) {
      this.positions.delete(path);
      console.log(`[ScrollManager] Removed position for ${path}`);
    }
  }

  setIsRestoring(restoring: boolean): void {
    this.isRestoring = restoring;
  }

  getIsRestoring(): boolean {
    return this.isRestoring;
  }

  // Método de debug para verificar posições salvas
  debugPositions(): void {
    console.log('[ScrollManager] 🔍 DEBUG - Posições salvas:');
    for (const [path, position] of this.positions.entries()) {
      const age = Date.now() - position.timestamp;
      console.log(`  ${path}: y=${position.y}px (${Math.round(age/1000)}s ago)`);
    }
    console.log(`[ScrollManager] 🔍 DEBUG - isRestoring: ${this.isRestoring}`);
    console.log(`[ScrollManager] 🔍 DEBUG - Total positions: ${this.positions.size}`);
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 15 * 60 * 1000; // 15 minutos

    for (const [path, position] of this.positions.entries()) {
      if (now - position.timestamp > maxAge) {
        this.positions.delete(path);
        console.log(`[ScrollManager] Cleaned up expired position for ${path}`);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.positions.clear();
  }
}

// Instância singleton
const scrollManager = new ScrollRestorationManager();

// Expor globalmente para integração com outros sistemas
declare global {
  interface Window {
    scrollManager: typeof scrollManager;
  }
}

// Disponibilizar globalmente
if (typeof window !== 'undefined') {
  window.scrollManager = scrollManager;
}

// Exports simplificados
export const saveScrollPosition = (path: string, source?: string) => {
  scrollManager.savePosition(path, source);
};

export const restoreScrollPosition = (path: string, context?: string) => {
  return scrollManager.restorePosition(path, context);
};

export const removeScrollPosition = (path: string) => {
  scrollManager.removePosition(path);
};

export const setIsRestoring = (restoring: boolean) => {
  scrollManager.setIsRestoring(restoring);
};

export const getIsRestoring = (): boolean => {
  return scrollManager.getIsRestoring();
};

export const debugScrollPositions = () => {
  scrollManager.debugPositions();
};

export default scrollManager;
