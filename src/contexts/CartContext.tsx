
import React, { createContext, useContext, ReactNode } from 'react';
import { useNewCart } from '@/hooks/useNewCart';
import { Product } from '@/hooks/useProducts';
import { CartItem } from '@/types/cart';

export interface CartContextType {
  cart: CartItem[];
  items: CartItem[]; // Add items alias for backward compatibility
  loading: boolean;
  error: null;
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (productId: string, size: string | undefined, color: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  sendToWhatsApp: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    sendToWhatsApp,
  } = useNewCart();

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart, // Provide items as alias for cart
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        sendToWhatsApp,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
