import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product } from './useProducts/types';
import { fetchProductsFromDatabase } from './useProducts/productApi';
import { handleProductError } from './useProducts/productErrorHandler';

/**
 * Hook otimizado com cache robusto para produtos
 * - Cache de 10 minutos
 * - Verifica cache primeiro antes da API
 * - Ordena produtos de forma consistente
 * - Elimina aleatoriedade
 */

interface CacheData {
  data: Product[];
  timestamp: number;
  key: string;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
const CACHE_KEY = 'products_cache_v2';

export const useProductsWithCache = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar do cache
  const loadFromCache = useCallback((): Product[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        console.log('[useProductsWithCache] 📂 Nenhum cache encontrado');
        return null;
      }

      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();
      const age = now - cacheData.timestamp;

      if (age > CACHE_DURATION) {
        console.log('[useProductsWithCache] ⏰ Cache expirado, removendo');
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      console.log(`[useProductsWithCache] ✅ Cache válido encontrado: ${cacheData.data.length} produtos (${Math.round(age/1000)}s atrás)`);
      return cacheData.data;
    } catch (error) {
      console.error('[useProductsWithCache] ❌ Erro ao carregar cache:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  // Salvar no cache
  const saveToCache = useCallback((data: Product[]) => {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        key: CACHE_KEY
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log(`[useProductsWithCache] 💾 Salvou ${data.length} produtos no cache`);
    } catch (error) {
      console.error('[useProductsWithCache] ❌ Erro ao salvar cache:', error);
    }
  }, []);

  // Buscar produtos (cache first)
  const fetchProducts = useCallback(async (force: boolean = false) => {
    // 1. SEMPRE verificar cache primeiro (exceto se forçado)
    if (!force) {
      const cachedData = loadFromCache();
      if (cachedData) {
        setProducts(cachedData);
        setLoading(false);
        return cachedData;
      }
    }

    // 2. Cache não existe ou expirado - buscar da API
    console.log('[useProductsWithCache] 🌐 Buscando dados da API...');
    setLoading(true);
    
    try {
      const productsData = await fetchProductsFromDatabase(true);
      
      // 3. ✅ GARANTIR ORDEM CONSISTENTE (eliminar aleatoriedade)
      const sortedProducts = productsData.sort((a, b) => {
        // Ordenação consistente: ID primeiro, depois nome
        if (a.id !== b.id) return a.id.localeCompare(b.id);
        return a.name.localeCompare(b.name);
      });

      console.log(`[useProductsWithCache] ✅ API retornou ${sortedProducts.length} produtos`);
      
      // 4. Salvar no cache E no estado
      saveToCache(sortedProducts);
      setProducts(sortedProducts);
      
      return sortedProducts;
    } catch (error: any) {
      console.error('[useProductsWithCache] ❌ Erro na API:', error);
      const errorMessage = handleProductError(error, 'ao carregar produtos');
      
      if (errorMessage) {
        toast({
          title: "Erro ao carregar produtos",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      // Em caso de erro, tentar usar cache expirado como fallback
      const expiredCache = localStorage.getItem(CACHE_KEY);
      if (expiredCache) {
        try {
          const cacheData: CacheData = JSON.parse(expiredCache);
          console.log('[useProductsWithCache] 🔄 Usando cache expirado como fallback');
          setProducts(cacheData.data);
          return cacheData.data;
        } catch (e) {
          console.error('[useProductsWithCache] ❌ Cache expirado também inválido');
        }
      }
      
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [loadFromCache, saveToCache, toast]);

  // Invalidar cache (útil após atualizações)
  const invalidateCache = useCallback(() => {
    console.log('[useProductsWithCache] 🗑️ Invalidando cache');
    localStorage.removeItem(CACHE_KEY);
  }, []);

  // Buscar na inicialização
  useEffect(() => {
    console.log('[useProductsWithCache] 🚀 Inicializando hook com cache');
    fetchProducts(false); // Não forçar - usar cache se disponível
  }, [fetchProducts]);

  return {
    products,
    loading,
    refetch: () => fetchProducts(true), // Force refresh
    fetchProducts: () => fetchProducts(false), // Use cache
    invalidateCache,
  };
};