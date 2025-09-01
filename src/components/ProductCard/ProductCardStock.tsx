import React from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface ProductCardStockProps {
  product: Product;
}

// **Radical Redesign based on GameStop reference and plan_transformacao_radical.md**
const ProductCardStock: React.FC<ProductCardStockProps> = ({ product }) => {
  return null; // Não renderiza nada para estoque, replicando o design da Gamestop
};export default ProductCardStock;

