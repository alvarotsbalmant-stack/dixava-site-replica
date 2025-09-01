import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Tipos para o sistema de preloading
interface PreloadItem {
  route: string;
  priority: 'high' | 'medium' | 'low';
  delay: number;
  preloadFn: () => Promise<void>;
  isPreloaded: boolean;
}

interface ConnectionInfo {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
}

// Sistema de preloading inteligente
export class IntelligentPreloader {
  private preloadQueue: PreloadItem[] = [];
  private preloadedRoutes = new Set<string>();
  private isPreloading = false;
  private abortController: AbortController | null = null;
  private idleTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.setupPreloadQueue();
  }

  // Configurar fila de preloading com prioridades
  private setupPreloadQueue() {
    this.preloadQueue = [
      // Alta prioridade - preload imediato após idle
      {
        route: '/produto',
        priority: 'high',
        delay: 1000,
        preloadFn: () => this.preloadProductPage(),
        isPreloaded: false
      },
      {
        route: '/busca',
        priority: 'high', 
        delay: 2000,
        preloadFn: () => this.preloadSearchPage(),
        isPreloaded: false
      },
      {
        route: '/carrinho',
        priority: 'high',
        delay: 3000,
        preloadFn: () => this.preloadCartPage(),
        isPreloaded: false
      },

      // Média prioridade - preload após 5s
      {
        route: '/playstation',
        priority: 'medium',
        delay: 5000,
        preloadFn: () => this.preloadCategoryPage('playstation'),
        isPreloaded: false
      },
      {
        route: '/xbox',
        priority: 'medium',
        delay: 6000,
        preloadFn: () => this.preloadCategoryPage('xbox'),
        isPreloaded: false
      },
      {
        route: '/area-cliente',
        priority: 'medium',
        delay: 7000,
        preloadFn: () => this.preloadClientArea(),
        isPreloaded: false
      },

      // Baixa prioridade - preload após 15s
      {
        route: '/lista-desejos',
        priority: 'low',
        delay: 15000,
        preloadFn: () => this.preloadWishlist(),
        isPreloaded: false
      },
      {
        route: '/suporte',
        priority: 'low',
        delay: 20000,
        preloadFn: () => this.preloadSupport(),
        isPreloaded: false
      }
    ];
  }

  // Verificar se é seguro fazer preloading
  private isSafeToPreload(): boolean {
    try {
      // Verificar conexão de rede
      const connection = (navigator as any).connection as ConnectionInfo;
      
      if (connection) {
        // Não preload em conexões lentas
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          console.log('🚫 Preloading desabilitado: conexão lenta');
          return false;
        }
        
        // Não preload se data saver ativo
        if (connection.saveData) {
          console.log('🚫 Preloading desabilitado: modo economia de dados');
          return false;
        }
        
        // Não preload em conexões muito lentas
        if (connection.downlink && connection.downlink < 1.5) {
          console.log('🚫 Preloading desabilitado: velocidade baixa');
          return false;
        }
      }

      // Verificar capacidade do dispositivo
      const cores = navigator.hardwareConcurrency;
      if (cores && cores < 4) {
        console.log('🚫 Preloading limitado: dispositivo com poucos cores');
        return false;
      }

      // Verificar memória disponível (se suportado)
      const memory = (navigator as any).deviceMemory;
      if (memory && memory < 4) {
        console.log('🚫 Preloading limitado: pouca memória RAM');
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Erro ao verificar condições de preloading:', error);
      return true; // Assumir que é seguro se não conseguir verificar
    }
  }

  // Aguardar usuário ficar idle
  private waitForUserIdle(timeout: number = 2000): Promise<void> {
    return new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        // Usar requestIdleCallback se disponível
        (window as any).requestIdleCallback(() => {
          setTimeout(resolve, timeout);
        }, { timeout: timeout + 1000 });
      } else {
        // Fallback para setTimeout
        setTimeout(resolve, timeout);
      }
    });
  }

  // Iniciar preloading em background
  async startBackgroundPreloading() {
    if (this.isPreloading || !this.isSafeToPreload()) {
      return;
    }

    console.log('🚀 Iniciando preloading inteligente em background');
    this.isPreloading = true;
    this.abortController = new AbortController();

    try {
      // Aguardar usuário ficar idle
      await this.waitForUserIdle(1500);

      // Processar fila por prioridade
      await this.processPreloadQueue();
    } catch (error) {
      console.warn('Erro no preloading:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  // Processar fila de preloading
  private async processPreloadQueue() {
    // Ordenar por prioridade e delay
    const sortedQueue = [...this.preloadQueue].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.delay - b.delay;
    });

    for (const item of sortedQueue) {
      if (this.abortController?.signal.aborted) {
        console.log('🛑 Preloading cancelado');
        break;
      }

      if (this.preloadedRoutes.has(item.route)) {
        continue; // Já foi preloaded
      }

      try {
        // Aguardar delay específico do item
        await new Promise(resolve => setTimeout(resolve, item.delay));

        console.log(`⏳ Preloading ${item.route} (${item.priority} priority)`);
        
        // Executar preload
        await item.preloadFn();
        
        this.preloadedRoutes.add(item.route);
        item.isPreloaded = true;
        
        console.log(`✅ ${item.route} preloaded com sucesso`);
        
        // Pequena pausa entre preloads para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.warn(`❌ Erro no preload de ${item.route}:`, error);
      }
    }

    console.log('🎉 Preloading em background concluído');
  }

  // Funções específicas de preloading
  private async preloadProductPage(): Promise<void> {
    // Preload do chunk da página de produto
    await import('../pages/ProductPageSKU');
    
    // Preload de componentes críticos da página de produto com lazy loading
    await Promise.all([
      import('../components/Product/ProductHero'),
      import('../components/Product/Layout/ProductLayout'), // Desktop
      import('../components/Product/Mobile/ProductPageMobileMercadoLivre'), // Mobile
      import('../components/Product/ProductCTABottom'), // CTA Bottom
      import('../components/Product/ProductTabsEnhanced')
    ]);
    
    console.log('✅ Preload completo: Página de produto (desktop + mobile)');
  }

  private async preloadSearchPage(): Promise<void> {
    // Preload da página de busca
    await import('../pages/SearchResultsFinal');
  }

  private async preloadCartPage(): Promise<void> {
    // Preload do componente de carrinho
    await import('../components/Cart');
  }

  private async preloadCategoryPage(category: string): Promise<void> {
    // Preload de páginas de categoria
    if (category === 'playstation') {
      await import('../pages/platforms/PlayStationPageProfessionalV5');
    } else if (category === 'xbox') {
      await import('../pages/platforms/XboxPage4');
    }
  }

  private async preloadClientArea(): Promise<void> {
    // Preload da área do cliente
    await import('../pages/ClientArea');
  }

  private async preloadWishlist(): Promise<void> {
    // Preload da lista de desejos
    await import('../pages/WishlistPage');
  }

  private async preloadSupport(): Promise<void> {
    // Preload de páginas de suporte (se existirem)
    console.log('Preload de suporte - placeholder');
  }

  // Parar preloading
  stopPreloading() {
    if (this.abortController) {
      this.abortController.abort();
    }
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    this.isPreloading = false;
    console.log('🛑 Preloading interrompido');
  }

  // Verificar se rota foi preloaded
  isRoutePreloaded(route: string): boolean {
    return this.preloadedRoutes.has(route);
  }

  // Obter estatísticas
  getStats() {
    const total = this.preloadQueue.length;
    const preloaded = this.preloadedRoutes.size;
    const pending = total - preloaded;
    
    return {
      total,
      preloaded,
      pending,
      isActive: this.isPreloading,
      preloadedRoutes: Array.from(this.preloadedRoutes)
    };
  }
}

// Hook para usar o preloader
export const useIntelligentPreloader = () => {
  const location = useLocation();
  const preloaderRef = useRef<IntelligentPreloader | null>(null);

  // Inicializar preloader
  useEffect(() => {
    if (!preloaderRef.current) {
      preloaderRef.current = new IntelligentPreloader();
    }
  }, []);

  // Iniciar preloading quando estiver na home
  useEffect(() => {
    if (location.pathname === '/' && preloaderRef.current) {
      // Aguardar um pouco para garantir que a home carregou
      const timer = setTimeout(() => {
        preloaderRef.current?.startBackgroundPreloading();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      preloaderRef.current?.stopPreloading();
    };
  }, []);

  const getStats = useCallback(() => {
    return preloaderRef.current?.getStats() || null;
  }, []);

  const isRoutePreloaded = useCallback((route: string) => {
    return preloaderRef.current?.isRoutePreloaded(route) || false;
  }, []);

  const stopPreloading = useCallback(() => {
    preloaderRef.current?.stopPreloading();
  }, []);

  return {
    getStats,
    isRoutePreloaded,
    stopPreloading
  };
};

