
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductLight } from '@/hooks/useProducts/productApiOptimized';
import { ProductCardOptimized } from '../ProductCardOptimized';
import { cn } from '@/lib/utils';

interface ProductGridOptimizedProps {
  products: ProductLight[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onAddToCart?: (product: ProductLight) => void;
  className?: string;
  itemsPerRow?: number;
  gap?: string;
}

const ProductGridOptimized: React.FC<ProductGridOptimizedProps> = ({
  products,
  loading = false,
  hasMore = false,
  onLoadMore,
  onAddToCart,
  className,
  itemsPerRow = 5,
  gap = 'gap-4'
}) => {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [visibleProducts, setVisibleProducts] = useState<ProductLight[]>([]);
  const [displayCount, setDisplayCount] = useState(20);

  // Intersection Observer para carregamento infinito
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading) {
          onLoadMore();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, onLoadMore, loading]);

  // Virtualização simples - mostrar apenas produtos visíveis + buffer
  useEffect(() => {
    const visible = products.slice(0, displayCount);
    setVisibleProducts(visible);
  }, [products, displayCount]);

  // Expandir lista quando necessário
  useEffect(() => {
    if (products.length > displayCount && displayCount < products.length) {
      const timer = setTimeout(() => {
        setDisplayCount(prev => Math.min(prev + 20, products.length));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [products.length, displayCount]);

  const handleCardClick = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product?.slug) {
      navigate(`/produto/${product.slug}`);
    } else {
      navigate(`/produto/${productId}`);
    }
  }, [products, navigate]);

  const handleAddToCart = useCallback((product: ProductLight) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  }, [onAddToCart]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={cn(
      "grid",
      `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-${itemsPerRow}`,
      gap
    )}>
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="w-[200px] h-[320px] bg-gray-100 rounded-lg animate-pulse"
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
  );

  if (loading && products.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Grid de produtos */}
      <div className={cn(
        "grid",
        `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-${itemsPerRow}`,
        gap,
        "justify-items-center"
      )}>
        {visibleProducts.map((product, index) => (
          <ProductCardOptimized
            key={product.id}
            product={product}
            onCardClick={handleCardClick}
            onAddToCart={handleAddToCart}
            priority={index < 6}
            index={index}
          />
        ))}
      </div>

      {/* Loading mais produtos */}
      {loading && products.length > 0 && (
        <div className={cn(
          "grid",
          `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-${itemsPerRow}`,
          gap,
          "justify-items-center",
          "mt-4"
        )}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="w-[200px] h-[320px] bg-gray-100 rounded-lg animate-pulse"
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
      )}

      {/* Trigger para carregamento infinito */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center mt-8"
        >
          {loading ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span>Carregando mais produtos...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              Role para carregar mais produtos
            </div>
          )}
        </div>
      )}

      {/* Fim da lista */}
      {!hasMore && products.length > 0 && (
        <div className="text-center text-gray-500 mt-8 py-4">
          <p>Você viu todos os {products.length} produtos disponíveis</p>
        </div>
      )}

      {/* Lista vazia */}
      {!loading && products.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
              <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
          <p className="text-sm">Tente ajustar os filtros ou volte mais tarde</p>
        </div>
      )}
    </div>
  );
};

export default ProductGridOptimized;
