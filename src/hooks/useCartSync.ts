
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from './useProducts';

export interface CartItem {
  id: string;
  product: Product;
  size?: string;
  color?: string;
  quantity: number;
  addedAt: Date;
}

interface DatabaseCartItem {
  id: string;
  product_id: string;
  user_id: string;
  size?: string;
  color?: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export const useCartSync = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadLocalCart = () => {
      try {
        const saved = localStorage.getItem('uti-games-cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log('Carregando carrinho local:', parsed.length, 'items');
          setCart(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho local:', error);
        setCart([]);
      }
    };
    
    loadLocalCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('uti-games-cart', JSON.stringify(cart));
      console.log('Carrinho salvo localmente:', cart.length, 'items');
    } catch (error) {
      console.error('Erro ao salvar carrinho local:', error);
    }
  }, [cart]);

  // Sync with database when user logs in/out
  useEffect(() => {
    if (user) {
      syncCartWithDatabase();
    } else {
      // User logged out - keep only local cart
      console.log('Usuário deslogado - mantendo apenas carrinho local');
    }
  }, [user]);

  const generateItemId = useCallback((product: Product, size?: string, color?: string): string => {
    return `${product.id}-${size || 'default'}-${color || 'default'}`;
  }, []);

  const syncCartWithDatabase = useCallback(async () => {
    if (!user) return;

    setSyncing(true);
    try {
      console.log('Sincronizando carrinho com database...');

      // Fetch cart from database
      const { data: dbCartItems, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          user_id,
          size,
          color,
          quantity,
          created_at,
          updated_at,
          products!cart_items_product_id_fkey (
            id,
            name,
            description,
            price,
            image,
            additional_images,
            sizes,
            colors,
            stock,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao buscar carrinho do database:', error);
        return;
      }

      console.log('Itens do database:', dbCartItems?.length || 0);

      // Convert database items to local format
      const dbCart: CartItem[] = (dbCartItems || []).map((item: any) => ({
        id: generateItemId(item.products, item.size, item.color),
        product: {
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          price: parseFloat(item.products.price),
          image: item.products.image,
          additional_images: item.products.additional_images,
          sizes: item.products.sizes,
          colors: item.products.colors,
          stock: item.products.stock,
          created_at: item.products.created_at,
          updated_at: item.products.updated_at,
          tags: [] // Tags will be loaded separately if needed
        },
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        addedAt: new Date(item.created_at)
      }));

      // Merge local and database carts
      const mergedCart = mergeCartItems(cart, dbCart);
      
      // Update local state
      setCart(mergedCart);

      // Sync merged cart back to database
      await syncLocalCartToDatabase(mergedCart);

      console.log('Sincronização completa. Carrinho final:', mergedCart.length, 'items');
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setSyncing(false);
    }
  }, [user, cart, generateItemId]);

  const mergeCartItems = useCallback((localCart: CartItem[], dbCart: CartItem[]): CartItem[] => {
    const merged = [...localCart];
    
    dbCart.forEach(dbItem => {
      const existingIndex = merged.findIndex(item => item.id === dbItem.id);
      
      if (existingIndex >= 0) {
        // Item exists in both - use the one with higher quantity
        if (dbItem.quantity > merged[existingIndex].quantity) {
          merged[existingIndex] = dbItem;
        }
      } else {
        // Item only in database - add it
        merged.push(dbItem);
      }
    });

    return merged;
  }, []);

  const syncLocalCartToDatabase = useCallback(async (cartToSync: CartItem[]) => {
    if (!user) return;

    try {
      // Delete all existing cart items for user
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      // Insert current cart items
      if (cartToSync.length > 0) {
        const dbItems = cartToSync.map(item => ({
          product_id: item.product.id,
          user_id: user.id,
          size: item.size,
          color: item.color,
          quantity: item.quantity
        }));

        const { error } = await supabase
          .from('cart_items')
          .insert(dbItems);

        if (error) {
          console.error('Erro ao salvar carrinho no database:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar com database:', error);
    }
  }, [user]);

  const addToCart = useCallback(async (product: Product, size?: string, color?: string, quantity = 1) => {
    console.log('addToCart chamado:', product.name, 'size:', size, 'color:', color, 'qty:', quantity);
    
    const itemId = generateItemId(product, size, color);
    
    setCart(prev => {
      const existingItemIndex = prev.findIndex(item => item.id === itemId);
      
      let newCart: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item
        newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity
        };
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
        newCart = [...prev, newItem];
      }

      // Sync to database if user is logged in
      if (user) {
        syncLocalCartToDatabase(newCart).catch(console.error);
      }

      return newCart;
    });

    toast({
      title: "✅ Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho`,
      duration: 2000,
      className: "bg-green-50 border-green-200 text-green-800",
    });
  }, [generateItemId, user, syncLocalCartToDatabase, toast]);

  const removeFromCart = useCallback(async (itemId: string) => {
    console.log('removeFromCart chamado:', itemId);
    
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== itemId);
      
      // Sync to database if user is logged in
      if (user) {
        syncLocalCartToDatabase(newCart).catch(console.error);
      }
      
      return newCart;
    });
  }, [user, syncLocalCartToDatabase]);

  const updateQuantity = useCallback(async (productId: string, size: string | undefined, color: string | undefined, quantity: number) => {
    const itemId = `${productId}-${size || 'default'}-${color || 'default'}`;
    console.log('updateQuantity chamado:', itemId, 'nova quantidade:', quantity);
    
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prev => {
      const newCart = prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      
      // Sync to database if user is logged in
      if (user) {
        syncLocalCartToDatabase(newCart).catch(console.error);
      }
      
      return newCart;
    });
  }, [removeFromCart, user, syncLocalCartToDatabase]);

  const clearCart = useCallback(async () => {
    console.log('clearCart chamado');
    
    setCart([]);
    
    // Clear from database if user is logged in
    if (user) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Erro ao limpar carrinho no database:', error);
      }
    }
  }, [user]);

  const getCartTotal = useCallback(() => {
    const total = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    return total;
  }, [cart]);

  const getCartItemsCount = useCallback(() => {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    return count;
  }, [cart]);

  const sendToWhatsApp = useCallback(() => {
    if (cart.length === 0) return;

    const itemsList = cart.map(item => 
      `• ${item.product.name} (${item.size || 'Padrão'}${item.color ? `, ${item.color}` : ''}) - Qtd: ${item.quantity} - R$ ${(item.product.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const total = getCartTotal();
    const message = `Olá! Gostaria de pedir os seguintes itens da UTI DOS GAMES:\n\n${itemsList}\n\n*Total: R$ ${total.toFixed(2)}*`;
    const whatsappUrl = `https://wa.me/5527996882090?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }, [cart, getCartTotal]);

  return {
    cart,
    loading: loading || syncing,
    error: null,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    sendToWhatsApp,
    syncing
  };
};
