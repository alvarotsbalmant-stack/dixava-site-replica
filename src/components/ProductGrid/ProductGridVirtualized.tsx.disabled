import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useProductsOptimized } from '@/contexts/ProductContextOptimized';
import { ProductLight } from '@/hooks/useProducts/productApiOptimized';
import { ProductCardOptimized } from '../ProductCardOptimized';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductGridVirtualizedProps {
  className?: string;
  itemsPerRow?: number;
  gap?: string;
  filters?: {
    tags?: string[];
    featured?: boolean;
    priceRange?: [number, number];
    search?: string;
  };
}

const ProductGridVirtualized: React.FC<ProductGridVirtualizedProps> = ({
  className,
  itemsPerRow = 5,
  gap = 'gap-4',
  filters
}) => {
  const navigate = useNavigate();
  const { 
    productsLight, 
    loadingLight, 
    hasMore, 
    loadMoreProducts,
    refreshProducts 
  } = useProductsOptimized();
  
  const [filteredProducts, setFilteredProducts] = useState<ProductLight[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Filtrar produtos baseado nos filtros
  const applyFilters = useCallback((products: ProductLight[]) => {
    if (!filters) return products;

    return products.filter(product => {
      // Filtro por busca
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!product.name.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por featured
      if (filters.featured !== undefined) {
        if (product.is_featured !== filters.featured) {
          return false;
        }
      }

      // Filtro por faixa de preço
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        if (product.price < min || product.price > max) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Aplicar filtros quando produtos ou filtros mudarem
  useEffect(() => {
    const filtered = applyFilters(productsLight);
    setFilteredProducts(filtered);
  }, [productsLight, applyFilters]);

  // Intersection Observer para carregamento infinito
  useEffect(() => {
    if (!hasMore || loadingLight) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMoreProducts();
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
  }, [hasMore, loadingLight, loadMoreProducts]);

  const handleCardClick = useCallback((productId: string) => {
    const product = filteredProducts.find(p => p.id === productId);
    if (product?.slug) {
      navigate(`/produto/${product.slug}`);
    } else {
      navigate(`/produto/${productId}`);
    }
  }, [filteredProducts, navigate]);

  // Calcular responsividade
  const responsiveClasses = useMemo(() => {
    switch (itemsPerRow) {
      case 3:
        return 'grid-cols-2 md:grid-cols-3';
      case 4:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      case 5:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 6:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
      default:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    }
  }, [itemsPerRow]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={cn("grid", responsiveClasses, gap, "justify-items-center")}>
      {Array.from({ length: 20 }).map((_, index) => (
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

  // Loading inicial
  if (loadingLight && filteredProducts.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Estatísticas */}
      {filteredProducts.length > 0 && (
        <div className="mb-6 text-sm text-gray-600">
          Mostrando {filteredProducts.length} produtos
          {filters?.search && ` para "${filters.search}"`}
        </div>
      )}

      {/* Grid de produtos */}
      <div className={cn("grid", responsiveClasses, gap, "justify-items-center")}>
        {filteredProducts.map((product, index) => (
          <ProductCardOptimized
            key={product.id}
            product={product}
            onCardClick={handleCardClick}
            priority={index < 10} // Primeiros 10 produtos são prioritários
            index={index}
          />
        ))}
      </div>

      {/* Loading mais produtos */}
      {loadingLight && filteredProducts.length > 0 && (
        <div className={cn("grid", responsiveClasses, gap, "justify-items-center", "mt-8")}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={`loading-${index}`}
              className="w-[200px] h-[320px]"
            />
          ))}
        </div>
      )}

      {/* Trigger para carregamento infinito */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center mt-8"
        >
          {loadingLight ? (
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
      {!hasMore && filteredProducts.length > 0 && (
        <div className="text-center text-gray-500 mt-8 py-4">
          <p>Você viu todos os {filteredProducts.length} produtos disponíveis</p>
        </div>
      )}

      {/* Lista vazia */}
      {!loadingLight && filteredProducts.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
              <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
          <p className="text-sm">
            {filters?.search 
              ? `Nenhum produto encontrado para "${filters.search}"`
              : "Tente ajustar os filtros ou volte mais tarde"
            }
          </p>
          {filters && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductGridVirtualized;

