import React from 'react';
import { Button } from '@/components/ui/button';

import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface ProductCardActionsProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCardActions: React.FC<ProductCardActionsProps> = ({
  product,
  onAddToCart
}) => {
  const isOutOfStock = product.stock === 0;

  if (isOutOfStock) {
    return null; // Não renderiza o botão se o produto estiver esgotado
  }

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddToCart(product);
  };

  return (
    <div className="w-full"> {/* Ensure the container takes full width */}
      <Button
        size="default" // Use default size for a full-width button
        variant="default"
        onClick={handleAddToCartClick}
        className={cn(
          "w-full rounded-md py-2 text-base font-semibold", // Full width, adjusted padding and font
          "transition-all duration-200 ease-in-out",
          "bg-green-600 text-white hover:bg-green-700" // GameStop-like green button
        )}
        aria-label="Adicionar ao Carrinho"
      >
        <span>Adicionar ao Carrinho</span>
      </Button>
    </div>
  );
};

export default ProductCardActions;


