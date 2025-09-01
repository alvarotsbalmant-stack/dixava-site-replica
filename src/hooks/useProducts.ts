
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useToast } from '@/hooks/use-toast';
import { Product } from './useProducts/types';
import { 
  fetchProductsFromDatabase, 
  addProductToDatabase, 
  updateProductInDatabase, 
  deleteProductFromDatabase,
  fetchProductsByCriteria, // Import the new API function
  fetchSingleProductFromDatabase // Import the single product function
} from './useProducts/productApi';
import { handleProductError } from './useProducts/productErrorHandler';
import { CarouselConfig } from '@/types/specialSections'; // Import CarouselConfig type
import { invalidateAllProductCaches, debugProductLoading } from './useProducts/cacheInvalidator'; // Import cache utilities

export type { Product } from './useProducts/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = useCallback(async (includeAdmin: boolean = true) => { // Wrap in useCallback, include admin products by default
    try {
      setLoading(true);
      console.log('[useProducts] Fetching ALL products including admin products');
      const productsData = await fetchProductsFromDatabase(includeAdmin);
      console.log('[useProducts] Fetched products count:', productsData.length);
      debugProductLoading(productsData, 'useProducts.fetchProducts'); // Debug helper
      setProducts(productsData);
    } catch (error: any) {
      console.error('[useProducts] Error fetching products:', error);
      const errorMessage = handleProductError(error, 'ao carregar produtos');
      
      if (errorMessage) {
        toast({
          title: "Erro ao carregar produtos",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      // Clear products on error and invalidate cache
      setProducts([]);
      // Force invalidate any caches to prevent corrupt data
      invalidateAllProductCaches();
    } finally {
      setLoading(false);
    }
  }, [toast]); // Add dependencies

  // New function to fetch products based on carousel config
  const fetchProductsByConfig = useCallback(async (config: CarouselConfig) => {
    if (!config) return;
    setLoading(true);
    try {
      const productsData = await fetchProductsByCriteria(config);
      setProducts(productsData);
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
  }, [toast]); // Add dependencies

  const addProduct = async (productData: Omit<Product, 'id' | 'tags'> & { tagIds: string[] }) => {
    try {
      const result = await addProductToDatabase(productData);
      await fetchProducts(); // Recarregar para obter as tags
      toast({
        title: "Produto adicionado com sucesso!",
      });
      return result;
    } catch (error: any) {
      const errorMessage = handleProductError(error, 'ao adicionar produto');
      if (errorMessage) {
        toast({
          title: "Erro ao adicionar produto",
          description: errorMessage,
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product> & { tagIds?: string[] }) => {
    try {
      const result = await updateProductInDatabase(id, updates);
      await fetchProducts(); // Recarregar para obter as tags atualizadas
      toast({
        title: "Produto atualizado com sucesso!",
      });
      return result;
    } catch (error: any) {
      const errorMessage = handleProductError(error, 'ao atualizar produto');
      if (errorMessage) {
        toast({
          title: "Erro ao atualizar produto",
          description: errorMessage,
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteProductFromDatabase(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Produto removido com sucesso!",
      });
    } catch (error: any) {
      const errorMessage = handleProductError(error, 'ao remover produto');
      if (errorMessage) {
        toast({
          title: "Erro ao remover produto",
          description: errorMessage,
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const fetchSingleProduct = async (id: string): Promise<Product | null> => {
    try {
      console.log('useProducts: fetchSingleProduct called with ID:', id);
      const product = await fetchSingleProductFromDatabase(id);
      console.log('useProducts: fetchSingleProduct result:', product);
      return product;
    } catch (error: any) {
      console.error('useProducts: Error fetching single product:', error);
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
    // Initial fetch with admin products included to ensure ALL products are visible
    console.log('[useProducts] Initial fetch with ALL products including admin');
    fetchProducts(true); 
  }, [fetchProducts]); // Corrected dependency array

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts, // Keep refetch for general product list if needed elsewhere
    fetchProductsByConfig, // Expose the new function
    fetchSingleProduct, // Expose the new single product function
  };
};

