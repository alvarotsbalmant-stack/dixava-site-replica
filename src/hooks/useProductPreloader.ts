import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useProductCache } from './useProductCache';
import { useProductsEnhanced } from './useProductsEnhanced';

// Interface para item de preload de produto
interface ProductPreloadItem {
  productId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: 'homepage' | 'related' | 'category' | 'search';
  delay: number;
  isPreloaded: boolean;
}

// Interface para configuração de conexão
interface ConnectionInfo {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
}

// Sistema de preload inteligente para produtos
export class ProductPreloader {
  private preloadQueue: ProductPreloadItem[] = [];
  private preloadedProducts = new Set<string>();
  private isPreloading = false;
  private abortController: AbortController | null = null;
  private productCache: any;
  private productsApi: any;

  constructor(productCache: any, productsApi: any) {
    this.productCache = productCache;
    this.productsApi = productsApi;
  }

  // Verificar se é seguro fazer preload
  private isSafeToPreload(): boolean {
    try {
      // Verificar conexão de rede
      const connection = (navigator as any).connection as ConnectionInfo;
      
      if (connection) {
        // Não preload em conexões lentas
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          console.log('🚫 Product preloading desabilitado: conexão lenta');
          return false;
        }
        
        // Não preload se data saver ativo
        if (connection.saveData) {
          console.log('🚫 Product preloading desabilitado: modo economia de dados');
          return false;
        }
        
        // Não preload em conexões muito lentas
        if (connection.downlink && connection.downlink < 1.5) {
          console.log('🚫 Product preloading desabilitado: velocidade baixa');
          return false;
        }
      }

      // Verificar capacidade do dispositivo
      const cores = navigator.hardwareConcurrency;
      if (cores && cores < 4) {
        console.log('🚫 Product preloading limitado: dispositivo com poucos cores');
        return false;
      }

      // Verificar memória disponível
      const memory = (navigator as any).deviceMemory;
      if (memory && memory < 4) {
        console.log('🚫 Product preloading limitado: pouca memória RAM');
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Erro ao verificar condições de preloading:', error);
      return true;
    }
  }

  // Aguardar usuário ficar idle
  private waitForUserIdle(timeout: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          setTimeout(resolve, timeout);
        }, { timeout: timeout + 500 });
      } else {
        setTimeout(resolve, timeout);
      }
    });
  }

  // Adicionar produtos da homepage à fila de preload
  addHomepageProducts(productIds: string[]) {
    console.log('🏠 Adicionando produtos da homepage ao preload:', productIds.length);
    
    productIds.forEach((productId, index) => {
      if (!this.preloadedProducts.has(productId)) {
        this.preloadQueue.push({
          productId,
          priority: 'critical',
          source: 'homepage',
          delay: index * 200, // Escalonar delays
          isPreloaded: false
        });
      }
    });

    this.sortQueue();
  }

  // Adicionar produtos relacionados à fila
  addRelatedProducts(productIds: string[]) {
    console.log('🔗 Adicionando produtos relacionados ao preload:', productIds.length);
    
    productIds.forEach((productId, index) => {
      if (!this.preloadedProducts.has(productId)) {
        this.preloadQueue.push({
          productId,
          priority: 'high',
          source: 'related',
          delay: 1000 + (index * 300),
          isPreloaded: false
        });
      }
    });

    this.sortQueue();
  }

  // Adicionar produtos de categoria à fila
  addCategoryProducts(productIds: string[]) {
    console.log('📂 Adicionando produtos de categoria ao preload:', productIds.length);
    
    productIds.forEach((productId, index) => {
      if (!this.preloadedProducts.has(productId)) {
        this.preloadQueue.push({
          productId,
          priority: 'medium',
          source: 'category',
          delay: 2000 + (index * 500),
          isPreloaded: false
        });
      }
    });

    this.sortQueue();
  }

  // Ordenar fila por prioridade
  private sortQueue() {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    
    this.preloadQueue.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      return priorityDiff !== 0 ? priorityDiff : a.delay - b.delay;
    });
  }

  // Iniciar preloading em background
  async startBackgroundPreloading() {
    if (this.isPreloading || !this.isSafeToPreload()) {
      return;
    }

    console.log('🚀 Iniciando preloading inteligente de produtos');
    this.isPreloading = true;
    this.abortController = new AbortController();

    try {
      // Aguardar usuário ficar idle
      await this.waitForUserIdle(800);

      // Processar fila
      await this.processPreloadQueue();
    } catch (error) {
      console.warn('Erro no preloading de produtos:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  // Processar fila de preloading
  private async processPreloadQueue() {
    const maxConcurrent = 3; // Máximo de preloads simultâneos
    let activePreloads = 0;
    let queueIndex = 0;

    while (queueIndex < this.preloadQueue.length) {
      if (this.abortController?.signal.aborted) {
        console.log('🛑 Product preloading cancelado');
        break;
      }

      const item = this.preloadQueue[queueIndex];
      
      if (this.preloadedProducts.has(item.productId) || item.isPreloaded) {
        queueIndex++;
        continue;
      }

      if (activePreloads >= maxConcurrent) {
        // Aguardar um pouco antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      // Iniciar preload do produto
      activePreloads++;
      this.preloadProduct(item)
        .then(() => {
          activePreloads--;
          item.isPreloaded = true;
          this.preloadedProducts.add(item.productId);
        })
        .catch((error) => {
          activePreloads--;
          console.warn(`Erro ao preload produto ${item.productId}:`, error);
        });

      queueIndex++;

      // Delay entre inicializações
      if (item.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.min(item.delay, 500)));
      }
    }

    // Aguardar todos os preloads ativos terminarem
    while (activePreloads > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Product preloading concluído');
  }

  // Preload de um produto específico
  private async preloadProduct(item: ProductPreloadItem): Promise<void> {
    try {
      console.log(`⚡ Preloading produto ${item.productId} (${item.source}, ${item.priority})`);

      // Verificar se já está no cache
      const cachedProduct = this.productCache.getProduct(item.productId);
      if (cachedProduct) {
        console.log(`✅ Produto ${item.productId} já está no cache`);
        return;
      }

      // Buscar produto da API
      const products = this.productsApi.products || [];
      const product = products.find((p: any) => p.id === item.productId);

      if (product) {
        // Transformar para formato de cache
        const productForCache = {
          id: product.id,
          name: product.name,
          price: product.price,
          proPrice: product.proPrice,
          originalPrice: product.originalPrice,
          image: product.image,
          gallery: product.gallery,
          tags: product.tags,
          platform: product.platform,
          genre: product.genre,
          stock: product.stock,
          rating: product.rating,
          reviewCount: product.reviewCount,
          description: product.description
        };

        // Salvar no cache
        this.productCache.setProduct(productForCache);
        console.log(`✅ Produto ${item.productId} salvo no cache via preload`);
      } else {
        console.warn(`⚠️ Produto ${item.productId} não encontrado na API`);
      }
    } catch (error) {
      console.error(`❌ Erro ao preload produto ${item.productId}:`, error);
      throw error;
    }
  }

  // Parar preloading
  stopPreloading() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isPreloading = false;
    console.log('🛑 Product preloading interrompido');
  }

  // Verificar se produto foi preloaded
  isProductPreloaded(productId: string): boolean {
    return this.preloadedProducts.has(productId);
  }

  // Obter estatísticas
  getStats() {
    const total = this.preloadQueue.length;
    const preloaded = this.preloadedProducts.size;
    const pending = total - preloaded;
    
    const bySource = this.preloadQueue.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = this.preloadQueue.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      preloaded,
      pending,
      isActive: this.isPreloading,
      bySource,
      byPriority,
      preloadedProducts: Array.from(this.preloadedProducts)
    };
  }

  // Limpar fila
  clearQueue() {
    this.preloadQueue = [];
    this.preloadedProducts.clear();
    console.log('🧹 Fila de preload de produtos limpa');
  }
}

// Hook para usar o preloader de produtos
export const useProductPreloader = () => {
  const { getProduct, setProduct } = useProductCache();
  const preloaderRef = useRef<ProductPreloader | null>(null);

  // Inicializar preloader
  useEffect(() => {
    if (!preloaderRef.current) {
      preloaderRef.current = new ProductPreloader(
        { getProduct, setProduct },
        { products: [] } // Será atualizado conforme necessário
      );
    }
  }, [getProduct, setProduct]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      preloaderRef.current?.stopPreloading();
    };
  }, []);

  const addHomepageProducts = useCallback((productIds: string[]) => {
    preloaderRef.current?.addHomepageProducts(productIds);
  }, []);

  const addRelatedProducts = useCallback((productIds: string[]) => {
    preloaderRef.current?.addRelatedProducts(productIds);
  }, []);

  const addCategoryProducts = useCallback((productIds: string[]) => {
    preloaderRef.current?.addCategoryProducts(productIds);
  }, []);

  const getStats = useCallback(() => {
    return preloaderRef.current?.getStats() || null;
  }, []);

  const isProductPreloaded = useCallback((productId: string) => {
    return preloaderRef.current?.isProductPreloaded(productId) || false;
  }, []);

  const stopPreloading = useCallback(() => {
    preloaderRef.current?.stopPreloading();
  }, []);

  const clearQueue = useCallback(() => {
    preloaderRef.current?.clearQueue();
  }, []);

  return {
    addHomepageProducts,
    addRelatedProducts,
    addCategoryProducts,
    getStats,
    isProductPreloaded,
    stopPreloading,
    clearQueue
  };
};

