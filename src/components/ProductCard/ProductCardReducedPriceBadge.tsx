
import React from 'react';
import { cn } from '@/lib/utils';

interface ProductCardReducedPriceBadgeProps {
  isVisible: boolean;
}

const ProductCardReducedPriceBadge: React.FC<ProductCardReducedPriceBadgeProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute top-2 right-2 z-10">
      <div
        className={cn(
          "bg-red-600 text-white text-xs font-bold px-3 py-1",
          "transform rotate-12",
          "shadow-sm"
        )}
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 0% 100%)',
          minWidth: '80px',
          textAlign: 'center'
        }}
      >
        REDUCED PRICE
      </div>
    </div>
  );
};

export default ProductCardReducedPriceBadge;
