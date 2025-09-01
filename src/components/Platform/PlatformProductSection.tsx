import React from 'react';
import { ProductShowcase, PlatformTheme } from '@/types/platformPages';
import { Product } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';

interface PlatformProductSectionProps {
  config: ProductShowcase;
  theme: PlatformTheme;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (productId: string) => void;
  className?: string;
}

const PlatformProductSection: React.FC<PlatformProductSectionProps> = ({
  config,
  theme,
  products,
  onAddToCart,
  onProductClick,
  className = ''
}) => {
  const getGridClasses = () => {
    const columns = config.columns || 4;
    const gridMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };
    return gridMap[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  };

  const getCardStyles = () => {
    const baseStyles = {
      backgroundColor: theme.backgroundColor === '#FFFFFF' ? '#FAFAFA' : 'rgba(255, 255, 255, 0.05)',
      borderColor: theme.accentColor,
      borderRadius: theme.borderRadius,
    };

    switch (theme.brandElements?.cardStyle) {
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: `0 8px 25px ${theme.shadowColor}`,
          border: 'none',
        };
      case 'flat':
        return {
          ...baseStyles,
          boxShadow: 'none',
          border: 'none',
        };
      case 'outlined':
        return {
          ...baseStyles,
          boxShadow: 'none',
          border: `2px solid ${theme.accentColor}`,
        };
      default:
        return baseStyles;
    }
  };

  const getButtonStyles = () => {
    const baseStyles = {
      backgroundColor: theme.primaryColor,
      color: theme.textColor,
      borderRadius: theme.borderRadius,
    };

    switch (theme.brandElements?.buttonStyle) {
      case 'rounded':
        return { ...baseStyles, borderRadius: '8px' };
      case 'sharp':
        return { ...baseStyles, borderRadius: '4px' };
      case 'pill':
        return { ...baseStyles, borderRadius: '9999px' };
      default:
        return baseStyles;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const renderProductCard = (product: Product) => (
    <Card 
      key={product.id}
      className="cursor-pointer transition-all duration-300"
      style={getCardStyles()}
      onClick={() => onProductClick(product.id)}
    >
      <CardContent className="p-0">
        {/* Imagem do Produto */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badge_visible && product.badge_text && (
              <Badge 
                className="text-xs font-semibold"
                style={{
                  backgroundColor: product.badge_color || theme.accentColor,
                  color: theme.backgroundColor,
                }}
              >
                {product.badge_text}
              </Badge>
            )}
            {product.is_featured && (
              <Badge 
                className="text-xs font-semibold"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: theme.textColor,
                }}
              >
                DESTAQUE
              </Badge>
            )}
          </div>

          {/* Ações rápidas */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 transition-opacity duration-300">
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: theme.accentColor,
              }}
            >
              <Heart className="h-4 w-4" style={{ color: theme.accentColor }} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 p-0"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: theme.accentColor,
              }}
            >
              <Eye className="h-4 w-4" style={{ color: theme.accentColor }} />
            </Button>
          </div>

          {/* Overlay de desconto */}
          {product.list_price && product.price < product.list_price && (
            <div 
              className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-bold"
              style={{
                backgroundColor: '#E60012',
                color: '#FFFFFF',
              }}
            >
              -{Math.round(((product.list_price - product.price) / product.list_price) * 100)}%
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div className="p-4">
          <h3 
            className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]"
            style={{ color: theme.textColor }}
          >
            {product.name}
          </h3>

          {/* Avaliação */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating!) 
                        ? 'fill-current' 
                        : 'fill-gray-300'
                    }`}
                    style={{ 
                      color: i < Math.floor(product.rating!) 
                        ? theme.accentColor 
                        : '#D1D5DB' 
                    }}
                  />
                ))}
              </div>
              <span 
                className="text-xs"
                style={{ color: theme.textColor, opacity: 0.7 }}
              >
                ({product.rating})
              </span>
            </div>
          )}

          {/* Preços */}
          <div className="mb-3">
            {config.showPrices && (
              <div className="flex items-center gap-2">
                <span 
                  className="font-bold text-lg"
                  style={{ color: theme.primaryColor }}
                >
                  {formatPrice(product.price)}
                </span>
                {product.list_price && product.list_price > product.price && (
                  <span 
                    className="text-sm line-through"
                    style={{ color: theme.textColor, opacity: 0.5 }}
                  >
                    {formatPrice(product.list_price)}
                  </span>
                )}
              </div>
            )}
            
            {product.pro_price && (
              <div className="flex items-center gap-1 mt-1">
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{
                    borderColor: theme.accentColor,
                    color: theme.accentColor,
                  }}
                >
                  PRO
                </Badge>
                <span 
                  className="text-sm font-semibold"
                  style={{ color: theme.accentColor }}
                >
                  {formatPrice(product.pro_price)}
                </span>
              </div>
            )}
          </div>

          {/* Botão de Adicionar ao Carrinho */}
          <Button
            className="w-full text-sm font-semibold transition-all duration-300"
            style={getButtonStyles()}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderGridLayout = () => (
    <div className={`grid ${getGridClasses()} gap-6`}>
      {products.map(renderProductCard)}
    </div>
  );

  const renderCarouselLayout = () => (
    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
      {products.map((product) => (
        <div key={product.id} className="flex-none w-64">
          {renderProductCard(product)}
        </div>
      ))}
    </div>
  );

  const renderFeaturedLayout = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Produto principal */}
      {products[0] && (
        <div className="lg:col-span-2">
          <Card 
            className="group cursor-pointer overflow-hidden"
            style={getCardStyles()}
            onClick={() => onProductClick(products[0].id)}
          >
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="aspect-square">
                  <img
                    src={products[0].image || '/placeholder.svg'}
                    alt={products[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge 
                    className="mb-4 w-fit"
                    style={{
                      backgroundColor: theme.accentColor,
                      color: theme.backgroundColor,
                    }}
                  >
                    PRODUTO EM DESTAQUE
                  </Badge>
                  <h3 
                    className="text-2xl font-bold mb-4"
                    style={{ color: theme.textColor }}
                  >
                    {products[0].name}
                  </h3>
                  <p 
                    className="text-lg mb-6 opacity-80"
                    style={{ color: theme.textColor }}
                  >
                    {products[0].description}
                  </p>
                  <div className="mb-6">
                    <span 
                      className="text-3xl font-bold"
                      style={{ color: theme.primaryColor }}
                    >
                      {formatPrice(products[0].price)}
                    </span>
                  </div>
                  <Button
                    size="lg"
                    className="w-fit"
                    style={getButtonStyles()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(products[0]);
                    }}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Adicionar ao Carrinho
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Produtos secundários */}
      <div className="space-y-6">
        {products.slice(1, 4).map(renderProductCard)}
      </div>
    </div>
  );

  return (
    <section 
      className={`py-16 ${className}`}
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da seção */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              fontFamily: theme.headingFont || theme.fontFamily,
              color: theme.textColor,
            }}
          >
            {config.title}
          </h2>
          {config.subtitle && (
            <p 
              className="text-xl"
              style={{ color: theme.accentColor }}
            >
              {config.subtitle}
            </p>
          )}
        </div>

        {/* Renderizar layout baseado no tipo */}
        {config.type === 'carousel' && renderCarouselLayout()}
        {config.type === 'featured' && renderFeaturedLayout()}
        {(config.type === 'grid' || !config.type) && renderGridLayout()}
      </div>
    </section>
  );
};

export default PlatformProductSection;
