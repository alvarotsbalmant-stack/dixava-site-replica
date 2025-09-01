import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Product } from '@/hooks/useProducts/types';
import { 
  fetchProductsFromDatabase, 
  addProductToDatabase, 
  updateProductInDatabase, 
  deleteProductFromDatabase 
} from '@/hooks/useProducts/productApi';
import { handleProductError } from '@/hooks/useProducts/productErrorHandler';
import { useToast } from '@/hooks/use-toast';

interface ProductContextType {
  // Estado
  products: Product[];
  loading: boolean;
  lastUpdated: Date | null;
  
  // Funções CRUD
  fetchProducts: (includeAdmin?: boolean) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<Product | null>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // Funções de sincronização
  refreshProducts: () => Promise<void>;
  invalidateCache: () => void;
  getProductById: (id: string) => Product | undefined;
  
  // Sistema de notificação
  subscribeToUpdates: (callback: (products: Product[]) => void) => () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [subscribers, setSubscribers] = useState<Set<(products: Product[]) => void>>(new Set());
  const { toast } = useToast();

  // Função para notificar todos os subscribers
  const notifySubscribers = useCallback((updatedProducts: Product[]) => {
    subscribers.forEach(callback => {
      try {
        callback(updatedProducts);
      } catch (error) {
        console.error('Erro ao notificar subscriber:', error);
      }
    });
  }, [subscribers]);

  // Função principal para buscar produtos
  const fetchProducts = useCallback(async (includeAdmin: boolean = false) => {
    try {
      setLoading(true);
      console.log('[ProductContext] Buscando produtos do banco de dados...', includeAdmin ? 'incluindo master products' : 'sem master products');
      
      const productsData = await fetchProductsFromDatabase(includeAdmin);
      setProducts(productsData);
      setLastUpdated(new Date());
      
      // Notificar todos os subscribers sobre a atualização
      notifySubscribers(productsData);
      
      console.log(`[ProductContext] ${productsData.length} produtos carregados com sucesso`);
    } catch (error: any) {
      const errorMessage = handleProductError(error, 'ao carregar produtos');
      
      if (errorMessage) {
        toast({
          title: "Erro ao carregar produtos",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      console.error('[ProductContext] Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [toast, notifySubscribers]);

  // Função para refresh manual
  const refreshProducts = useCallback(async () => {
    console.log('[ProductContext] Refresh manual solicitado');
    await fetchProducts();
  }, [fetchProducts]);

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    console.log('[ProductContext] Cache invalidado - forçando refresh');
    setLastUpdated(null);
    fetchProducts();
  }, [fetchProducts]);

  // Função para adicionar produto
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'tags'> & { tagIds: string[] }): Promise<Product | null> => {
    try {
      console.log('[ProductContext] Adicionando novo produto...');
      
      const newProduct = await addProductToDatabase(productData);
      
      if (newProduct) {
        // Atualizar estado local imediatamente
        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        setLastUpdated(new Date());
        
        // Notificar subscribers
        notifySubscribers(updatedProducts);
        
        toast({
          title: "Produto adicionado",
          description: `${newProduct.name} foi adicionado com sucesso!`,
        });
        
        console.log('[ProductContext] Produto adicionado com sucesso:', newProduct.id);
        return newProduct;
      }
      
      return null;
    } catch (error: any) {
      const errorMessage = handleProductError(error, 'ao adicionar produto');
      
      if (errorMessage) {
        toast({
          title: "Erro ao adicionar produto",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      console.error('[ProductContext] Erro ao adicionar produto:', error);
      return null;
    }
  }, [products, toast, notifySubscribers]);

  // Função para atualizar produto
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    try {
      console.log(`[ProductContext] Atualizando produto ${id}...`);
      
      const updatedProduct = await updateProductInDatabase(id, updates);
      
      if (updatedProduct) {
        // Atualizar estado local imediatamente
        const updatedProducts = products.map(p => 
          p.id === id ? updatedProduct : p
        );
        setProducts(updatedProducts);
        setLastUpdated(new Date());
        
        // Notificar subscribers
        notifySubscribers(updatedProducts);
        
        toast({
          title: "Produto atualizado",
          description: `${updatedProduct.name} foi atualizado com sucesso!`,
        });
        
        console.log('[ProductContext] Produto atualizado com sucesso:', id);
        return updatedProduct;
      }
      
      return null;
    } catch (error: any) {
      const errorMessage = handleProductError(error, 'ao atualizar produto');
      
      if (errorMessage) {
        toast({
          title: "Erro ao atualizar produto",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      console.error('[ProductContext] Erro ao atualizar produto:', error);
      return null;
    }
  }, [products, toast, notifySubscribers]);

  // Função para deletar produto
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log(`[ProductContext] Deletando produto ${id}...`);
      
      const success = await deleteProductFromDatabase(id);
      
      if (success) {
        // Atualizar estado local imediatamente
        const updatedProducts = products.filter(p => p.id !== id);
        setProducts(updatedProducts);
        setLastUpdated(new Date());
        
        // Notificar subscribers
        notifySubscribers(updatedProducts);
        
        toast({
          title: "Produto removido",
          description: "Produto foi removido com sucesso!",
        });
        
        console.log('[ProductContext] Produto deletado com sucesso:', id);
        return true;
      }
      
      return false;
    } catch (error: any) {
      const errorMessage = handleProductError(error, 'ao remover produto');
      
      if (errorMessage) {
        toast({
          title: "Erro ao remover produto",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      console.error('[ProductContext] Erro ao deletar produto:', error);
      return false;
    }
  }, [products, toast, notifySubscribers]);

  // Função para buscar produto por ID
  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  // Sistema de subscription para notificações
  const subscribeToUpdates = useCallback((callback: (products: Product[]) => void) => {
    console.log('[ProductContext] Novo subscriber registrado');
    setSubscribers(prev => new Set(prev).add(callback));
    
    // Retornar função de cleanup
    return () => {
      console.log('[ProductContext] Subscriber removido');
      setSubscribers(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  // Carregar produtos na inicialização
  useEffect(() => {
    console.log('[ProductContext] Inicializando contexto de produtos...');
    fetchProducts();
  }, [fetchProducts]);

  // Auto-refresh a cada 5 minutos (opcional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdated && Date.now() - lastUpdated.getTime() > 5 * 60 * 1000) {
        console.log('[ProductContext] Auto-refresh ativado (5 minutos)');
        fetchProducts();
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, [lastUpdated, fetchProducts]);

  const value: ProductContextType = {
    // Estado
    products,
    loading,
    lastUpdated,
    
    // Funções CRUD
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Funções de sincronização
    refreshProducts,
    invalidateCache,
    getProductById,
    
    // Sistema de notificação
    subscribeToUpdates,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  
  if (context === undefined) {
    throw new Error('useProductContext deve ser usado dentro de um ProductProvider');
  }
  
  return context;
};

// Hook especializado para página de produto individual
export const useProductPage = (productId: string) => {
  const { getProductById, subscribeToUpdates, refreshProducts } = useProductContext();
  const [product, setProduct] = useState<Product | undefined>();

  useEffect(() => {
    // Buscar produto inicial
    const foundProduct = getProductById(productId);
    setProduct(foundProduct);

    // Subscribir para atualizações
    const unsubscribe = subscribeToUpdates((products) => {
      const updatedProduct = products.find(p => p.id === productId);
      setProduct(updatedProduct);
    });

    return unsubscribe;
  }, [productId, getProductById, subscribeToUpdates]);

  return {
    product,
    refreshProduct: refreshProducts,
  };
};

export default ProductContext;

