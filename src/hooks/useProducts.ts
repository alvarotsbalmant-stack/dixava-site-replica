
import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
      console.log('🔄 [useProducts.updateProduct] NOVO SISTEMA DIRETO');
      console.log('🔄 [useProducts.updateProduct] ID:', id);
      console.log('🔄 [useProducts.updateProduct] Updates:', updates);
      
      // Preparar dados para update (igual ao bulk edit)
      const updateData: any = {};
      
      // Campos básicos
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = Number(updates.price);
      if (updates.list_price !== undefined) updateData.list_price = Number(updates.list_price);
      if (updates.pro_price !== undefined) updateData.pro_price = Number(updates.pro_price);
      if (updates.stock !== undefined) updateData.stock = Number(updates.stock);
      
      // Campo UTI Coins Cashback (igual ao bulk edit)
      if (updates.uti_coins_cashback_percentage !== undefined) {
        updateData.uti_coins_cashback_percentage = Number(updates.uti_coins_cashback_percentage);
      }
      
      // Campo UTI Coins Desconto (igual ao bulk edit)
      if (updates.uti_coins_discount_percentage !== undefined) {
        updateData.uti_coins_discount_percentage = Number(updates.uti_coins_discount_percentage);
      }
      
      // Campos booleanos
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
      if (updates.is_featured !== undefined) updateData.is_featured = updates.is_featured;
      if (updates.badge_visible !== undefined) updateData.badge_visible = updates.badge_visible;
      if (updates.free_shipping !== undefined) updateData.free_shipping = updates.free_shipping;
      
      // Campos de texto
      if (updates.image !== undefined) updateData.image = updates.image;
      if (updates.badge_text !== undefined) updateData.badge_text = updates.badge_text;
      if (updates.badge_color !== undefined) updateData.badge_color = updates.badge_color;
      if (updates.sku_code !== undefined) updateData.sku_code = updates.sku_code;
      
      // Campos JSON
      if (updates.additional_images !== undefined) updateData.additional_images = updates.additional_images;
      if (updates.colors !== undefined) updateData.colors = updates.colors;
      if (updates.sizes !== undefined) updateData.sizes = updates.sizes;
      if (updates.specifications !== undefined) updateData.specifications = updates.specifications;
      if (updates.technical_specs !== undefined) updateData.technical_specs = updates.technical_specs;
      if (updates.product_features !== undefined) updateData.product_features = updates.product_features;
      
      // Sempre atualizar timestamp
      updateData.updated_at = new Date().toISOString();
      
      console.log('📊 [useProducts.updateProduct] Dados para update:', updateData);
      
      // UPDATE DIRETO no Supabase (igual ao bulk edit)
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
        
      if (error) {
        console.error('❌ [useProducts.updateProduct] Erro no update:', error);
        throw error;
      }
      
      console.log('✅ [useProducts.updateProduct] Produto atualizado:', data);
      
      // Recarregar produtos
      await fetchProducts();
      
      toast({
        title: "Produto atualizado com sucesso!",
        description: "Todas as alterações foram salvas.",
      });
      
      return data;
    } catch (error: any) {
      console.error('❌ [useProducts.updateProduct] Erro geral:', error);
      toast({
        title: "Erro ao atualizar produto",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
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

