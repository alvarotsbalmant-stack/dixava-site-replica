/**
 * ProductCacheManager - Sistema de Cache Unificado
 * 
 * Cache central com TTL de 5 minutos que serve todos os componentes do site.
 * Estratégia cache-first com fallback para API.
 * Request deduplication para evitar chamadas simultâneas.
 */

import { fetchProductsFromDatabase, fetchSingleProductFromDatabase } from '@/hooks/useProducts/productApi';
import { Product } from '@/hooks/useProducts/types';

// Interface para produto cacheado (dados essenciais)
export interface CachedProduct {
  // IDENTIFICAÇÃO
  id: string;
  name: string;
  slug?: string;

  // PREÇOS (CRÍTICO)
  price: number;
  pro_price?: number;
  list_price?: number;
  uti_pro_enabled?: boolean;
  uti_pro_value?: number;
  uti_pro_custom_price?: number;

  // VISUAL
  image: string;
  badge_text?: string;
  badge_color?: string;
  badge_visible?: boolean;

  // CATEGORIZAÇÃO
  platform?: string;
  category?: string;
  tags?: { id: string; name: string; }[];

  // ESTADOS
  is_active?: boolean;
  is_featured?: boolean;
  stock?: number;

  // METADADOS DO CACHE
  cached_at: number;
  ttl: number;
}

// Interface para estatísticas do cache
interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  cacheSize: number;
}

class ProductCacheManager {
  private static instance: ProductCacheManager;
  private memoryCache = new Map<string, CachedProduct>();
  private requestQueue = new Map<string, Promise<CachedProduct | null>>();
  private relatedCache = new Map<string, CachedProduct[]>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    cacheSize: 0
  };

  // TTL padrão: 5 minutos
  private readonly DEFAULT_TTL = 5 * 60 * 1000;
  private readonly RELATED_TTL = 3 * 60 * 1000; // 3 minutos para relacionados

  private constructor() {
    // Singleton pattern
    this.startCleanupInterval();
  }

  public static getInstance(): ProductCacheManager {
    if (!ProductCacheManager.instance) {
      ProductCacheManager.instance = new ProductCacheManager();
    }
    return ProductCacheManager.instance;
  }

  /**
   * Converte Product completo para CachedProduct (dados essenciais)
   */
  private productToCached(product: Product): CachedProduct {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      pro_price: product.pro_price,
      list_price: product.list_price,
      uti_pro_enabled: product.uti_pro_enabled,
      uti_pro_value: product.uti_pro_value,
      uti_pro_custom_price: product.uti_pro_custom_price,
      image: product.image,
      badge_text: product.badge_text,
      badge_color: product.badge_color,
      badge_visible: product.badge_visible,
      platform: product.platform,
      category: product.category,
      tags: product.tags,
      is_active: product.is_active,
      is_featured: product.is_featured,
      stock: product.stock,
      cached_at: Date.now(),
      ttl: this.DEFAULT_TTL
    };
  }

  /**
   * Verifica se um item do cache ainda é válido
   */
  private isValid(item: CachedProduct): boolean {
    return (Date.now() - item.cached_at) < item.ttl;
  }

  /**
   * Atualiza estatísticas do cache
   */
  private updateStats(hit: boolean) {
    this.stats.totalRequests++;
    if (hit) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
    this.stats.cacheSize = this.memoryCache.size;
  }

  /**
   * MÉTODO PRINCIPAL: Buscar produto individual (cache-first)
   */
  public async getProduct(id: string): Promise<CachedProduct | null> {
    console.log(`[ProductCache] 🔍 Buscando produto ${id}`);

    // 1. Verificar cache em memória
    const cached = this.memoryCache.get(id);
    if (cached && this.isValid(cached)) {
      console.log(`[ProductCache] ⚡ Cache HIT para produto ${id}`);
      this.updateStats(true);
      return cached;
    }

    // 2. Request deduplication - evitar chamadas simultâneas
    if (this.requestQueue.has(id)) {
      console.log(`[ProductCache] 🔄 Request em andamento para produto ${id}, aguardando...`);
      return await this.requestQueue.get(id)!;
    }

    // 3. Cache MISS - buscar da API
    console.log(`[ProductCache] ❌ Cache MISS para produto ${id}, buscando da API`);
    this.updateStats(false);

    const fetchPromise = this.fetchProductFromAPI(id);
    this.requestQueue.set(id, fetchPromise);

    try {
      const result = await fetchPromise;
      return result;
    } finally {
      this.requestQueue.delete(id);
    }
  }

  /**
   * Buscar produto da API e salvar no cache
   */
  private async fetchProductFromAPI(id: string): Promise<CachedProduct | null> {
    try {
      console.log(`[ProductCache] 🌐 Fazendo chamada à API para produto ${id}`);
      
      const product = await fetchSingleProductFromDatabase(id);
      if (!product) {
        console.log(`[ProductCache] ❌ Produto ${id} não encontrado na API`);
        return null;
      }

      const cachedProduct = this.productToCached(product);
      this.memoryCache.set(id, cachedProduct);
      
      console.log(`[ProductCache] 💾 Produto ${id} salvo no cache`);
      return cachedProduct;
    } catch (error) {
      console.error(`[ProductCache] ❌ Erro ao buscar produto ${id}:`, error);
      
      // Fallback: usar cache expirado se disponível
      const expired = this.memoryCache.get(id);
      if (expired) {
        console.log(`[ProductCache] ⚠️ Usando cache expirado para produto ${id}`);
        return expired;
      }
      
      return null;
    }
  }

  /**
   * MÉTODO ESPECIALIZADO: Buscar produtos relacionados (otimizado)
   */
  public async getRelatedProducts(
    productId: string, 
    tags: string[] = [], 
    platform?: string, 
    category?: string,
    limit: number = 8
  ): Promise<CachedProduct[]> {
    const cacheKey = `related-${productId}-${tags.join(',')}-${platform}-${category}`;
    
    console.log(`[ProductCache] 🔍 Buscando produtos relacionados para ${productId}`);

    // Verificar cache de relacionados
    const cached = this.relatedCache.get(cacheKey);
    if (cached && cached.length > 0 && this.isValid(cached[0])) {
      console.log(`[ProductCache] ⚡ Cache HIT para produtos relacionados de ${productId}`);
      return cached.slice(0, limit);
    }

    console.log(`[ProductCache] ❌ Cache MISS para relacionados, buscando da API`);

    try {
      // Buscar produtos relacionados via query otimizada
      const allProducts = await fetchProductsFromDatabase(false);
      
      const related = allProducts
        .filter(p => {
          if (p.id === productId) return false;
          if (!p.is_active) return false;
          
          // Filtrar por tags (prioridade)
          if (tags.length > 0 && p.tags) {
            const hasMatchingTag = p.tags.some(tag => tags.includes(tag.id));
            if (hasMatchingTag) return true;
          }
          
          // Filtrar por plataforma
          if (platform && p.platform === platform) return true;
          
          // Filtrar por categoria
          if (category && p.category === category) return true;
          
          return false;
        })
        .slice(0, limit * 2) // Buscar mais para ter opções
        .map(p => this.productToCached(p));

      // Salvar no cache de relacionados
      if (related.length > 0) {
        this.relatedCache.set(cacheKey, related);
        console.log(`[ProductCache] 💾 ${related.length} produtos relacionados salvos no cache`);
      }

      return related.slice(0, limit);
    } catch (error) {
      console.error(`[ProductCache] ❌ Erro ao buscar produtos relacionados:`, error);
      return [];
    }
  }

  /**
   * Buscar múltiplos produtos (para listas, homepage, etc)
   */
  public async getMultipleProducts(ids: string[]): Promise<CachedProduct[]> {
    console.log(`[ProductCache] 🔍 Buscando ${ids.length} produtos`);

    const results: CachedProduct[] = [];
    const missingIds: string[] = [];

    // Verificar quais estão no cache
    for (const id of ids) {
      const cached = this.memoryCache.get(id);
      if (cached && this.isValid(cached)) {
        results.push(cached);
      } else {
        missingIds.push(id);
      }
    }

    console.log(`[ProductCache] ⚡ ${results.length} produtos do cache, ${missingIds.length} da API`);

    // Buscar os que faltam
    if (missingIds.length > 0) {
      const fetchPromises = missingIds.map(id => this.getProduct(id));
      const fetchedProducts = await Promise.all(fetchPromises);
      
      fetchedProducts.forEach(product => {
        if (product) {
          results.push(product);
        }
      });
    }

    return results;
  }

  /**
   * Preload de produtos (para otimização)
   */
  public async preloadProducts(ids: string[]): Promise<void> {
    console.log(`[ProductCache] 🚀 Preload de ${ids.length} produtos`);
    
    const missingIds = ids.filter(id => {
      const cached = this.memoryCache.get(id);
      return !cached || !this.isValid(cached);
    });

    if (missingIds.length > 0) {
      console.log(`[ProductCache] 📥 Preload de ${missingIds.length} produtos faltantes`);
      // Fazer preload em background sem bloquear
      Promise.all(missingIds.map(id => this.getProduct(id))).catch(console.error);
    }
  }

  /**
   * Invalidar cache de um produto específico
   */
  public invalidateProduct(id: string): void {
    this.memoryCache.delete(id);
    
    // Invalidar relacionados que incluem este produto
    for (const [key, _] of this.relatedCache) {
      if (key.includes(id)) {
        this.relatedCache.delete(key);
      }
    }
    
    console.log(`[ProductCache] 🗑️ Cache invalidado para produto ${id}`);
  }

  /**
   * Limpar todo o cache
   */
  public clearCache(): void {
    this.memoryCache.clear();
    this.relatedCache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      cacheSize: 0
    };
    console.log(`[ProductCache] 🗑️ Cache completo limpo`);
  }

  /**
   * Obter estatísticas do cache
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Limpeza automática de itens expirados
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      // Limpar cache principal
      for (const [id, item] of this.memoryCache) {
        if (!this.isValid(item)) {
          this.memoryCache.delete(id);
          cleaned++;
        }
      }

      // Limpar cache de relacionados
      for (const [key, items] of this.relatedCache) {
        if (items.length === 0 || !this.isValid(items[0])) {
          this.relatedCache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`[ProductCache] 🧹 Limpeza automática: ${cleaned} itens expirados removidos`);
      }
    }, 60000); // Limpeza a cada minuto
  }
}

// Exportar instância singleton
export const productCache = ProductCacheManager.getInstance();
export default productCache;

