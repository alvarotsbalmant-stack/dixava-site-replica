import React from 'react';
import { Product } from '@/hooks/useProducts';
import { useUTIProPricing } from '@/hooks/useUTIProPricing';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/lib/utils';

interface ProductCardProPriceProps {
  product: Product;
}

const ProductCardProPrice: React.FC<ProductCardProPriceProps> = ({ product }) => {
  const utiProPricing = useUTIProPricing(product);

  // Só renderiza se UTI Pro estiver habilitado para este produto
  if (!utiProPricing.isEnabled || !utiProPricing.proPrice) {
    return null;
  }

  return (
    <div className="mt-0 text-left">
      <span className="text-base font-bold text-[#00ff41]">
        {formatPrice(utiProPricing.proPrice)}
      </span>
      <span className="text-sm text-gray-400 ml-1"> for Pros</span>
    </div>
  );
};

export default ProductCardProPrice;


