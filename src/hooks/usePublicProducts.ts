import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product } from './useProducts/types';
import { 
  fetchProductsFromDatabase, 
  fetchProductsByCriteria,
  fetchSingleProductFromDatabase
} from './useProducts/productApi';
import { handleProductError } from './useProducts/productErrorHandler';
import { CarouselConfig } from '@/types/specialSections';
import { invalidateAllProductCaches, debugProductLoading } from './useProducts/cacheInvalidator';
import { filterMasterProducts } from '@/utils/relatedProducts';

export type { Product } from './useProducts/types';

/**
 * Hook para produtos públicos (sem produtos mestre)
 * Deve ser usado em todos os componentes que não são do admin
 */
export const usePublicProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[usePublicProducts] Fetching public products (excluding master products)');
      
      // Buscar todos os produtos, mas excluir produtos mestre
      const allProductsData = await fetchProductsFromDatabase(false); // false = não incluir admin
      
      // Filtro adicional para garantir que produtos mestre não apareçam
      const publicProducts = filterMasterProducts(allProductsData);
      
      console.log(`[usePublicProducts] Total products: ${allProductsData.length}`);
      console.log(`[usePublicProducts] Public products (after filtering masters): ${publicProducts.length}`);
      
      debugProductLoading(publicProducts, 'usePublicProducts.fetchProducts');
      setProducts(publicProducts);
    } catch (error: any) {
      console.error('[usePublicProducts] Error fetching products:', error);
      const errorMessage = handleProductError(error, 'ao carregar produtos');
      
      if (errorMessage) {
        toast({
          title: "Erro ao carregar produtos",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      setProducts([]);
      invalidateAllProductCaches();
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchProductsByConfig = useCallback(async (config: CarouselConfig) => {
    if (!config) return;
    setLoading(true);
    try {
      console.log('[usePublicProducts] Fetching products by config (excluding master products)');
      
      // Buscar produtos por critério, mas excluir produtos mestre
      const productsData = await fetchProductsByCriteria(config, false); // false = não incluir admin
      
      // Filtro adicional para garantir que produtos mestre não apareçam
      const publicProducts = filterMasterProducts(productsData);
      
      console.log(`[usePublicProducts] Products by config: ${productsData.length}`);
      console.log(`[usePublicProducts] Public products (after filtering masters): ${publicProducts.length}`);
      
      setProducts(publicProducts);
    } catch (error: any) {
      const errorMessage = handleProductError(error, 'ao carregar produtos do carrossel');
      if (errorMessage) {
        toast({
          title: "Erro ao carregar produtos do carrossel",
          description: errorMessage,
          variant: "destructive",
        });
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchSingleProduct = async (id: string): Promise<Product | null> => {
    try {
      console.log('[usePublicProducts] fetchSingleProduct called with ID:', id);
      const product = await fetchSingleProductFromDatabase(id);
      
      if (product && filterMasterProducts([product]).length === 0) {
        console.log('[usePublicProducts] Product is master type, returning null');
        return null; // Produto é mestre, não retornar
      }
      
      console.log('[usePublicProducts] fetchSingleProduct result:', product);
      return product;
    } catch (error: any) {
      console.error('[usePublicProducts] Error fetching single product:', error);
      const errorMessage = handleProductError(error, 'ao carregar produto');
      if (errorMessage) {
        toast({
          title: "Erro ao carregar produto",
          description: errorMessage,
          variant: "destructive",
        });
      }
      return null;
    }
  };

  useEffect(() => {
    console.log('[usePublicProducts] Initial fetch of public products');
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    refetch: fetchProducts,
    fetchProductsByConfig,
    fetchSingleProduct,
  };
};

/**
 * Hook para usar em componentes que precisam de todos os produtos (incluindo admin)
 * Deve ser usado apenas em componentes do admin
 */
export const useAllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[useAllProducts] Fetching ALL products including master products');
      
      const allProductsData = await fetchProductsFromDatabase(true); // true = incluir admin
      
      console.log(`[useAllProducts] All products (including masters): ${allProductsData.length}`);
      debugProductLoading(allProductsData, 'useAllProducts.fetchProducts');
      setProducts(allProductsData);
    } catch (error: any) {
      console.error('[useAllProducts] Error fetching products:', error);
      const errorMessage = handleProductError(error, 'ao carregar produtos');
      
      if (errorMessage) {
        toast({
          title: "Erro ao carregar produtos",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      setProducts([]);
      invalidateAllProductCaches();
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    console.log('[useAllProducts] Initial fetch of all products');
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    refetch: fetchProducts,
  };
};

