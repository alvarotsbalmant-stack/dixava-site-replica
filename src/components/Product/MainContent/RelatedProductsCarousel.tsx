import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, useProducts } from '@/hooks/useProducts';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import FavoriteButton from '@/components/FavoriteButton';
import ProductCardImage from '@/components/ProductCard/ProductCardImage';
import ProductCardInfo from '@/components/ProductCard/ProductCardInfo';
import ProductCardPrice from '@/components/ProductCard/ProductCardPrice';
import ProductCardBadge from '@/components/ProductCard/ProductCardBadge';

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
  const { products: allProducts } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allProducts.length > 0 && currentProduct) {
      // Lógica para produtos relacionados baseada em tags
      const currentProductTags = currentProduct.tags?.map(t => t.id) || [];
      const related = allProducts
        .filter(p => 
          p.id !== currentProduct.id && 
          p.tags?.some(tag => currentProductTags.includes(tag.id))
        )
        .slice(0, 8);
      
      // Se não houver produtos relacionados por tag, pegar produtos aleatórios
      if (related.length < 4) {
        const others = allProducts
          .filter(p => p.id !== currentProduct.id && !related.some(r => r.id === p.id))
          .slice(0, 8 - related.length);
        related.push(...others);
      }

      setProducts(related);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-900">
          Produtos Relacionados
        </h3>
        <Button
          variant="default"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white border-0 flex-shrink-0 w-full sm:w-auto font-medium"
        >
          Ver Todos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Products Grid / Scroll Container */}
      <div className="relative group">
        {/* Left Navigation Button */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 shadow-lg border border-gray-200 transition-opacity duration-200"
            onClick={scrollLeft}
            aria-label="Produtos anteriores"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Right Navigation Button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 shadow-lg border border-gray-200 transition-opacity duration-200"
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
          <div>• Frete grátis para compras acima de R$ 99</div>
        </div>
      </div>
    </div>
  );
};

export default RelatedProductsCarousel;

