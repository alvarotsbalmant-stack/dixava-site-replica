import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/hooks/useProducts/types';
import { usePublicProducts } from '@/hooks/usePublicProducts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import FavoriteButton from '@/components/FavoriteButton';
import ProductCardImage from '@/components/ProductCard/ProductCardImage';
import ProductCardInfo from '@/components/ProductCard/ProductCardInfo';
import ProductCardPrice from '@/components/ProductCard/ProductCardPrice';
import ProductCardBadge from '@/components/ProductCard/ProductCardBadge';
import SectionTitle from '@/components/SectionTitle';
import { getRelatedProducts } from '@/utils/relatedProducts';

interface RelatedProductsCarouselProps {
  currentProduct: Product;
  relatedProducts?: Product[];
  className?: string;
}

const RelatedProductsCarousel: React.FC<RelatedProductsCarouselProps> = ({
  currentProduct,
  relatedProducts = [],
  className
}) => {
  const navigate = useNavigate();
  const { products: allProducts } = usePublicProducts(); // Usar hook que já filtra produtos mestre
  const [products, setProducts] = useState<Product[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allProducts.length > 0 && currentProduct) {
      console.log('[RelatedProductsCarousel] Calculando produtos relacionados...');
      console.log(`[RelatedProductsCarousel] Produtos disponíveis (já filtrados): ${allProducts.length}`);
      
      // Usar nova lógica de produtos relacionados
      // Não precisa filtrar produtos mestre pois usePublicProducts já faz isso
      const result = getRelatedProducts(currentProduct, allProducts, 8);
      
      console.log(`[RelatedProductsCarousel] Algoritmo usado: ${result.algorithm}`);
      console.log(`[RelatedProductsCarousel] Produtos encontrados: ${result.products.length}`);
      
      if (result.algorithm === 'tags') {
        console.log('[RelatedProductsCarousel] Distribuição de matches por tags:', result.tagMatches);
      }
      
      setProducts(result.products);
    }
  }, [allProducts, currentProduct]);

  const handleProductClick = (product: Product) => {
    navigate(`/produto/${product.id}`);
  };

  // Check scroll position and update button states
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: -containerWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: containerWidth,
        behavior: 'smooth'
      });
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [products]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Section Header */}
      <SectionTitle 
        title="Produtos Relacionados"
        showViewAllButton={false}
        className="px-0"
      />

      {/* Products Grid / Scroll Container */}
      <div className="relative group">
        {/* Left Navigation Button - Hidden on mobile */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 shadow-lg border border-gray-200 transition-opacity duration-200 hidden lg:flex"
            onClick={scrollLeft}
            aria-label="Produtos anteriores"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Right Navigation Button - Hidden on mobile */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 shadow-lg border border-gray-200 transition-opacity duration-200 hidden lg:flex"
            onClick={scrollRight}
            aria-label="Próximos produtos"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        <div
          ref={scrollContainerRef}
          className={cn(
            "w-full overflow-x-auto overflow-y-hidden pb-4 pt-2",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300",
            "overscroll-behavior-x-contain"
          )}
          style={{
            scrollbarWidth: "thin",
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
            touchAction: "pan-x pan-y"
          } as React.CSSProperties}
        >
          <div 
            className="flex gap-3 min-w-max px-1 py-1"
            style={{
              width: 'calc(100% + 100px)',
              paddingRight: '120px'
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex-shrink-0"
                style={{
                  width: "200px",
                  flexShrink: 0
                }}
              >
                {/* Card no padrão da homepage */}
                <Card
                  className={cn(
                    "relative flex flex-col bg-white overflow-hidden",
                    "border border-gray-200",
                    "rounded-lg",
                    "shadow-none",
                    "transition-all duration-200 ease-in-out",
                    "cursor-pointer",
                    "w-[200px] h-[320px]",
                    "p-0",
                    "product-card",
                    "md:hover:shadow-md md:hover:-translate-y-1"
                  )}
                  onClick={() => handleProductClick(product)}
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
                  
                  <ProductCardImage product={product} isHovered={false} />

                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div className="space-y-2">
                      <ProductCardInfo product={product} />
                      <ProductCardPrice product={product} />
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-800 mb-2">💡 Dica da UTI</h5>
        <div className="text-sm text-blue-700 space-y-1">
          <div>• Produtos relacionados são selecionados com base na sua navegação</div>
          <div>• Combine jogos para ganhar mais UTI Coins</div>
          <div>• Frete grátis para compras acima de R$ 150</div>
        </div>
      </div>
    </div>
  );
};

export default RelatedProductsCarousel;

