/**
 * Sistema de eventos customizado para sincronização em tempo real
 * entre painel admin e páginas de produto
 */

export type ProductSyncEventType = 
  | 'product_added'
  | 'product_updated' 
  | 'product_deleted'
  | 'products_refreshed'
  | 'admin_action_completed';

export interface ProductSyncEvent {
  type: ProductSyncEventType;
  productId?: string;
  timestamp: number;
  source: 'admin' | 'frontend' | 'system';
  data?: any;
}

class ProductSyncEventManager {
  private listeners: Map<ProductSyncEventType, Set<(event: ProductSyncEvent) => void>> = new Map();
  private eventHistory: ProductSyncEvent[] = [];
  private maxHistorySize = 50;

  constructor() {
    console.log('[ProductSyncEventManager] Inicializando sistema de eventos de sincronização');
  }

  /**
   * Registra um listener para um tipo específico de evento
   */
  on(eventType: ProductSyncEventType, callback: (event: ProductSyncEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);
    console.log(`[ProductSyncEventManager] Listener registrado para evento: ${eventType}`);
    
    // Retorna função de cleanup
    return () => {
      this.listeners.get(eventType)?.delete(callback);
      console.log(`[ProductSyncEventManager] Listener removido para evento: ${eventType}`);
    };
  }

  /**
   * Emite um evento para todos os listeners registrados
   */
  emit(eventType: ProductSyncEventType, data?: any, source: 'admin' | 'frontend' | 'system' = 'system', productId?: string) {
    const event: ProductSyncEvent = {
      type: eventType,
      productId,
      timestamp: Date.now(),
      source,
      data
    };

    // Adicionar ao histórico
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    console.log(`[ProductSyncEventManager] Emitindo evento: ${eventType}`, event);

    // Notificar todos os listeners
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`[ProductSyncEventManager] Erro ao executar listener para ${eventType}:`, error);
        }
      });
    }

    // Também emitir evento genérico para listeners que querem ouvir tudo
    const allListeners = this.listeners.get('products_refreshed');
    if (allListeners && eventType !== 'products_refreshed') {
      allListeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`[ProductSyncEventManager] Erro ao executar listener genérico:`, error);
        }
      });
    }
  }

  /**
   * Remove todos os listeners de um tipo específico
   */
  removeAllListeners(eventType?: ProductSyncEventType) {
    if (eventType) {
      this.listeners.delete(eventType);
      console.log(`[ProductSyncEventManager] Todos os listeners removidos para: ${eventType}`);
    } else {
      this.listeners.clear();
      console.log('[ProductSyncEventManager] Todos os listeners removidos');
    }
  }

  /**
   * Retorna o histórico de eventos
   */
  getEventHistory(): ProductSyncEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Retorna eventos recentes (últimos N minutos)
   */
  getRecentEvents(minutesAgo: number = 5): ProductSyncEvent[] {
    const cutoff = Date.now() - (minutesAgo * 60 * 1000);
    return this.eventHistory.filter(event => event.timestamp > cutoff);
  }

  /**
   * Verifica se houve atividade recente
   */
  hasRecentActivity(minutesAgo: number = 1): boolean {
    return this.getRecentEvents(minutesAgo).length > 0;
  }

  /**
   * Limpa o histórico de eventos
   */
  clearHistory() {
    this.eventHistory = [];
    console.log('[ProductSyncEventManager] Histórico de eventos limpo');
  }
}

// Instância singleton global
export const productSyncEvents = new ProductSyncEventManager();

/**
 * Hook personalizado para usar o sistema de eventos
 */
export const useProductSyncEvents = () => {
  return {
    on: productSyncEvents.on.bind(productSyncEvents),
    emit: productSyncEvents.emit.bind(productSyncEvents),
    removeAllListeners: productSyncEvents.removeAllListeners.bind(productSyncEvents),
    getEventHistory: productSyncEvents.getEventHistory.bind(productSyncEvents),
    getRecentEvents: productSyncEvents.getRecentEvents.bind(productSyncEvents),
    hasRecentActivity: productSyncEvents.hasRecentActivity.bind(productSyncEvents),
    clearHistory: productSyncEvents.clearHistory.bind(productSyncEvents),
  };
};

export default productSyncEvents;

