
import { Product } from '@/hooks/useProducts';

export interface CartItem {
  id: string;
  product: Product;
  size?: string;
  color?: string;
  quantity: number;
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

export interface CartActions {
  addToCart: (product: Product, size?: string, color?: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (productId: string, size: string | undefined, color: string | undefined, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  sendToWhatsApp: () => void;
}

// Database cart item interface for Supabase integration
export interface DatabaseCartItem {
  id: string;
  product_id: string;
  user_id: string;
  size?: string;
  color?: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}
