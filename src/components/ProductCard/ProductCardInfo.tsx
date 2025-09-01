
import React from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface ProductCardInfoProps {
  product: Product;
}

const ProductCardInfo: React.FC<ProductCardInfoProps> = ({ product }) => {
  return (
    <div className="mb-2 md:mb-3">
      <h3
        className={cn(
          "font-sans text-sm md:text-sm font-medium leading-tight text-gray-900 text-left",
          "line-clamp-2",
          "min-h-[2.4rem] md:min-h-[2.5rem]" // Ensure consistent height for title area
        )}
        title={product.name}
      >
        {product.name}
      </h3>
    </div>
  );
};

export default ProductCardInfo;
