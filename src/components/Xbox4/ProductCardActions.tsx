
import React from 'react';
import { Product } from '@/hooks/useProducts';

interface ProductCardActionsProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (productId: string) => void;
  variant?: "default" | "game" | "accessory" | "deal";
  className?: string;
}

const ProductCardActions = ({ product, onAddToCart, onProductClick, variant = "default", className }: ProductCardActionsProps) => {
  // Return null to remove all buttons
  return null;
};

export default ProductCardActions;
