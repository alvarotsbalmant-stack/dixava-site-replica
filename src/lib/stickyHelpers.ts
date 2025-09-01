export interface StickyBounds {
  containerTop: number;
  containerBottom: number;
  referenceBottom: number;
}

export interface StickyElement {
  id: string;
  element: HTMLElement;
  bounds: StickyBounds;
  naturalOffset: number; // Offset natural do elemento para não grudar no topo
  originalWidth: number; // Largura original preservada
  originalHeight: number; // Altura original preservada
}

export class StickyManager {
  private elements: Map<string, StickyElement> = new Map();
  private scrollY = 0;
  private ticking = false;
  private headerHeight = 0;
  
  // SOLUÇÃO DEFINITIVA: Estado dinâmico inteligente para impedir arrombamento
  private elementStates: Map<string, { 
    isInStickyZone: boolean;    // Se está na zona sticky (pode mudar)
    isStuckAtLimit: boolean;    // Se está travado no limite (pode mudar)
    limitPosition: number;      // Posição absoluta do limite
    stuckViewportPosition: number; // Posição na viewport quando travou
  }> = new Map();

  constructor() {
    this.updateHeaderHeight();
  }

  addElement(id: string, element: HTMLElement, bounds: StickyBounds, naturalOffset: number = 100) {
    // Capturar dimensões originais antes de qualquer modificação
    const computedStyle = window.getComputedStyle(element);
    const originalWidth = element.offsetWidth;
    const originalHeight = element.offsetHeight;
    
    this.elements.set(id, {
      id,
      element,
      bounds,
      naturalOffset,
      originalWidth,
      originalHeight
    });
    
    // Setup inicial do elemento
    element.style.position = 'relative';
    element.style.zIndex = '10';
  }

  removeElement(id: string) {
    const stickyElement = this.elements.get(id);
    if (stickyElement) {
      // Reset element styles completely
      const element = stickyElement.element;
      element.style.position = '';
      element.style.top = '';
      element.style.left = '';
      element.style.width = '';
      element.style.zIndex = '';
      element.style.transform = '';
    }
    this.elements.delete(id);
  }

  updateScroll(scrollY: number) {
    this.scrollY = scrollY;
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.updateElements();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private updateElements() {
    this.elements.forEach((stickyElement) => {
      const { element, bounds, naturalOffset, originalWidth, originalHeight, id } = stickyElement;
      
      // Debug logging only in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[STICKY DEBUG] ${id}: scrollY=${this.scrollY}, bounds=`, bounds);
      }
      
      // Posição fixa desejada na tela (header + offset natural)
      const desiredFixedPosition = this.headerHeight + naturalOffset;
      
      // Get parent container for proper positioning context
      const parentElement = element.parentElement;
      if (!parentElement) {
        console.warn(`[STICKY] Parent element not found for ${id}`);
        return;
      }
      
      // NOVA LÓGICA: Calcular zonas de comportamento
      const stickyZoneStart = bounds.containerTop - desiredFixedPosition;
      const limitAbsolute = bounds.referenceBottom - originalHeight;
      const limitInViewport = limitAbsolute - this.scrollY;
      
      // Obter ou criar estado do elemento
      let state = this.elementStates.get(id);
      if (!state) {
        state = { 
          isInStickyZone: false,
          isStuckAtLimit: false,
          limitPosition: limitAbsolute,
          stuckViewportPosition: 0
        };
        this.elementStates.set(id, state);
      }
      
      // FASE 1: Determinar se está na zona sticky
      const inStickyZone = this.scrollY > stickyZoneStart;
      state.isInStickyZone = inStickyZone;
      
      if (!inStickyZone) {
        // ANTES DA ZONA STICKY: Posição relativa (natural)
        state.isStuckAtLimit = false; // Reset do travamento
        if (process.env.NODE_ENV === 'development') {
          console.log(`[STICKY DEBUG] ${id}: 🆓 ANTES DA ZONA - posição relativa`);
        }
        this.resetElementToRelative(element);
        return;
      }
      
      // FASE 2: Dentro da zona sticky - determinar comportamento
      const parentRect = parentElement.getBoundingClientRect();
      const leftPosition = parentRect.left + window.scrollX;
      
      // LÓGICA MASTER: Comportamento baseado na posição do limite
      let finalPosition;
      
      if (limitInViewport > desiredFixedPosition) {
        // CASO 1: Limite ainda não foi atingido - SEGUIR NORMALMENTE
        state.isStuckAtLimit = false;
        finalPosition = desiredFixedPosition;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[STICKY DEBUG] ${id}: 🆓 SEGUINDO - limitInViewport=${limitInViewport}, desired=${desiredFixedPosition}`);
        }
        
      } else if (limitInViewport >= 0) {
        // CASO 2: Limite visível na tela - TRAVAR NO LIMITE
        state.isStuckAtLimit = true;
        state.stuckViewportPosition = limitInViewport;
        finalPosition = limitInViewport;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[STICKY DEBUG] ${id}: 🔒 TRAVADO NO LIMITE - posição=${limitInViewport}`);
        }
        
      } else {
        // CASO 3: Limite passou da tela - MANTER NA ÚLTIMA POSIÇÃO CONHECIDA
        if (state.isStuckAtLimit) {
          // Já estava travado - calcular posição baseada no limite
          const positionBasedOnLimit = limitAbsolute - this.scrollY;
          
          if (positionBasedOnLimit >= -originalHeight) {
            // Ainda parcialmente visível - usar posição calculada
            finalPosition = positionBasedOnLimit;
          } else {
            // Completamente fora da tela - manter fora (pode ser negativo)
            finalPosition = positionBasedOnLimit;
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[STICKY DEBUG] ${id}: 🔒 FORA DA TELA - posição=${finalPosition} (baseada no limite)`);
          }
        } else {
          // Não estava travado ainda - comportamento normal
          finalPosition = desiredFixedPosition;
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[STICKY DEBUG] ${id}: 🆓 NORMAL - posição=${finalPosition}`);
          }
        }
      }
      
      // APLICAR POSIÇÃO FINAL - SEM LIMITAÇÕES ARTIFICIAIS
      this.setElementToFixed(element, finalPosition, leftPosition, originalWidth, originalHeight);
    });
  }

  // Helper methods for cleaner positioning logic
  private resetElementToRelative(element: HTMLElement) {
    element.style.position = 'relative';
    element.style.top = '';
    element.style.left = '';
    element.style.width = '';
    element.style.height = '';
    element.style.transform = '';
    element.style.zIndex = '10';
    element.style.visibility = 'visible'; // Garantir que elemento seja visível
  }

  private setElementToAbsolute(element: HTMLElement, top: number, width: number, height: number) {
    // CORREÇÃO: Adicionar verificações de segurança
    const safeTop = Math.max(0, top);
    const safeWidth = Math.max(100, width);
    const safeHeight = Math.max(50, height);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[STICKY DEBUG] setElementToAbsolute: top=${safeTop}, width=${safeWidth}, height=${safeHeight}`);
    }
    
    element.style.position = 'absolute';
    element.style.top = `${safeTop}px`;
    element.style.left = '0';
    element.style.width = `${safeWidth}px`;
    element.style.height = `${safeHeight}px`;
    element.style.transform = '';
    element.style.zIndex = '10';
    element.style.visibility = 'visible'; // Garantir que elemento seja visível
  }

  private setElementToAbsoluteWithLeft(element: HTMLElement, top: number, left: number, width: number, height: number) {
    // CORREÇÃO: Método específico para manter posição left quando mudar para absolute
    const safeTop = Math.max(0, top);
    const safeLeft = Math.max(0, left);
    const safeWidth = Math.max(100, width);
    const safeHeight = Math.max(50, height);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[STICKY DEBUG] setElementToAbsoluteWithLeft: top=${safeTop}, left=${safeLeft}, width=${safeWidth}, height=${safeHeight}`);
    }
    
    element.style.position = 'absolute';
    element.style.top = `${safeTop}px`;
    element.style.left = `${safeLeft}px`;
    element.style.width = `${safeWidth}px`;
    element.style.height = `${safeHeight}px`;
    element.style.transform = '';
    element.style.zIndex = '10';
    element.style.visibility = 'visible';
  }

  private setElementToFixed(element: HTMLElement, top: number, left: number, width: number, height: number) {
    // CORREÇÃO MASTER: Permitir posições naturais, mesmo negativas
    // Não forçar Math.max(0, ...) que causa o "empurrão do topo"
    const safeLeft = Math.max(0, left);
    const safeWidth = Math.max(100, width); // Largura mínima
    const safeHeight = Math.max(50, height); // Altura mínima
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[STICKY DEBUG] setElementToFixed: top=${top} (NATURAL), left=${safeLeft}, width=${safeWidth}, height=${safeHeight}`);
    }
    
    element.style.position = 'fixed';
    element.style.top = `${top}px`; // POSIÇÃO NATURAL - pode ser negativa!
    element.style.left = `${safeLeft}px`;
    element.style.width = `${safeWidth}px`;
    element.style.height = `${safeHeight}px`;
    element.style.transform = '';
    element.style.zIndex = '10';
    element.style.visibility = 'visible';
  }

  private updateHeaderHeight() {
    const header = document.querySelector('header') || 
                  document.querySelector('[role="banner"]') || 
                  document.querySelector('nav');
    this.headerHeight = header ? header.offsetHeight : 80;
  }

  calculateBounds(containerElement: HTMLElement, referenceElement: HTMLElement): StickyBounds {
    // Use more precise measurements to avoid layout issues
    const containerRect = containerElement.getBoundingClientRect();
    const referenceRect = referenceElement.getBoundingClientRect();
    
    // Get the current scroll position for accurate calculations
    const currentScrollY = window.scrollY;
    
    // Calculate bounds with better precision
    const bounds = {
      containerTop: containerRect.top + currentScrollY,
      containerBottom: containerRect.bottom + currentScrollY,
      referenceBottom: referenceRect.bottom + currentScrollY
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[STICKY DEBUG] Calculated bounds:', bounds, 'Current scroll:', currentScrollY);
    }
    
    return bounds;
  }

  refreshHeaderHeight() {
    this.updateHeaderHeight();
  }

  destroy() {
    this.elements.forEach((stickyElement) => {
      this.removeElement(stickyElement.id);
    });
    this.elements.clear();
  }
}

// Throttle otimizado para scroll suave
export const throttle = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: any[]) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, Math.max(0, delay - (currentTime - lastExecTime)));
    }
  };
};

// Debounce para resize
export const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};