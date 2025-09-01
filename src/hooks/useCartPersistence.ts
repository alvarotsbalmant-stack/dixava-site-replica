
import { useEffect, useCallback } from 'react';
import { CartItem } from '@/types/cart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UseCartPersistenceProps {
  items: CartItem[];
  isLoading: boolean;
  setItems: (items: CartItem[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useCartPersistence = ({ items, isLoading, setItems, setLoading }: UseCartPersistenceProps) => {
  const { user } = useAuth();

  const loadFromLocalStorage = useCallback((): CartItem[] => {
    try {
      const saved = localStorage.getItem('uti-games-cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(item => ({
          ...item,
          addedAt: new Date(item.addedAt)
        })) : [];
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
    return [];
  }, []);

  const saveToLocalStorage = useCallback((cartItems: CartItem[]) => {
    try {
      localStorage.setItem('uti-games-cart', JSON.stringify(cartItems));
      console.log('Carrinho salvo no localStorage:', cartItems.length, 'items');
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }, []);

  const loadFromDatabase = useCallback(async (): Promise<CartItem[]> => {
    if (!user) return [];

    try {
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          size,
          color,
          quantity,
          created_at,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (cartItems) {
        return cartItems.map((item: any): CartItem => ({
          id: `${item.product_id}-${item.size || 'default'}-${item.color || 'default'}`,
          product: item.products,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          addedAt: new Date(item.created_at)
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar do banco:', error);
    }
    return [];
  }, [user]);

  const saveToDatabase = useCallback(async (cartItems: CartItem[]) => {
    if (!user || isLoading) return;

    try {
      // Limpar carrinho existente
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      // Inserir novos itens
      if (cartItems.length > 0) {
        const itemsToInsert = cartItems.map(item => ({
          user_id: user.id,
          product_id: item.product.id,
          size: item.size || null,
          color: item.color || null,
          quantity: item.quantity,
        }));

        const { error } = await supabase
          .from('cart_items')
          .insert(itemsToInsert);

        if (error) throw error;
      }
      console.log('Carrinho salvo no banco:', cartItems.length, 'items');
    } catch (error) {
      console.error('Erro ao salvar no banco:', error);
      // Fallback para localStorage
      saveToLocalStorage(cartItems);
    }
  }, [user, isLoading, saveToLocalStorage]);

  // Carregar carrinho na inicialização
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          const dbItems = await loadFromDatabase();
          if (dbItems.length > 0) {
            console.log('Carregando do banco:', dbItems.length, 'items');
            setItems(dbItems);
          } else {
            // Se não há itens no banco, carregar do localStorage
            const localItems = loadFromLocalStorage();
            console.log('Carregando do localStorage:', localItems.length, 'items');
            setItems(localItems);
            // Migrar para o banco se houver itens
            if (localItems.length > 0) {
              await saveToDatabase(localItems);
              localStorage.removeItem('uti-games-cart');
            }
          }
        } else {
          const localItems = loadFromLocalStorage();
          console.log('Carregando do localStorage (sem usuário):', localItems.length, 'items');
          setItems(localItems);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user, loadFromDatabase, loadFromLocalStorage, setItems, setLoading, saveToDatabase]);

  // Salvar mudanças automaticamente (com debounce)
  useEffect(() => {
    if (!isLoading && items.length >= 0) {
      const timeoutId = setTimeout(() => {
        if (user) {
          saveToDatabase(items);
        } else {
          saveToLocalStorage(items);
        }
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [items, user, isLoading, saveToDatabase, saveToLocalStorage]);

  return {
    loadFromLocalStorage,
    saveToLocalStorage,
    loadFromDatabase,
    saveToDatabase,
  };
};
