
import React from 'react';
import { Product } from '@/hooks/useProducts';
import { useUTIProPricing } from '@/hooks/useUTIProPricing';
import { formatPrice } from '@/utils/formatPrice';

interface ProductCardPriceProps {
  product: Product;
}

const ProductCardPrice: React.FC<ProductCardPriceProps> = ({ product }) => {
  const utiProPricing = useUTIProPricing(product);
  const originalPrice = product.list_price;
  const discount = originalPrice ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;

  return (
    <div className="space-y-1 min-h-[2.5rem] flex flex-col justify-end">
      {/* Main Price Section */}
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-sm sm:text-base md:text-lg font-bold text-muted-foreground">
          {formatPrice(product.price)}
        </span>
        {discount > 0 && (
          <span className="text-xs sm:text-sm text-gray-400 line-through">
            {formatPrice(originalPrice)}
          </span>
        )}
      </div>
      
      {/* Pro Price Section - sempre mostra se tiver pro_price */}
      {product.pro_price && product.pro_price > 0 && (
        <div className="text-xs sm:text-sm">
          <span className="font-bold text-purple-600">
            {formatPrice(product.pro_price)}
          </span>
          <span className="text-muted-foreground ml-1">com Pro</span>
        </div>
      )}
    </div>
  );
};

export default ProductCardPrice;
