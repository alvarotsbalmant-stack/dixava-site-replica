import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/hooks/useProducts';
import type { SpecialSection } from '@/types/specialSections/core';

interface ProductCarouselRendererProps {
  section: SpecialSection;
  className?: string;
}

export const ProductCarouselRenderer: React.FC<ProductCarouselRendererProps> = ({
  section,
  className = ''
}) => {
  const config = section.config as any;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplayInterval, setAutoplayInterval] = useState<NodeJS.Timeout | null>(null);

  const { products: allProducts } = useProducts();

  // Filtrar produtos baseado na configuração
  const products = React.useMemo(() => {
    if (!allProducts) return [];

    let filtered = allProducts;

    // Filtrar por seleção
    if (config.selectionType === 'manual' && config.selectedProductIds?.length > 0) {
      filtered = allProducts.filter(product => 
        config.selectedProductIds.includes(product.id)
      );
    } else if (config.selectionType === 'by_tag' && config.selectedTags?.length > 0) {
      filtered = allProducts.filter(product =>
        product.tags?.some(tag => config.selectedTags.includes(tag))
      );
    } else if (config.selectionType === 'by_category' && config.selectedCategory) {
      filtered = allProducts.filter(product =>
        product.category === config.selectedCategory
      );
    }

    // Limitar quantidade
    const maxProducts = config.maxProducts || 12;
    return filtered.slice(0, maxProducts);
  }, [allProducts, config]);

  // Configurações responsivas
  const itemsPerView = {
    mobile: config.itemsPerView?.mobile || 2,
    tablet: config.itemsPerView?.tablet || 3,
    desktop: config.itemsPerView?.desktop || 4
  };

  // Autoplay
  useEffect(() => {
    if (config.enableAutoplay && products.length > itemsPerView.desktop) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          const maxIndex = Math.max(0, products.length - itemsPerView.desktop);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, config.autoplayDelay || 3000);

      setAutoplayInterval(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [config.enableAutoplay, config.autoplayDelay, products.length, itemsPerView.desktop]);

  // Navegação
  const goToPrevious = () => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      setAutoplayInterval(null);
    }
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      setAutoplayInterval(null);
    }
    const maxIndex = Math.max(0, products.length - itemsPerView.desktop);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Adicionar ao carrinho
  const handleAddToCart = (productId: string) => {
    // Implementar lógica do carrinho
  };

  if (!products.length) {
    return null; // Não renderizar se não houver produtos
  }

  const maxIndex = Math.max(0, products.length - itemsPerView.desktop);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  return (
    <section className={`space-y-6 ${className}`}>
      {/* Header */}
      {(config.title || config.subtitle) && (
        <div className="text-center">
          {config.title && (
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {config.title}
            </h2>
          )}
          {config.subtitle && (
            <p className="text-gray-600 text-lg">
              {config.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Carrossel */}
      <div className="relative">
        {/* Botões de navegação */}
        {products.length > itemsPerView.desktop && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
              onClick={goToPrevious}
              disabled={!canGoPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
              onClick={goToNext}
              disabled={!canGoNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Container dos produtos */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView.desktop)}%)`
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 px-2"
                style={{
                  width: `${100 / itemsPerView.desktop}%`
                }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Imagem do produto */}
                  <div className="relative aspect-square">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sem imagem</span>
                      </div>
                    )}

                    {/* Badge de desconto */}
                    {product.promotional_price && product.promotional_price < product.price && (
                      <Badge className="absolute top-2 left-2 bg-red-500">
                        -{Math.round(((product.price - product.promotional_price) / product.price) * 100)}%
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Nome do produto */}
                    <h4 className="font-medium text-sm mb-2 line-clamp-2">
                      {product.name}
                    </h4>

                    {/* Avaliação */}
                    {config.showRating && product.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-yellow-400 text-sm">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating || 0)
                                  ? 'fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({product.rating?.toFixed(1)})
                        </span>
                      </div>
                    )}

                    {/* Preços */}
                    {config.showPrice && (
                      <div className="mb-3">
                        {product.promotional_price && product.promotional_price < product.price ? (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500 line-through">
                              R$ {product.price.toFixed(2)}
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              R$ {product.promotional_price.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-green-600">
                            R$ {product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Botão de adicionar ao carrinho */}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Indicadores */}
        {products.length > itemsPerView.desktop && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Informações adicionais */}
      {config.enableAutoplay && (
        <div className="text-center text-sm text-gray-500">
          <p>Navegação automática ativa</p>
        </div>
      )}
    </section>
  );
};

