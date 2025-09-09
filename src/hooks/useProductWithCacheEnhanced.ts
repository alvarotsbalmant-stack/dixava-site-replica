import { useState, useEffect, useCallback } from 'react';
import { useProductCache } from './useProductCache';

interface UseProductWithCacheEnhancedResult {
  product: any | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  retryCount: number;
  retry: () => void;
}

export const useProductWithCacheEnhanced = (productId: string): UseProductWithCacheEnhancedResult => {
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { getProduct, setProduct: setCachedProduct } = useProductCache();

  // Função para buscar produto com fallbacks múltiplos
  const fetchProduct = useCallback(async (attempt: number = 0) => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Buscando produto ${productId} (tentativa ${attempt + 1})`);

      // ESTRATÉGIA 1: Verificar cache primeiro
      const cachedProduct = getProduct(productId);
      if (cachedProduct) {
        console.log(`⚡ Produto ${productId} carregado do CACHE`);
        setProduct(cachedProduct);
        setFromCache(true);
        setLoading(false);
        return;
      }

      // ESTRATÉGIA 2: Simular busca da API (placeholder)
      // Em produção, aqui seria feita a chamada real para a API
      console.log(`🌐 Simulando busca do produto ${productId} via API`);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular produto não encontrado ou erro de rede
      if (Math.random() > 0.7) { // 30% chance de erro
        throw new Error('Erro ao carregar produto. Verifique sua internet.');
      }

      // Simular produto encontrado
      const mockProduct = {
        id: productId,
        name: `Produto ${productId}`,
        price: 199.99,
        proPrice: 179.99,
        originalPrice: 249.99,
        image: '/placeholder-banner.png',
        gallery: ['/placeholder-banner.png'],
        tags: [{ id: '1', name: 'PlayStation 5' }, { id: '2', name: 'Jogo' }],
        platform: 'PlayStation 5',
        genre: 'Ação',
        stock: 10,
        rating: 4.5,
        reviewCount: 128,
        description: 'Descrição do produto simulada para teste de cache.',
        lastUpdated: new Date().toISOString()
      };

      // Salvar no cache
      setCachedProduct(mockProduct);
      
      setProduct(mockProduct);
      setFromCache(false);
      setLoading(false);
      
      console.log(`✅ Produto ${productId} carregado da API (simulado)`);

    } catch (err: any) {
      console.error(`❌ Erro ao buscar produto ${productId}:`, err);
      
      // Verificar se é um erro temporário que vale a pena tentar novamente
      const isRetryableError = 
        err.message?.includes('network') ||
        err.message?.includes('timeout') ||
        err.message?.includes('connection') ||
        err.message?.includes('rate limit') ||
        err.message?.includes('Too many requests') ||
        err.message?.includes('Erro ao carregar produto');

      if (isRetryableError && attempt < 3) {
        console.log(`🔄 Tentando novamente em ${(attempt + 1) * 1000}ms...`);
        
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchProduct(attempt + 1);
        }, (attempt + 1) * 1000);
        
        return;
      }

      // Erro final - verificar se há dados em cache mesmo expirados
      const expiredCachedProduct = getProduct(productId, true); // Ignorar expiração
      if (expiredCachedProduct) {
        console.log(`⚠️ Usando dados expirados do cache para produto ${productId}`);
        setProduct(expiredCachedProduct);
        setFromCache(true);
        setError('Dados podem estar desatualizados');
      } else {
        setError('Erro ao carregar produto. Verifique sua internet.');
      }
      
      setLoading(false);
    }
  }, [productId, getProduct, setCachedProduct]);

  // Função para buscar da API e atualizar cache em background
  const fetchFromApiAndUpdateCache = useCallback(async (id: string, silent: boolean = false) => {
    try {
      const apiProduct = await getProductById(id);
      if (apiProduct) {
        const productForCache = transformProductForCache(apiProduct);
        setCachedProduct(productForCache);
        
        if (!silent) {
          setProduct(productForCache);
          setFromCache(false);
        }
        
        console.log(`🔄 Cache atualizado para produto ${id}`);
      }
    } catch (error) {
      console.warn(`⚠️ Falha ao atualizar cache para produto ${id}:`, error);
    }
  }, [getProductById, setCachedProduct]);

  // Transformar produto para formato de cache
  const transformProductForCache = useCallback((apiProduct: any) => {
    return {
      id: apiProduct.id,
      name: apiProduct.name || apiProduct.product_name,
      price: apiProduct.price || apiProduct.product_price,
      proPrice: apiProduct.pro_price || apiProduct.uti_pro_custom_price,
      originalPrice: apiProduct.list_price || apiProduct.original_price,
      image: apiProduct.image || apiProduct.product_image,
      gallery: apiProduct.additional_images || apiProduct.gallery || [],
      tags: apiProduct.tags || [],
      platform: apiProduct.platform,
      genre: apiProduct.genre,
      stock: apiProduct.stock || apiProduct.product_stock,
      rating: apiProduct.rating,
      reviewCount: apiProduct.review_count || apiProduct.reviewCount,
      description: apiProduct.description || apiProduct.product_description,
      specifications: apiProduct.specifications || [],
      features: apiProduct.product_features || {},
      badge: {
        text: apiProduct.badge_text,
        color: apiProduct.badge_color,
        visible: apiProduct.badge_visible
      },
      shipping: {
        weight: apiProduct.shipping_weight,
        freeShipping: apiProduct.free_shipping
      },
      seo: {
        title: apiProduct.meta_title,
        description: apiProduct.meta_description,
        slug: apiProduct.slug
      },
      status: {
        isActive: apiProduct.is_active,
        isFeatured: apiProduct.is_featured
      },
      utiPro: {
        enabled: apiProduct.uti_pro_enabled,
        value: apiProduct.uti_pro_value,
        customPrice: apiProduct.uti_pro_custom_price,
        type: apiProduct.uti_pro_type
      },
      lastUpdated: new Date().toISOString()
    };
  }, []);

  // Preload produtos relacionados
  const preloadRelatedProducts = useCallback((product: any) => {
    try {
      // Encontrar produtos relacionados por tags/categoria
      const relatedProducts = products
        .filter(p => 
          p.id !== product.id && 
          (
            p.category === product.category ||
            p.platform === product.platform ||
            (p.tags && product.tags && p.tags.some((tag: any) => 
              product.tags.some((pTag: any) => pTag.id === tag.id)
            ))
          )
        )
        .slice(0, 8)
        .map(p => p.id);

      if (relatedProducts.length > 0) {
        addRelatedProducts(relatedProducts);
      }
    } catch (error) {
      console.warn('Erro ao preload produtos relacionados:', error);
    }
  }, [products, addRelatedProducts]);

  // Função para retry manual
  const retry = useCallback(() => {
    setRetryCount(0);
    fetchProduct(0);
  }, [fetchProduct]);

  // Buscar produto quando ID mudar
  useEffect(() => {
    if (productId) {
      fetchProduct(0);
    } else {
      setProduct(null);
      setLoading(false);
      setError(null);
      setFromCache(false);
    }
  }, [productId, fetchProduct]);

  return {
    product,
    loading,
    error,
    fromCache,
    retryCount,
    retry
  };
};

