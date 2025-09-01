import React, { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useProductPrefetch } from '@/hooks/useAdvancedPrefetch';
import { ComponentErrorBoundary, ProductErrorFallback } from '@/components/ErrorBoundaries/AdvancedErrorBoundary';
import { ProductCardSkeleton } from '@/components/skeletons/AdvancedSkeletons';
import { Product } from '@/hooks/useProducts/types';
import { cn } from '@/lib/utils';

interface OptimizedProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
  showQuickActions?: boolean;
  showBadge?: boolean;
  showProPrice?: boolean;
  className?: string;
  loading?: boolean;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

// Componente de imagem otimizada
const OptimizedProductImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = memo(({ src, alt, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <div className={cn('relative overflow-hidden bg-gray-100', className)}>
      {!imageLoaded && (
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" />
      )}
      
      {!imageError ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded" />
            <span className="text-xs">Imagem indisponível</span>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedProductImage.displayName = 'OptimizedProductImage';

// Componente principal do card
const OptimizedProductCardComponent: React.FC<OptimizedProductCardProps> = ({
  product,
  variant = 'grid',
  showQuickActions = true,
  showBadge = true,
  showProPrice = true,
  className,
  loading = false,
  onAddToCart,
  onAddToWishlist,
  onQuickView
}) => {
  const { getProductHoverProps } = useProductPrefetch();
  const [isHovered, setIsHovered] = useState(false);

  // Props de hover para prefetch
  const hoverProps = getProductHoverProps(product.id);

  // Handlers otimizados
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  }, [onAddToCart, product]);

  const handleAddToWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product);
  }, [onAddToWishlist, product]);

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  }, [onQuickView, product]);

  // Formatação de preço otimizada
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }, []);

  // Mostrar skeleton se loading
  if (loading) {
    return <ProductCardSkeleton variant={variant} />;
  }

  // Layout para lista
  if (variant === 'list') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow duration-200', className)}>
        <Link 
          to={`/produto/${product.id}`}
          className="flex p-4 space-x-4"
          {...hoverProps}
        >
          <OptimizedProductImage
            src={product.image}
            alt={product.name}
            className="w-24 h-24 rounded-md flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 mb-1">
              {product.name}
            </h3>
            
            <p className="text-xs text-gray-600 mb-2">
              {product.brand}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {product.list_price && product.list_price > product.price && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.list_price)}
                  </span>
                )}
                <div className="font-bold text-green-600">
                  {formatPrice(product.price)}
                </div>
                {showProPrice && product.pro_price && (
                  <div className="text-xs text-orange-600">
                    PRO: {formatPrice(product.pro_price)}
                  </div>
                )}
              </div>
              
              {showQuickActions && (
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddToWishlist}
                    className="p-2"
                  >
                    <Heart className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    className="p-2"
                  >
                    <ShoppingCart className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  // Layout para grid (padrão)
  return (
    <Card 
      className={cn(
        'group hover:shadow-lg transition-all duration-300 overflow-hidden',
        isHovered && 'scale-[1.02]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link 
        to={`/produto/${product.id}`}
        className="block"
        {...hoverProps}
      >
        <div className="relative">
          {/* Badge */}
          {showBadge && product.badge_visible && product.badge_text && (
            <Badge 
              className="absolute top-2 left-2 z-10"
              style={{ backgroundColor: product.badge_color }}
            >
              {product.badge_text}
            </Badge>
          )}
          
          {/* Quick actions */}
          {showQuickActions && (
            <div className={cn(
              'absolute top-2 right-2 z-10 flex flex-col space-y-1 transition-opacity duration-200',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAddToWishlist}
                className="p-2 bg-white/90 hover:bg-white"
              >
                <Heart className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleQuickView}
                className="p-2 bg-white/90 hover:bg-white"
              >
                <Eye className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          {/* Imagem */}
          <OptimizedProductImage
            src={product.image}
            alt={product.name}
            className="aspect-square"
          />
        </div>
        
        <CardContent className="p-4 space-y-2">
          {/* Nome do produto */}
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          {/* Marca */}
          <p className="text-xs text-gray-600">
            {product.brand}
          </p>
          
          {/* Preços */}
          <div className="space-y-1">
            {product.list_price && product.list_price > product.price && (
              <span className="text-xs text-gray-400 line-through block">
                {formatPrice(product.list_price)}
              </span>
            )}
            
            <div className="font-bold text-green-600 text-lg">
              {formatPrice(product.price)}
            </div>
            
            {showProPrice && product.pro_price && (
              <div className="text-sm text-orange-600 font-medium">
                PRO: {formatPrice(product.pro_price)}
              </div>
            )}
          </div>
          
          {/* Botão de adicionar ao carrinho */}
          {showQuickActions && (
            <Button
              onClick={handleAddToCart}
              className="w-full mt-3"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};

// Componente com error boundary
export const OptimizedProductCard = memo((props: OptimizedProductCardProps) => (
  <ComponentErrorBoundary
    fallback={ProductErrorFallback}
    maxRetries={2}
  >
    <OptimizedProductCardComponent {...props} />
  </ComponentErrorBoundary>
));

OptimizedProductCard.displayName = 'OptimizedProductCard';

