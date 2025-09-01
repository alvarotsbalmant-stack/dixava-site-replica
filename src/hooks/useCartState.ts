
import { useState, useCallback } from 'react';
import { CartItem, CartState } from '@/types/cart';
import { Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

export const useCartState = () => {
  const [state, setState] = useState<CartState>({
    items: [],
    isLoading: false,
    error: null,
  });
  const { toast } = useToast();

  const generateItemId = useCallback((product: Product, size?: string, color?: string): string => {
    return `${product.id}-${size || 'default'}-${color || 'default'}`;
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const addItem = useCallback(async (product: Product, size?: string, color?: string, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const itemId = generateItemId(product, size, color);
      console.log('Adicionando item:', itemId, 'quantidade:', quantity);
      
      setState(prev => {
        const existingItemIndex = prev.items.findIndex(item => item.id === itemId);
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...prev.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
          console.log('Item existente atualizado. Nova quantidade:', updatedItems[existingItemIndex].quantity);
          return { ...prev, items: updatedItems };
        } else {
          // Add new item
          const newItem: CartItem = {
            id: itemId,
            product,
            size,
            color,
            quantity,
            addedAt: new Date()
          };
          console.log('Novo item adicionado:', newItem);
          return { ...prev, items: [...prev.items, newItem] };
        }
      });

      toast({
        title: "✅ Produto adicionado!",
        description: `${product.name} foi adicionado ao carrinho`,
        duration: 2000,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      setError('Erro ao adicionar item ao carrinho');
      toast({
        title: "❌ Erro",
        description: "Erro ao adicionar item ao carrinho",
        duration: 3000,
        className: "bg-red-50 border-red-200 text-red-800",
      });
    } finally {
      setLoading(false);
    }
  }, [generateItemId, toast]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Removendo item:', itemId);

      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    } catch (error) {
      console.error('Erro ao remover item:', error);
      setError('Erro ao remover item do carrinho');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Atualizando quantidade:', itemId, 'nova quantidade:', quantity);

      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      setState(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      }));
      console.log('Quantidade atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      setError('Erro ao atualizar quantidade');
    } finally {
      setLoading(false);
    }
  }, [removeItem]);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Limpando carrinho');
      setState(prev => ({ ...prev, items: [] }));
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      setError('Erro ao limpar carrinho');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTotal = useCallback((): number => {
    const total = state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    return total;
  }, [state.items]);

  const getItemsCount = useCallback((): number => {
    const count = state.items.reduce((total, item) => total + item.quantity, 0);
    return count;
  }, [state.items]);

  return {
    state,
    setState,
    actions: {
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getItemsCount,
    }
  };
};
