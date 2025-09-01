
// Sistema ROBUSTO de scroll horizontal com delay de 0.5s para garantir carregamento
interface HorizontalScrollData {
  x: number;
  timestamp: number;
  sectionId?: string;
}

interface PageHorizontalScrolls {
  [elementKey: string]: HorizontalScrollData;
}

class HorizontalScrollManager {
  private horizontalPositions = new Map<string, PageHorizontalScrolls>();
  private trackedElements = new Set<HTMLElement>();
  private isRestoring = false;
  private currentPath: string = '';
  
  constructor() {
    console.log('[HorizontalScrollManager] ✅ Sistema iniciado com delay de 0.5s');
  }

  // Método principal para rastrear um elemento específico
  trackElement(element: HTMLElement, sectionId?: string): void {
    if (!element || this.trackedElements.has(element)) return;
    
    this.trackedElements.add(element);
    
    // Adiciona listener de scroll para salvar posição automaticamente
    const savePosition = () => {
      if (this.isRestoring || !this.currentPath) return;
      this.saveElementPosition(element, sectionId);
    };
    
    element.addEventListener('scroll', savePosition, { passive: true });
    
    // Salva referência para cleanup
    (element as any).__horizontalScrollCleanup = () => {
      element.removeEventListener('scroll', savePosition);
      this.trackedElements.delete(element);
    };
    
    console.log(`[HorizontalScrollManager] 📍 Elemento rastreado: ${sectionId || 'unnamed'}`);
  }

  // Para de rastrear um elemento
  untrackElement(element: HTMLElement): void {
    if (!element || !this.trackedElements.has(element)) return;
    
    const cleanup = (element as any).__horizontalScrollCleanup;
    if (cleanup) {
      cleanup();
      delete (element as any).__horizontalScrollCleanup;
    }
    
    console.log(`[HorizontalScrollManager] 🚫 Elemento removido do rastreamento`);
  }

  // Salva posição de um elemento específico
  private saveElementPosition(element: HTMLElement, sectionId?: string): void {
    if (!element || !this.currentPath) return;
    
    // Só salva se o elemento tem scroll horizontal
    if (element.scrollWidth <= element.clientWidth) return;
    
    const pageScrolls = this.horizontalPositions.get(this.currentPath) || {};
    const elementKey = sectionId || this.generateElementKey(element);
    
    pageScrolls[elementKey] = {
      x: element.scrollLeft,
      timestamp: Date.now(),
      sectionId
    };
    
    this.horizontalPositions.set(this.currentPath, pageScrolls);
    console.log(`[HorizontalScrollManager] 💾 Posição salva para ${elementKey}: ${element.scrollLeft}px`);
  }

  // Gera uma chave única para o elemento baseada em sua posição no DOM
  private generateElementKey(element: HTMLElement): string {
    // Usa data attributes se disponível
    if (element.dataset.section) {
      return `section-${element.dataset.section}`;
    }
    
    // Usa ID se disponível
    if (element.id) {
      return `id-${element.id}`;
    }
    
    // Fallback: posição no DOM
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      return `element-${index}`;
    }
    
    return 'unknown-element';
  }

  // Define a página atual
  setCurrentPage(path: string): void {
    if (path !== this.currentPath) {
      console.log(`[HorizontalScrollManager] 📄 Página alterada: ${this.currentPath} → ${path}`);
      this.currentPath = path;
    }
  }

  // Restaura posições horizontais para a página atual COM DELAY DE 0.5s
  async restoreCurrentPageHorizontalPositions(): Promise<void> {
    if (!this.currentPath) return;
    
    const savedData = this.horizontalPositions.get(this.currentPath);
    if (!savedData || Object.keys(savedData).length === 0) {
      console.log(`[HorizontalScrollManager] 📍 Nenhuma posição horizontal salva para ${this.currentPath}`);
      return;
    }

    console.log(`[HorizontalScrollManager] 🎯 INICIANDO restauração horizontal para ${this.currentPath} (aguardando 0.5s)`);
    
    // DELAY DE 0.5s PARA GARANTIR QUE AS SEÇÕES CARREGUEM
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Aguarda carregamento completo da página
    await this.waitForSectionsToLoad();
    
    this.isRestoring = true;
    
    try {
      console.log(`[HorizontalScrollManager] 🔄 EXECUTANDO restauração após delay`);
      
      // Restaura elementos rastreados primeiro
      for (const element of this.trackedElements) {
        const elementKey = this.generateElementKey(element);
        const scrollData = savedData[elementKey];
        
        if (scrollData) {
          await this.restoreElementPosition(element, scrollData, elementKey);
        }
      }
      
      // Depois tenta restaurar outros elementos por seletor
      const allScrollElements = document.querySelectorAll('.overflow-x-auto, .overflow-x-scroll');
      for (let i = 0; i < allScrollElements.length; i++) {
        const element = allScrollElements[i] as HTMLElement;
        if (!this.trackedElements.has(element)) {
          const fallbackKey = `element-${i}`;
          const scrollData = savedData[fallbackKey];
          if (scrollData) {
            await this.restoreElementPosition(element, scrollData, fallbackKey);
          }
        }
      }
      
    } finally {
      setTimeout(() => {
        this.isRestoring = false;
        console.log(`[HorizontalScrollManager] ✅ Restauração horizontal COMPLETA para ${this.currentPath}`);
      }, 300);
    }
  }

  // Restaura posição de um elemento específico
  private async restoreElementPosition(element: HTMLElement, scrollData: HorizontalScrollData, elementKey: string): Promise<void> {
    if (!element || element.scrollWidth <= element.clientWidth) return;
    
    console.log(`[HorizontalScrollManager] 🔄 Restaurando ${elementKey}: ${scrollData.x}px`);
    
    // Aplica scroll imediatamente
    element.scrollLeft = scrollData.x;
    
    // Verifica se funcionou após um delay
    setTimeout(() => {
      const currentX = element.scrollLeft;
      const tolerance = 10;
      const success = Math.abs(currentX - scrollData.x) <= tolerance;
      
      if (success) {
        console.log(`[HorizontalScrollManager] ✅ SUCESSO! ${elementKey} restaurado: ${currentX}px`);
      } else {
        console.log(`[HorizontalScrollManager] ⚠️ TENTATIVA 2 ${elementKey}. Target: ${scrollData.x}px, Atual: ${currentX}px`);
        // Tenta mais uma vez com força
        element.scrollTo({ left: scrollData.x, behavior: 'auto' });
        
        // Verifica novamente
        setTimeout(() => {
          const finalX = element.scrollLeft;
          if (Math.abs(finalX - scrollData.x) <= tolerance) {
            console.log(`[HorizontalScrollManager] ✅ RECUPERADO! ${elementKey}: ${finalX}px`);
          } else {
            console.log(`[HorizontalScrollManager] ❌ FALHOU ${elementKey}. Final: ${finalX}px`);
          }
        }, 100);
      }
    }, 150);
  }

  // Aguarda carregamento das seções com produtos
  private async waitForSectionsToLoad(): Promise<void> {
    return new Promise((resolve) => {
      const maxWaitTime = 3000; // 3 segundos máximo
      const checkInterval = 100; // Verifica a cada 100ms
      let elapsed = 0;
      
      const checkSections = () => {
        // Verifica se seções críticas existem e têm conteúdo
        const criticalSelectors = [
          '[data-section="featured-products"]',
          '[data-section="related-products"]',
          '.product-card',
          '[data-testid="horizontal-scroll-featured-products"]',
          '[data-testid="horizontal-scroll-related-products"]',
          '.overflow-x-auto'
        ];

        const hasSections = criticalSelectors.some(selector => {
          const elements = document.querySelectorAll(selector);
          if (elements.length === 0) return false;
          
          // Verifica se pelo menos um elemento tem largura significativa
          return Array.from(elements).some(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 200; // Seções de produtos devem ter pelo menos 200px
          });
        });

        // Verifica se há elementos com scroll horizontal disponível
        const hasScrollableContent = Array.from(document.querySelectorAll('.overflow-x-auto')).some(el => {
          const element = el as HTMLElement;
          return element.scrollWidth > element.clientWidth;
        });

        if (hasSections || hasScrollableContent) {
          console.log(`[HorizontalScrollManager] ✅ Seções carregadas após ${elapsed}ms`);
          resolve();
          return;
        }

        elapsed += checkInterval;
        if (elapsed >= maxWaitTime) {
          console.log(`[HorizontalScrollManager] ⏱️ Timeout de carregamento de seções após ${elapsed}ms - continuando mesmo assim`);
          resolve();
          return;
        }

        setTimeout(checkSections, checkInterval);
      };

      checkSections();
    });
  }

  // Debug: mostra todas as posições horizontais salvas
  debugHorizontalPositions(): void {
    console.log('[HorizontalScrollManager] 🔍 DEBUG - Posições horizontais salvas:');
    for (const [path, pageScrolls] of this.horizontalPositions.entries()) {
      console.log(`  📄 ${path}:`);
      for (const [elementKey, scrollData] of Object.entries(pageScrolls)) {
        const ageSeconds = Math.round((Date.now() - scrollData.timestamp) / 1000);
        console.log(`    ${elementKey}: ${scrollData.x}px (${ageSeconds}s atrás)`);
      }
    }
    console.log(`  Página atual: ${this.currentPath}`);
    console.log(`  Elementos rastreados: ${this.trackedElements.size}`);
    console.log(`  Restaurando: ${this.isRestoring}`);
  }

  // Remove posições horizontais de uma página
  clearPageHorizontalPositions(path: string): void {
    this.horizontalPositions.delete(path);
    console.log(`[HorizontalScrollManager] 🗑️ Posições horizontais removidas para: ${path}`);
  }

  // Limpa o sistema
  destroy(): void {
    // Limpa todos os listeners
    for (const element of this.trackedElements) {
      this.untrackElement(element);
    }
    
    this.horizontalPositions.clear();
    this.trackedElements.clear();
    console.log('[HorizontalScrollManager] 🔌 Sistema horizontal destruído');
  }
}

// Instância global
const horizontalScrollManager = new HorizontalScrollManager();

// Expor globalmente para debug
declare global {
  interface Window {
    horizontalScrollManager: typeof horizontalScrollManager;
  }
}

if (typeof window !== 'undefined') {
  window.horizontalScrollManager = horizontalScrollManager;
}

export default horizontalScrollManager;
