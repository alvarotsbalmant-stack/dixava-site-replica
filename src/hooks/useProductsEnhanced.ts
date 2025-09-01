import { useCallback, useEffect } from 'react';
import { useProductContext } from '@/contexts/ProductContext';
import { Product } from './useProducts/types';
import { CarouselConfig } from '@/types/specialSections';
import { fetchProductsByCriteria } from './useProducts/productApi';
import { useProductSyncEvents } from '@/utils/productSyncEvents';

export type { Product } from './useProducts/types';

/**
 * Hook melhorado que usa o ProductContext para sincronização global
 * Mantém compatibilidade com o código existente
 */
export const useProductsEnhanced = () => {
  const {
    products,
    loading,
    lastUpdated,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    invalidateCache,
    getProductById,
    subscribeToUpdates
  } = useProductContext();

  // Função para buscar produtos por critério (para carrosséis especiais)
  const fetchProductsByConfig = useCallback(async (config: CarouselConfig) => {
    if (!config) return [];
    
    try {
      console.log('[useProductsEnhanced] Buscando produtos por critério:', config);
      const productsData = await fetchProductsByCriteria(config);
      return productsData;
    } catch (error) {
      console.error('[useProductsEnhanced] Erro ao buscar produtos por critério:', error);
      return [];
    }
  }, []);

  // Função para forçar refresh (útil para componentes que precisam de dados atualizados)
  const forceRefresh = useCallback(async () => {
    console.log('[useProductsEnhanced] Refresh forçado solicitado');
    await refreshProducts();
  }, [refreshProducts]);

  // Função para invalidar cache e recarregar
  const invalidateAndRefresh = useCallback(() => {
    console.log('[useProductsEnhanced] Invalidando cache e recarregando');
    invalidateCache();
  }, [invalidateCache]);

  // Função para buscar produto específico por ID
  const getProduct = useCallback((id: string) => {
    return getProductById(id);
  }, [getProductById]);

  // Função para verificar se os dados estão atualizados
  const isDataFresh = useCallback((maxAgeMinutes: number = 5) => {
    if (!lastUpdated) return false;
    const ageMinutes = (Date.now() - lastUpdated.getTime()) / (1000 * 60);
    return ageMinutes < maxAgeMinutes;
  }, [lastUpdated]);

  // Estatísticas úteis
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active !== false).length,
    featuredProducts: products.filter(p => p.is_featured === true).length,
    lastUpdated,
    isLoading: loading,
    isDataFresh: isDataFresh()
  };

  return {
    // Estado básico (compatibilidade)
    products,
    loading,
    
    // Funções CRUD
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Funções de busca
    fetchProducts,
    fetchProductsByConfig,
    getProduct,
    
    // Funções de sincronização
    refreshProducts: forceRefresh,
    invalidateCache: invalidateAndRefresh,
    
    // Sistema de notificação
    subscribeToUpdates,
    
    // Utilitários
    stats,
    isDataFresh,
    
    // Informações de debug
    lastUpdated,
  };
};

/**
 * Hook especializado para componentes admin
 * Inclui funcionalidades específicas para o painel administrativo
 */
export const useProductsAdmin = () => {
  const enhanced = useProductsEnhanced();
  const { emit } = useProductSyncEvents();
  
  // Carregar produtos incluindo master products no admin
  useEffect(() => {
    console.log('[useProductsAdmin] Carregando produtos para admin incluindo master products');
    enhanced.fetchProducts(true); // includeAdmin = true
  }, [enhanced.fetchProducts]);
  
  // Função para adicionar produto com refresh automático e eventos
  const addProductWithRefresh = useCallback(async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('[useProductsAdmin] Adicionando produto com refresh automático');
    const result = await enhanced.addProduct(productData);
    
    if (result) {
      // Emitir evento de sincronização
      emit('product_added', { product: result }, 'admin', result.id);
      
      // Aguardar um pouco para garantir que o banco foi atualizado
      setTimeout(() => {
        enhanced.refreshProducts();
        emit('admin_action_completed', { action: 'add', productId: result.id }, 'admin');
      }, 500);
    }
    
    return result;
  }, [enhanced, emit]);

  // Função para atualizar produto com refresh automático e eventos
  const updateProductWithRefresh = useCallback(async (id: string, updates: Partial<Product>) => {
    console.log('[useProductsAdmin] Atualizando produto com refresh automático:', id);
    const result = await enhanced.updateProduct(id, updates);
    
    if (result) {
      // Emitir evento de sincronização
      emit('product_updated', { product: result, updates }, 'admin', id);
      
      // Aguardar um pouco para garantir que o banco foi atualizado
      setTimeout(() => {
        enhanced.refreshProducts();
        emit('admin_action_completed', { action: 'update', productId: id }, 'admin');
      }, 500);
    }
    
    return result;
  }, [enhanced, emit]);

  // Função para deletar produto com refresh automático e eventos
  const deleteProductWithRefresh = useCallback(async (id: string) => {
    console.log('[useProductsAdmin] Deletando produto com refresh automático:', id);
    const result = await enhanced.deleteProduct(id);
    
    if (result) {
      // Emitir evento de sincronização
      emit('product_deleted', { productId: id }, 'admin', id);
      
      // Aguardar um pouco para garantir que o banco foi atualizado
      setTimeout(() => {
        enhanced.refreshProducts();
        emit('admin_action_completed', { action: 'delete', productId: id }, 'admin');
      }, 500);
    }
    
    return result;
  }, [enhanced, emit]);

  // Função para operações em lote
  const batchOperations = {
    addMultiple: async (products: Omit<Product, 'id' | 'created_at' | 'updated_at'>[]) => {
      console.log(`[useProductsAdmin] Adicionando ${products.length} produtos em lote`);
      const results = [];
      
      for (const product of products) {
        const result = await enhanced.addProduct(product);
        results.push(result);
      }
      
      // Emitir evento de sincronização para lote
      emit('products_refreshed', { action: 'batch_add', count: products.length }, 'admin');
      
      // Refresh único após todas as operações
      await enhanced.refreshProducts();
      return results;
    },
    
    updateMultiple: async (updates: { id: string; data: Partial<Product> }[]) => {
      console.log(`[useProductsAdmin] Atualizando ${updates.length} produtos em lote`);
      const results = [];
      
      for (const update of updates) {
        const result = await enhanced.updateProduct(update.id, update.data);
        results.push(result);
      }
      
      // Emitir evento de sincronização para lote
      emit('products_refreshed', { action: 'batch_update', count: updates.length }, 'admin');
      
      // Refresh único após todas as operações
      await enhanced.refreshProducts();
      return results;
    },
    
    deleteMultiple: async (ids: string[]) => {
      console.log(`[useProductsAdmin] Deletando ${ids.length} produtos em lote`);
      const results = [];
      
      for (const id of ids) {
        const result = await enhanced.deleteProduct(id);
        results.push(result);
      }
      
      // Emitir evento de sincronização para lote
      emit('products_refreshed', { action: 'batch_delete', count: ids.length }, 'admin');
      
      // Refresh único após todas as operações
      await enhanced.refreshProducts();
      return results;
    }
  };

  return {
    ...enhanced,
    
    // Funções específicas do admin com refresh automático
    addProduct: addProductWithRefresh,
    updateProduct: updateProductWithRefresh,
    deleteProduct: deleteProductWithRefresh,
    
    // Operações em lote
    batchOperations,
    
    // Função para forçar sincronização global
    forceSyncAll: () => {
      console.log('[useProductsAdmin] Forçando sincronização global');
      enhanced.invalidateCache();
      emit('products_refreshed', { action: 'force_sync' }, 'admin');
    }
  };
};

// Hook de compatibilidade - mantém a interface original
export const useProducts = useProductsEnhanced;

export default useProductsEnhanced;

