import React, { memo, useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';
import { ProductGridSkeleton, ProductSectionSkeleton } from '@/components/SkeletonLoading';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface OptimizedProductGridProps {
  category?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  columns?: 2 | 3 | 4 | 5;
  enableInfiniteScroll?: boolean;
  enableVirtualization?: boolean;
  showTitle?: boolean;
  className?: string;
  onProductClick?: (productId: string) => void;
}

// Componente de card de produto otimizado
const OptimizedProductCard = memo<{
  product: any;
  onProductClick?: (productId: string) => void;
  onAddToCart: (product: any) => void;
  onToggleFavorite: (productId: string) => void;
  isFavorite: boolean;
}>(({ product, onProductClick, onAddToCart, onToggleFavorite, isFavorite }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleProductClick = useCallback(() => {
    onProductClick?.(product.id);
  }, [onProductClick, product.id]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  }, [onAddToCart, product]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(product.id);
  }, [onToggleFavorite, product.id]);

  return (
    <div
      className={cn(
        'group relative bg-white rounded-lg border border-gray-200 overflow-hidden',
        'transition-all duration-300 hover:shadow-lg hover:border-gray-300',
        'cursor-pointer'
      )}
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container da imagem */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <OptimizedImage
          src={product.image}
          alt={product.name}
          className="w-full h-full"
          priority={false}
          placeholder="blur"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.hasDiscount && (
            <Badge variant="destructive" className="text-xs font-bold">
              -{product.discountPercentage}%
            </Badge>
          )}
          {product.is_featured && (
            <Badge variant="secondary" className="text-xs">
              Destaque
            </Badge>
          )}
        </div>

        {/* Botão de favorito */}
        <button
          onClick={handleToggleFavorite}
          className={cn(
            'absolute top-2 right-2 p-2 rounded-full transition-all duration-200',
            'bg-white/80 hover:bg-white shadow-sm',
            isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          )}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
        </button>

        {/* Overlay com ações (aparece no hover) */}
        <div
          className={cn(
            'absolute inset-0 bg-black/20 flex items-center justify-center gap-2',
            'transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAddToCart}
            className="bg-white/90 hover:bg-white text-gray-900"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Comprar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleProductClick}
            className="bg-white/90 hover:bg-white text-gray-900"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Informações do produto */}
      <div className="p-4 space-y-2">
        {/* Nome do produto */}
        <h3 className="font-medium text-base text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Preços */}
        <div className="space-y-1">
          {product.hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-green-600">
                {product.formattedPromotionalPrice}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {product.formattedPrice}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-gray-900">
              {product.formattedPrice}
            </span>
          )}

          {/* Preço UTI Pro */}
          {product.formattedUtiProPrice && (
            <div className="text-sm text-blue-600">
              UTI PRO: {product.formattedUtiProPrice}
            </div>
          )}
        </div>

        {/* Botão de compra (mobile) */}
        <Button
          onClick={handleAddToCart}
          className="w-full md:hidden"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

// Componente principal do grid
const OptimizedProductGrid: React.FC<OptimizedProductGridProps> = ({
  category,
  title,
  subtitle,
  limit = 12,
  columns = 4,
  enableInfiniteScroll = false,
  enableVirtualization = false,
  showTitle = true,
  className,
  onProductClick,
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Use the basic optimized products hook
  const { data: products, isLoading, error } = useOptimizedProducts();

  // Grid classes baseado no número de colunas
  const gridClasses = useMemo(() => {
    const baseClasses = 'grid gap-3 md:gap-4';
    const columnClasses = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    };
    return cn(baseClasses, columnClasses[columns]);
  }, [columns]);

  // Handlers
  const handleAddToCart = useCallback((product: any) => {
    addToCart(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  }, [addToCart]);

  const handleToggleFavorite = useCallback((productId: string) => {
    if (!user) {
      toast.error('Faça login para adicionar aos favoritos');
      return;
    }

    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        toast.success('Removido dos favoritos');
      } else {
        newFavorites.add(productId);
        toast.success('Adicionado aos favoritos');
      }
      return newFavorites;
    });
  }, [user]);

  // Filter products by category if specified
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!category) return products.slice(0, limit);
    return products.filter(p => p.category === category).slice(0, limit);
  }, [products, category, limit]);

  // Loading state
  if (isLoading && (!products || products.length === 0)) {
    return (
      <div className={className}>
        {showTitle && (
          <ProductSectionSkeleton title={!!title} count={limit} />
        )}
        {!showTitle && (
          <ProductGridSkeleton count={limit} columns={columns} />
        )}
      </div>
    );
  }

  // Empty state
  if (!isLoading && filteredProducts.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-gray-500">
          <div className="text-lg font-medium mb-2">Nenhum produto encontrado</div>
          <div className="text-sm">Tente ajustar os filtros ou volte mais tarde.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Título da seção estilo GameStop */}
      {showTitle && (title || subtitle) && (
        <div className="flex items-center justify-between mb-2 px-4 md:px-0">
          <div className="flex-1">
            {title && (
              <h2 className="text-xl md:text-4xl font-semibold leading-tight tracking-tight text-gray-900" style={{ fontFamily: 'Poppins, "Open Sans", sans-serif', letterSpacing: '-0.24px' }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Botão Ver Todos estilo GameStop */}
          <button className="bg-black text-white rounded font-semibold hover:bg-gray-800 transition-colors duration-200 flex-shrink-0 ml-4 flex items-center justify-center" style={{ 
            border: '2px solid #000000',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600',
            lineHeight: '1',
            height: '40px',
            minWidth: '78px',
            padding: '7px 9px'
          }}>
            Ver Todos
          </button>
        </div>
      )}

      {/* Grid de produtos */}
      <div className={gridClasses}>
        {filteredProducts.map((product, index) => (
          <OptimizedProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favorites.has(product.id)}
          />
        ))}
      </div>

      {/* Loading mais produtos */}
      {isLoading && filteredProducts.length > 0 && (
        <div className="mt-8">
          <ProductGridSkeleton count={4} columns={columns} />
        </div>
      )}
    </div>
  );
};

export default memo(OptimizedProductGrid);

