
import { useState, useCallback, useEffect } from 'react';
import { Product } from './useProducts';
import { CartItem } from '@/types/cart';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'uti-games-cart';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    const loadCart = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('Carregando carrinho do localStorage:', parsed.length, 'items');
          setCart(Array.isArray(parsed) ? parsed.map(item => ({
            ...item,
            addedAt: new Date(item.addedAt)
          })) : []);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        setCart([]);
      }
    };
    
    loadCart();
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    if (cart.length >= 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        console.log('Carrinho salvo no localStorage:', cart.length, 'items');
      } catch (error) {
        console.error('Erro ao salvar carrinho:', error);
      }
    }
  }, [cart]);

  const generateItemId = useCallback((product: Product, size?: string, color?: string): string => {
    return `${product.id}-${size || 'default'}-${color || 'default'}`;
  }, []);

  const addItem = useCallback(async (product: Product, size?: string, color?: string, quantity: number = 1) => {
    try {
      setLoading(true);
      console.log('addItem chamado para:', product.name, 'size:', size, 'color:', color);
      
      const itemId = generateItemId(product, size, color);
      
      setCart(prev => {
        const existingItemIndex = prev.findIndex(item => item.id === itemId);
        
        if (existingItemIndex >= 0) {
          // Atualizar item existente
          const newCart = [...prev];
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + quantity
          };
          console.log('Item existente atualizado. Nova quantidade:', newCart[existingItemIndex].quantity);
          return newCart;
        } else {
          // Adicionar novo item
          const newItem: CartItem = {
            id: itemId,
            product,
            size,
            color,
            quantity,
            addedAt: new Date()
          };
          console.log('Novo item adicionado:', newItem);
          return [...prev, newItem];
        }
      });

      toast({
        title: "✅ Adicionado!",
        description: `${product.name}`,
        duration: 2000,
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao adicionar",
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
      console.log('removeItem chamado para:', itemId);
      
      setCart(prev => {
        const newCart = prev.filter(item => item.id !== itemId);
        console.log('Item removido. Carrinho agora tem:', newCart.length, 'items');
        return newCart;
      });
    } catch (error) {
      console.error('Erro ao remover item:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      setLoading(true);
      console.log('updateQuantity chamado para:', itemId, 'nova quantidade:', quantity);
      
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }

      setCart(prev => {
        const newCart = prev.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        );
        console.log('Quantidade atualizada para item:', itemId, 'nova quantidade:', quantity);
        return newCart;
      });
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    } finally {
      setLoading(false);
    }
  }, [removeItem]);

  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      console.log('clearCart chamado');
      setCart([]);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTotal = useCallback(() => {
    const total = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    console.log('getTotal:', total);
    return total;
  }, [cart]);

  const getItemsCount = useCallback(() => {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    console.log('getItemsCount:', count);
    return count;
  }, [cart]);

  const sendToWhatsApp = useCallback(() => {
    if (cart.length === 0) return;

    const itemsList = cart.map(item => 
      `• ${item.product.name} (${item.size || 'Padrão'}${item.color ? `, ${item.color}` : ''}) - Qtd: ${item.quantity} - R$ ${(item.product.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const total = getTotal();
    const message = `Olá! Gostaria de pedir os seguintes itens da UTI DOS GAMES:\n\n${itemsList}\n\n*Total: R$ ${total.toFixed(2)}*`;
    
    // Usar função robusta de redirecionamento
    import('@/utils/whatsapp').then(({ openWhatsAppDirect }) => {
      openWhatsAppDirect('5527996882090', message);
    });
  }, [cart, getTotal]);

  // Função para compatibilidade com updateQuantity usando productId, size, color
  const updateQuantityByProduct = useCallback((productId: string, size: string | undefined, color: string | undefined, quantity: number) => {
    const itemId = `${productId}-${size || 'default'}-${color || 'default'}`;
    updateQuantity(itemId, quantity);
  }, [updateQuantity]);

  return {
    // Estado
    items: cart,
    isLoading: loading,
    error: null,
    
    // Ações principais
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemsCount,
    
    // Funções específicas para compatibilidade
    cart,
    addToCart: addItem,
    removeFromCart: removeItem,
    updateQuantityByProduct,
    getCartTotal: getTotal,
    getCartItemsCount: getItemsCount,
    sendToWhatsApp,
  };
};
