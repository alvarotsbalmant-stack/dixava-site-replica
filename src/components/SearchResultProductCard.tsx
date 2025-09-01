import React, { useCallback, useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useAnalytics } from '@/contexts/AnalyticsContext';

import SearchResultProductCardImage from './ProductCard/SearchResultProductCardImage';
import SearchResultProductCardInfo from './ProductCard/SearchResultProductCardInfo';
import ProductCardPrice from './ProductCard/ProductCardPrice';
import ProductCardBadge from './ProductCard/ProductCardBadge';

export type { Product } from '@/hooks/useProducts';

interface SearchResultProductCardProps {
  product: Product;
  onCardClick: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
}

const SearchResultProductCard = React.memo(({ product, onCardClick, onAddToCart }: SearchResultProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
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
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <Card
      className={cn(
        "relative flex flex-col bg-white overflow-hidden",
        "border border-gray-200",
        "rounded-lg",
        "shadow-none",
        "transition-all duration-200 ease-in-out",
        "cursor-pointer",
        "w-full h-[323px] md:h-[380px]",
        "p-0",
        "product-card",
        isHovered && "md:shadow-md md:-translate-y-1"
      )}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="search-result-product-card"
    >
      <ProductCardBadge 
        text={product.badge_text || ''} 
        color={product.badge_color || '#22c55e'} 
        isVisible={product.badge_visible || false} 
      />
      
      <SearchResultProductCardImage product={product} isHovered={isHovered} />

      <div className="flex flex-1 flex-col justify-between p-2.5 md:p-3">
        <div className="space-y-2">
          <SearchResultProductCardInfo product={product} />
          <ProductCardPrice product={product} />
        </div>
      </div>
    </Card>
  );
});

export default SearchResultProductCard;

