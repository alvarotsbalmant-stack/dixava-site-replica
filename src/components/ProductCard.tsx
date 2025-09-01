
import React, { useCallback, useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import FavoriteButton from '@/components/FavoriteButton';
import { useProductHover } from '@/hooks/useProductPrefetch';
import { useAnalytics } from '@/contexts/AnalyticsContext';

import ProductCardImage from './ProductCard/ProductCardImage';
import ProductCardInfo from './ProductCard/ProductCardInfo';
import ProductCardPrice from './ProductCard/ProductCardPrice';
import ProductCardBadge from './ProductCard/ProductCardBadge';

export type { Product } from '@/hooks/useProducts';

interface ProductCardProps {
  product: Product;
  onCardClick: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
}

const ProductCard = React.memo(({ product, onCardClick, onAddToCart }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { handleMouseEnter: handlePrefetchMouseEnter, handleMouseLeave: handlePrefetchMouseLeave } = useProductHover(product.id);
  const { trackProductView } = useAnalytics();

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-action="true"]')) {
      return;
    }
    
    // Track product view
    trackProductView(product.id, product.name, product.price);
    
    onCardClick(product.id);
  }, [onCardClick, product.id, trackProductView, product.name, product.price]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    // Iniciar prefetch do produto
    handlePrefetchMouseEnter();
  }, [handlePrefetchMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    // Cancelar prefetch se ainda não completou
    handlePrefetchMouseLeave();
  }, [handlePrefetchMouseLeave]);

  return (
    <Card
      className={cn(
        "relative flex flex-col bg-white overflow-hidden",
        "border border-gray-200",
        "rounded-lg",
        "shadow-none",
        "transition-all duration-200 ease-in-out",
        "cursor-pointer",
        "w-[204px] h-[326px] md:w-[200px] md:h-[320px]",
        "p-0",
        "product-card",
        isHovered && "md:shadow-md md:-translate-y-1"
      )}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="product-card"
    >
      <ProductCardBadge 
        text={product.badge_text || ''} 
        color={product.badge_color || '#22c55e'} 
        isVisible={product.badge_visible || false} 
      />

      {/* Favorite Button */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton productId={product.id} size="sm" />
      </div>
      
      <ProductCardImage product={product} isHovered={isHovered} />

      <div className="flex flex-1 flex-col justify-between p-3 md:p-3">
        <div className="space-y-2">
          <ProductCardInfo product={product} />
          <ProductCardPrice product={product} />
        </div>
      </div>
    </Card>
  );
});

export default ProductCard;
