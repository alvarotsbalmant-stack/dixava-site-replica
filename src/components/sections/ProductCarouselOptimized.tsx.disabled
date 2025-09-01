import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useProductsOptimized } from '@/contexts/ProductContextOptimized';
import { ProductLight } from '@/hooks/useProducts/productApiOptimized';
import { ProductCardOptimized } from '../ProductCardOptimized';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCarouselOptimizedProps {
  title: string;
  config: {
    product_ids?: string[];
    tags?: string[];
    sort_by?: 'created_at' | 'price' | 'name';
    sort_order?: 'asc' | 'desc';
    filter_featured?: boolean;
    limit?: number;
  };
  className?: string;
  showViewAll?: boolean;
  viewAllLink?: string;
}

const ProductCarouselOptimized: React.FC<ProductCarouselOptimizedProps> = ({
  title,
  config,
  className,
  showViewAll = true,
  viewAllLink
}) => {
  const navigate = useNavigate();
  const { loadProductsForSection } = useProductsOptimized();
  const [products, setProducts] = useState<ProductLight[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(5);

  // Calcular itens por visualização baseado no tamanho da tela
  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerView(2);
      else if (width < 768) setItemsPerView(3);
      else if (width < 1024) setItemsPerView(4);
      else setItemsPerView(5);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Carregar produtos baseado na configuração
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let loadedProducts: ProductLight[] = [];

        if (config.product_ids && config.product_ids.length > 0) {
          // Carregar produtos específicos por ID
          loadedProducts = await loadProductsForSection({
            productIds: config.product_ids,
            limit: config.limit || 12
          });
        } else if (config.tags && config.tags.length > 0) {
          // Carregar produtos por tags
          loadedProducts = await loadProductsForSection({
            tags: config.tags,
            limit: config.limit || 12,
            sortBy: config.sort_by,
            sortOrder: config.sort_order,
            filterFeatured: config.filter_featured
          });
        } else {
          // Carregar produtos gerais
          loadedProducts = await loadProductsForSection({
            limit: config.limit || 12,
            sortBy: config.sort_by || 'created_at',
            sortOrder: config.sort_order || 'desc',
            filterFeatured: config.filter_featured
          });
        }

        setProducts(loadedProducts);
      } catch (error) {
        console.error('[ProductCarouselOptimized] Erro ao carregar produtos:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [config, loadProductsForSection]);

  const handleCardClick = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product?.slug) {
      navigate(`/produto/${product.slug}`);
    } else {
      navigate(`/produto/${productId}`);
    }
  }, [products, navigate]);

  const handleViewAll = useCallback(() => {
    if (viewAllLink) {
      navigate(viewAllLink);
    }
  }, [viewAllLink, navigate]);

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < products.length - itemsPerView;

  const scrollLeft = useCallback(() => {
    if (canScrollLeft) {
      setCurrentIndex(prev => Math.max(0, prev - itemsPerView));
    }
  }, [canScrollLeft, itemsPerView]);

  const scrollRight = useCallback(() => {
    if (canScrollRight) {
      setCurrentIndex(prev => Math.min(products.length - itemsPerView, prev + itemsPerView));
    }
  }, [canScrollRight, itemsPerView, products.length]);

  const visibleProducts = useMemo(() => {
    return products.slice(currentIndex, currentIndex + itemsPerView);
  }, [products, currentIndex, itemsPerView]);

  if (loading) {
    return (
      <section className={cn("py-8", className)}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: itemsPerView }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="w-full h-[320px] bg-gray-100 rounded-lg animate-pulse"
              >
                <div className="h-[160px] bg-gray-200 rounded-t-lg"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-8", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {showViewAll && viewAllLink && (
            <Button
              onClick={handleViewAll}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Ver Todos
            </Button>
          )}
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          {products.length > itemsPerView && (
            <>
              <Button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                variant="outline"
                size="icon"
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg",
                  !canScrollLeft && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={scrollRight}
                disabled={!canScrollRight}
                variant="outline"
                size="icon"
                className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg",
                  !canScrollRight && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-12">
            {visibleProducts.map((product, index) => (
              <ProductCardOptimized
                key={product.id}
                product={product}
                onCardClick={handleCardClick}
                priority={index < 3} // Primeiros 3 produtos são prioritários
                index={currentIndex + index}
              />
            ))}
          </div>

          {/* Indicators */}
          {products.length > itemsPerView && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ 
                length: Math.ceil(products.length / itemsPerView) 
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * itemsPerView)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    Math.floor(currentIndex / itemsPerView) === index
                      ? "bg-red-600"
                      : "bg-gray-300"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductCarouselOptimized;

