import { useState, useEffect, useCallback } from 'react';
import { useProductCache } from './useProductCache';
import { useProducts } from './useProducts';

// Interface para produto com cache
interface ProductWithCache {
  id: string;
  name: string;
  price: number;
  proPrice?: number;
  originalPrice?: number;
  image: string;
  gallery?: string[];
  tags?: string[];
  platform?: string;
  genre?: string;
  stock?: boolean;
  rating?: number;
  reviewCount?: number;
  description?: string;
  fromCache?: boolean;
}

interface UseProductWithCacheResult {
  product: ProductWithCache | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  refetch: () => void;
}

export const useProductWithCache = (productId: string): UseProductWithCacheResult => {
  const [product, setProduct] = useState<ProductWithCache | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const { getProduct, setProduct: cacheProduct } = useProductCache();
  const { products, loading: apiLoading, error: apiError } = useProducts();

  // Função para buscar produto
  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Tentar buscar no cache primeiro
      const cachedProduct = getProduct(productId);
      
      if (cachedProduct) {
        // Produto encontrado no cache e válido
        setProduct({ ...cachedProduct, fromCache: true });
        setFromCache(true);
        setLoading(false);
        
        // Opcional: Buscar na API em background para atualizar cache
        // (estratégia stale-while-revalidate)
        setTimeout(() => {
          fetchFromAPI();
        }, 100);
        
        return;
      }

      // 2. Se não estiver no cache, buscar na API
      await fetchFromAPI();

    } catch (err) {
      console.error('Erro ao buscar produto:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLoading(false);
    }
  }, [productId, getProduct]);

  // Função para buscar da API
  const fetchFromAPI = useCallback(async () => {
    try {
      // Aguardar produtos carregarem se ainda estão loading
      if (apiLoading) {
        return;
      }

      if (apiError) {
        throw new Error(apiError);
      }

      // Buscar produto na lista de produtos
      const foundProduct = products.find(p => p.id === productId);
      
      if (!foundProduct) {
        throw new Error('Produto não encontrado');
      }

      // Transformar produto para formato do cache
      const productForCache = {
        id: foundProduct.id,
        name: foundProduct.name,
        price: foundProduct.price,
        proPrice: foundProduct.proPrice,
        originalPrice: foundProduct.originalPrice,
        image: foundProduct.image,
        gallery: foundProduct.gallery,
        tags: foundProduct.tags,
        platform: foundProduct.platform,
        genre: foundProduct.genre,
        stock: foundProduct.stock,
        rating: foundProduct.rating,
        reviewCount: foundProduct.reviewCount,
        description: foundProduct.description
      };

      // Salvar no cache
      cacheProduct(productForCache);

      // Atualizar estado
      setProduct({ ...productForCache, fromCache: false });
      setFromCache(false);
      setLoading(false);

    } catch (err) {
      console.error('Erro ao buscar da API:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar produto');
      setLoading(false);
    }
  }, [products, apiLoading, apiError, productId, cacheProduct]);

  // Função para forçar refetch
  const refetch = useCallback(() => {
    setFromCache(false);
    fetchProduct();
  }, [fetchProduct]);

  // Effect para buscar produto quando ID mudar
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    fromCache,
    refetch
  };
};

// Hook para buscar múltiplos produtos com cache
export const useProductsWithCache = (productIds: string[]) => {
  const [products, setProducts] = useState<ProductWithCache[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getProduct, setProduct: cacheProduct, preloadProducts } = useProductCache();
  const { products: allProducts, loading: apiLoading, error: apiError } = useProducts();

  const fetchProducts = useCallback(async () => {
    if (!productIds.length) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results: ProductWithCache[] = [];
      const missingIds: string[] = [];

      // Verificar cache para cada produto
      productIds.forEach(id => {
        const cached = getProduct(id);
        if (cached) {
          results.push({ ...cached, fromCache: true });
        } else {
          missingIds.push(id);
        }
      });

      // Se todos estão no cache, retornar
      if (missingIds.length === 0) {
        setProducts(results);
        setLoading(false);
        return;
      }

      // Aguardar API se necessário
      if (apiLoading) {
        return;
      }

      if (apiError) {
        throw new Error(apiError);
      }

      // Buscar produtos faltantes na API
      const missingProducts = allProducts.filter(p => missingIds.includes(p.id));
      
      // Transformar e cachear produtos faltantes
      const productsToCache = missingProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        proPrice: p.proPrice,
        originalPrice: p.originalPrice,
        image: p.image,
        gallery: p.gallery,
        tags: p.tags,
        platform: p.platform,
        genre: p.genre,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        description: p.description
      }));

      // Pré-carregar no cache
      preloadProducts(productsToCache);

      // Adicionar aos resultados
      productsToCache.forEach(p => {
        results.push({ ...p, fromCache: false });
      });

      setProducts(results);
      setLoading(false);

    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
      setLoading(false);
    }
  }, [productIds, getProduct, allProducts, apiLoading, apiError, preloadProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error
  };
};

