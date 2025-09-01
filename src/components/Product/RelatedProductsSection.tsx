
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Product, useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SectionTitle from '@/components/SectionTitle';
import { cn } from '@/lib/utils';
import { useSimpleHorizontalScroll } from '@/hooks/useSimpleHorizontalScroll';
import FavoriteButton from '@/components/FavoriteButton';
import ProductCardImage from '@/components/ProductCard/ProductCardImage';
import ProductCardInfo from '@/components/ProductCard/ProductCardInfo';
import ProductCardPrice from '@/components/ProductCard/ProductCardPrice';
import ProductCardBadge from '@/components/ProductCard/ProductCardBadge';

interface RelatedProductsSectionProps {
  product: Product;
}

const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({ product }) => {
  const { products: allProducts, loading } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [animateProducts, setAnimateProducts] = useState(true);
  // Usa novo sistema simples baseado no produto para rastreamento preciso
  const scrollContainerRef = useSimpleHorizontalScroll(`related-products-${product.id}`, true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Sistema GameStop: Detecção mobile para gradientes
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  useEffect(() => {
    if (allProducts.length > 0 && product) {
      // Lógica para produtos relacionados baseada em tags
      const currentProductTags = product.tags?.map(t => t.id) || [];
      const related = allProducts
        .filter(p => 
          p.id !== product.id && 
          p.tags?.some(tag => currentProductTags.includes(tag.id))
        )
        .slice(0, 8);
      
      // Se não houver produtos relacionados por tag, pegar produtos aleatórios
      if (related.length < 4) {
        const others = allProducts
          .filter(p => p.id !== product.id && !related.some(r => r.id === p.id))
          .slice(0, 8 - related.length);
        related.push(...others);
      }

      setRelatedProducts(related);
    }
  }, [allProducts, product]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleProductClick = useCallback(async (productId: string) => {
    // Navegar para produto relacionado
    console.log('[RelatedProducts] Navegando para produto relacionado:', productId);
    navigate(`/produto/${productId}`);
  }, [navigate]);

  const handleViewAllClick = () => {
    navigate('/categoria/inicio');
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

  useEffect(() => {
    setAnimateProducts(false);
    const timer = setTimeout(() => setAnimateProducts(true), 50);
    return () => clearTimeout(timer);
  }, [relatedProducts]);

  // Check scroll buttons when products change or component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollButtons();
    }, 100);
    return () => clearTimeout(timer);
  }, [relatedProducts]);

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [relatedProducts]);

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 text-muted-foreground">
            Carregando produtos...
          </div>
        </div>
      </section>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <SectionTitle title="Produtos Relacionados" className="mb-0" />
          <Button
            onClick={handleViewAllClick}
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
              className="flex gap-10 md:gap-3 min-w-max px-1 py-1"
              style={{
                width: 'calc(100% + 100px)',
                paddingRight: '120px'
              }}
            >
              {/* Card fantasma GameStop - empurra primeiro card para dentro do gradiente */}
              {!isMobile && (
                <div className="flex-shrink-0 w-[29px] md:w-[35px] h-full" aria-hidden="true" />
              )}
              
              {relatedProducts.map((relatedProduct, index) => (
                <div
                  key={relatedProduct.id}
                  className={cn(
                    "flex-shrink-0",
                    "transition-all duration-300 ease-in-out",
                    animateProducts
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  )}
                  style={{
                    transitionDelay: animateProducts ? `${index * 75}ms` : "0ms",
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
                      "hover:shadow-md hover:-translate-y-1"
                    )}
                    onClick={() => handleProductClick(relatedProduct.id)}
                    data-testid="product-card"
                  >
                    <ProductCardBadge 
                      text={relatedProduct.badge_text || ''} 
                      color={relatedProduct.badge_color || '#22c55e'} 
                      isVisible={relatedProduct.badge_visible || false} 
                    />

                    {/* Favorite Button */}
                    <div className="absolute top-2 right-2 z-10">
                      <FavoriteButton productId={relatedProduct.id} size="sm" />
                    </div>
                    
                    <ProductCardImage product={relatedProduct} isHovered={false} />

                    <div className="flex flex-1 flex-col justify-between p-3">
                      <div className="space-y-2">
                        <ProductCardInfo product={relatedProduct} />
                        <ProductCardPrice product={relatedProduct} />
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RelatedProductsSection;
