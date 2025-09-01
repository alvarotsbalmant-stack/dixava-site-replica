/**
 * Sistema Simples de Scroll Horizontal
 * 
 * Funcionalidades:
 * - Salva posição de cada carrossel a cada 200ms
 * - Cache de 5 minutos por carrossel
 * - Restaura automaticamente quando volta à página
 * - Posição 0 se não houver dados salvos
 * - Dados mais recentes sobrescrevem os antigos
 */

interface CarouselPosition {
  position: number;
  timestamp: number;
  carouselId: string;
}

class SimpleHorizontalScroll {
  private positions: Map<string, CarouselPosition> = new Map();
  private saveTimers: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private readonly SAVE_INTERVAL = 200; // 200ms
  private currentPage: string = '';

  constructor() {
    this.loadFromStorage();
    this.startCleanupTimer();
  }

  /**
   * Define a página atual para contexto
   */
  setCurrentPage(page: string): void {
    this.currentPage = page;
    console.log(`[SimpleHorizontalScroll] 📄 Página atual: ${page}`);
  }

  /**
   * Registra um carrossel para rastreamento
   */
  trackCarousel(element: HTMLElement, carouselId: string): void {
    if (!element || !carouselId) return;

    console.log(`[SimpleHorizontalScroll] 🎯 Rastreando carrossel: ${carouselId}`);

    // Remove listener anterior se existir
    this.untrackCarousel(carouselId);

    // Adiciona listener de scroll
    const handleScroll = () => {
      this.schedulePositionSave(element, carouselId);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    // Armazena referência para cleanup
    (element as any).__scrollHandler = handleScroll;
    (element as any).__carouselId = carouselId;

    // Restaura posição se existir
    this.restoreCarouselPosition(element, carouselId);
  }

  /**
   * Para de rastrear um carrossel
   */
  untrackCarousel(carouselId: string): void {
    // Limpa timer se existir
    const timer = this.saveTimers.get(carouselId);
    if (timer) {
      clearTimeout(timer);
      this.saveTimers.delete(carouselId);
    }

    // Remove listener se existir
    const elements = document.querySelectorAll('[data-carousel-id]');
    elements.forEach(element => {
      const htmlElement = element as HTMLElement;
      if ((htmlElement as any).__carouselId === carouselId) {
        const handler = (htmlElement as any).__scrollHandler;
        if (handler) {
          htmlElement.removeEventListener('scroll', handler);
          delete (htmlElement as any).__scrollHandler;
          delete (htmlElement as any).__carouselId;
        }
      }
    });

    console.log(`[SimpleHorizontalScroll] 🗑️ Parou de rastrear: ${carouselId}`);
  }

  /**
   * Agenda salvamento da posição (debounce de 200ms)
   */
  private schedulePositionSave(element: HTMLElement, carouselId: string): void {
    // Limpa timer anterior
    const existingTimer = this.saveTimers.get(carouselId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Agenda novo salvamento
    const timer = window.setTimeout(() => {
      this.saveCarouselPosition(element, carouselId);
      this.saveTimers.delete(carouselId);
    }, this.SAVE_INTERVAL);

    this.saveTimers.set(carouselId, timer);
  }

  /**
   * Salva a posição atual do carrossel
   */
  private saveCarouselPosition(element: HTMLElement, carouselId: string): void {
    if (!element) return;

    const position = element.scrollLeft;
    const now = Date.now();
    const key = `${this.currentPage}:${carouselId}`;

    const carouselPosition: CarouselPosition = {
      position,
      timestamp: now,
      carouselId
    };

    this.positions.set(key, carouselPosition);
    this.saveToStorage();

    console.log(`[SimpleHorizontalScroll] 💾 Salvou ${carouselId}: posição ${position}px`);
  }

  /**
   * Restaura a posição de um carrossel
   */
  private restoreCarouselPosition(element: HTMLElement, carouselId: string): void {
    if (!element) return;

    const key = `${this.currentPage}:${carouselId}`;
    const saved = this.positions.get(key);

    if (!saved) {
      // Sem dados salvos, vai para posição 0
      element.scrollLeft = 0;
      console.log(`[SimpleHorizontalScroll] 📍 ${carouselId}: sem dados, posição 0`);
      return;
    }

    // Verifica se não expirou (5 minutos)
    const now = Date.now();
    if (now - saved.timestamp > this.CACHE_DURATION) {
      // Dados expirados, remove e vai para posição 0
      this.positions.delete(key);
      this.saveToStorage();
      element.scrollLeft = 0;
      console.log(`[SimpleHorizontalScroll] ⏰ ${carouselId}: dados expirados, posição 0`);
      return;
    }

    // Restaura posição salva
    element.scrollLeft = saved.position;
    console.log(`[SimpleHorizontalScroll] ✅ ${carouselId}: restaurado para ${saved.position}px`);
  }

  /**
   * Restaura todas as posições da página atual
   */
  restoreAllPositions(): void {
    console.log(`[SimpleHorizontalScroll] 🔄 Restaurando todas as posições da página: ${this.currentPage}`);

    // Busca todos os carrosséis com data-carousel-id
    const carousels = document.querySelectorAll('[data-carousel-id]');
    
    carousels.forEach(carousel => {
      const element = carousel as HTMLElement;
      const carouselId = element.getAttribute('data-carousel-id');
      
      if (carouselId) {
        this.restoreCarouselPosition(element, carouselId);
      }
    });
  }

  /**
   * Salva dados no localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.positions.entries());
      localStorage.setItem('simpleHorizontalScroll', JSON.stringify(data));
    } catch (error) {
      console.warn('[SimpleHorizontalScroll] Erro ao salvar no localStorage:', error);
    }
  }

  /**
   * Carrega dados do localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('simpleHorizontalScroll');
      if (data) {
        const entries = JSON.parse(data);
        this.positions = new Map(entries);
        console.log(`[SimpleHorizontalScroll] 📂 Carregou ${this.positions.size} posições do cache`);
      }
    } catch (error) {
      console.warn('[SimpleHorizontalScroll] Erro ao carregar do localStorage:', error);
      this.positions = new Map();
    }
  }

  /**
   * Timer para limpeza automática de dados expirados
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredData();
    }, 60000); // Limpa a cada 1 minuto
  }

  /**
   * Remove dados expirados
   */
  private cleanupExpiredData(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, position] of this.positions.entries()) {
      if (now - position.timestamp > this.CACHE_DURATION) {
        this.positions.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.saveToStorage();
      console.log(`[SimpleHorizontalScroll] 🧹 Limpou ${removedCount} dados expirados`);
    }
  }

  /**
   * Debug: mostra todas as posições salvas
   */
  debugPositions(): void {
    console.log('[SimpleHorizontalScroll] 🔍 DEBUG - Posições salvas:');
    
    if (this.positions.size === 0) {
      console.log('  Nenhuma posição salva');
      return;
    }

    for (const [key, position] of this.positions.entries()) {
      const age = Math.round((Date.now() - position.timestamp) / 1000);
      console.log(`  ${key}: ${position.position}px (${age}s atrás)`);
    }
  }

  /**
   * Limpa todos os dados
   */
  clearAllData(): void {
    this.positions.clear();
    this.saveToStorage();
    console.log('[SimpleHorizontalScroll] 🗑️ Todos os dados limpos');
  }
}

// Instância global
const simpleHorizontalScroll = new SimpleHorizontalScroll();

// Expor no window para debug
(window as any).simpleHorizontalScroll = simpleHorizontalScroll;

export default simpleHorizontalScroll;

