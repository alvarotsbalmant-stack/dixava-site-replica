import { useCallback } from 'react';
import { useProductContext } from '@/contexts/ProductContext';

/**
 * Hook para gerenciar o refresh automático de produtos após operações CRUD
 */
export const useProductRefresh = () => {
  const { refreshProducts } = useProductContext();

  const refreshAfterOperation = useCallback(async (operationName: string): Promise<void> => {
    try {
      console.log(`[useProductRefresh] Atualizando produtos após ${operationName}`);
      await refreshProducts();
      
      // Aguardar um pouco para garantir que a atualização foi processada
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log(`[useProductRefresh] Produtos atualizados com sucesso após ${operationName}`);
    } catch (error) {
      console.error(`[useProductRefresh] Erro ao atualizar produtos após ${operationName}:`, error);
      throw error; // Re-throw para que o caller possa lidar com o erro
    }
  }, [refreshProducts]);

  return {
    refreshAfterOperation
  };
};