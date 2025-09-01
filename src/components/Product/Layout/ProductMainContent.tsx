import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/hooks/useProducts';
import { SKUNavigation } from '@/hooks/useProducts/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Share2, ZoomIn, Info, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import FavoriteButton from '@/components/FavoriteButton';
import useDynamicPlatforms from '@/hooks/useDynamicPlatforms';

// Importar componentes especializados da MainContent
import RelatedProductsCarousel from '../MainContent/RelatedProductsCarousel';
import ProductSpecificationsTable from '../MainContent/ProductSpecificationsTable';
import ProductDescriptionExpandable from '../MainContent/ProductDescriptionExpandable';
import StorePickupBadge from '../MainContent/StorePickupBadge';
import GoogleReviews from '../Sidebar/GoogleReviews';

interface ProductMainContentProps {
  product: Product;
  skuNavigation?: SKUNavigation;
  layout?: 'gallery-vertical' | 'gallery-horizontal' | 'main-image' | 'product-info' | 'bottom-sections';
  className?: string;
}

const ProductMainContent: React.FC<ProductMainContentProps> = ({
  product,
  skuNavigation,
  layout = 'bottom-sections',
  className
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { platformConfig } = useDynamicPlatforms();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  // Combinar imagem principal com imagens adicionais
  const allImages = [product.image, ...(product.additional_images || [])].filter(Boolean);

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // COLUNA 1: Galeria Vertical
  if (layout === 'gallery-vertical') {
    return (
      <div className="space-y-2">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => handleImageClick(index)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all block ${
              currentImageIndex === index
                ? 'border-red-600 ring-2 ring-red-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={image}
              alt={`${product.name} ${index + 1}`}
              className="w-full h-full object-contain bg-white"
            />
          </button>
        ))}
        
        {/* Indicador de mais imagens */}
        {allImages.length > 6 && (
          <div className="w-16 h-16 rounded-lg border-2 border-gray-200 flex items-center justify-center bg-gray-50">
            <span className="text-xs font-medium text-gray-600">
              +{allImages.length - 6}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Galeria Horizontal
  if (layout === 'gallery-horizontal') {
    return (
      <div className="flex gap-3 justify-center max-w-md">
        {allImages.map((image, index) => (
          <button
            key={index}
            onClick={() => handleImageClick(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
              currentImageIndex === index
                ? 'border-red-600 ring-2 ring-red-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={image}
              alt={`${product.name} ${index + 1}`}
              className="w-full h-full object-contain bg-white"
            />
          </button>
        ))}
      </div>
    );
  }

  // COLUNA 2: Imagem Principal
  if (layout === 'main-image') {
    return (
      <div className="space-y-4">
        {/* Imagem Principal */}
        <div className="relative group">
          <div className="aspect-square bg-white rounded-lg overflow-hidden relative">
            <img
              src={allImages[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-200 cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            />
            
            {/* Zoom Overlay - Hover Effect como ML */}
            {isZoomed && (
              <div 
                className="absolute inset-0 bg-no-repeat pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  backgroundImage: `url(${allImages[currentImageIndex]})`,
                  backgroundSize: '200%',
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
                }}
              />
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_featured && (
                <Badge className="bg-red-600 text-white font-bold">
                  DESTAQUE
                </Badge>
              )}
              {product.badge_visible && product.badge_text && (
                <Badge 
                  className="font-bold text-white"
                  style={{ backgroundColor: product.badge_color || '#DC2626' }}
                >
                  {product.badge_text}
                </Badge>
              )}
            </div>

            {/* Ícone de Zoom */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black bg-opacity-50 rounded-full p-2">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnails para Mobile */}
        {allImages.length > 1 && (
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  currentImageIndex === index
                    ? 'border-red-600 ring-2 ring-red-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-contain bg-white"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // COLUNA 3: Título, Preço, Avaliações, Condições, Plataformas
  if (layout === 'product-info') {
    return (
      <div className="space-y-6 max-w-md">
        {/* Retirada na Loja e Social Proof */}
        <div className="flex items-center justify-between">
          <StorePickupBadge />
          <div className="flex items-center gap-2">
            <FavoriteButton productId={product.id} size="sm" />
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Título */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">
            {product.name}
          </h1>
        </div>

        {/* PREÇOS - ÚNICO E CORRETO */}
        <div className="space-y-4">
          <div className="flex items-baseline gap-3">
            {product.list_price && product.list_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                R$ {product.list_price.toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className="text-2xl font-semibold text-gray-900">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          {/* Badge de desconto */}
          {product.list_price && product.list_price > product.price && (
            <div>
              <Badge className="bg-red-600 text-white">
                -{Math.round(((product.list_price - product.price) / product.list_price) * 100)}% OFF
              </Badge>
            </div>
          )}
          
          {/* Parcelamento */}
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium">12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')} sem juros</p>
            <p>ou à vista no PIX com <span className="text-green-600 font-medium">5% desconto</span></p>
          </div>
        </div>



        {/* PLATAFORMAS - Só aparece para produtos com variações (SKUs) */}
        {(() => {
          console.log('[ProductMainContent] Debug plataformas:', {
            hasSkuNavigation: !!skuNavigation,
            hasPlatforms: !!(skuNavigation?.platforms),
            platformsLength: skuNavigation?.platforms?.length,
            platforms: skuNavigation?.platforms,
            productType: product?.product_type
          });
          
          if (skuNavigation && skuNavigation.platforms && skuNavigation.platforms.length > 1) {
            return (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  Plataforma:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {skuNavigation.platforms.map(({ platform, sku, available }, index) => {
                    const isCurrentPlatform = skuNavigation.currentSKU?.variant_attributes?.platform === platform;
                    
                    // Mapear nomes de plataforma para os slugs corretos
                    const platformMapping: { [key: string]: string } = {
                      'PlayStation 3': 'ps3',
                      'PlayStation 4': 'ps4', 
                      'Xbox 360': 'xbox-360',
                      'Xbox One': 'xbox-one',
                      'PC': 'pc',
                      'Mobile': 'mobile',
                      'Nintendo Switch': 'nintendo-switch'
                    };
                    
                    const platformSlug = platformMapping[platform] || platform.toLowerCase().replace(/\s+/g, '-');
                    const platformInfo = platformConfig[platformSlug];
                    
                    // Se não encontrou a configuração, usar dados padrão
                    const displayInfo = platformInfo || {
                      name: platform,
                      icon: '🎮',
                      color: '#000000'
                    };
                    
                    return (
                      <Button
                        key={`${platform}-${sku?.id || index}`}
                        variant={isCurrentPlatform ? "default" : "outline"}
                        size="sm"
                        className={isCurrentPlatform 
                          ? "bg-red-600 hover:bg-red-700 text-white" 
                          : "bg-white hover:bg-red-50 border-gray-300 hover:border-red-400 text-gray-800"
                        }
                        onClick={() => {
                          if (available && sku && !isCurrentPlatform) {
                            navigate(`/produto/${sku.id}`);
                          }
                        }}
                        disabled={!available}
                      >
                        {displayInfo.icon.startsWith('http') ? (
                          <>
                            <img 
                              src={displayInfo.icon} 
                              alt={displayInfo.name}
                              className="w-4 h-4 mr-1"
                            />
                            {displayInfo.name}
                          </>
                        ) : (
                          <>
                            <span className="mr-1">{displayInfo.icon}</span>
                            {displayInfo.name}
                          </>
                        )}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500">
                  💡 Preços podem variar entre plataformas
                </p>
              </div>
            );
          } else {
            return null;
          }
        })()}

        {/* APENAS DESCRIÇÃO EXPANDÍVEL APÓS AVISO DE PREÇOS */}
        <div className="mt-8">
          <ProductDescriptionExpandable product={product} />
        </div>
      </div>
    );
  }


  // SEÇÕES INFERIORES (layout padrão) - Restaurar elementos removidos
  return (
    <div className={cn("space-y-8", className)}>
      {/* 1. Avaliações Google - Substituindo Especificações Técnicas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-blue-100 p-2 rounded-full">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Avaliações Google</h3>
        </div>
        <div className="flex justify-center">
          <GoogleReviews className="max-w-none w-full" />
        </div>
      </div>

      {/* 2. Informações Importantes */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
            <Info className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-yellow-800">Informações Importantes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Especificações podem variar conforme atualizações do fabricante</li>
              <li>• Recursos online dependem de conexão com a internet</li>
              <li>• Algumas funcionalidades podem requerer assinatura de serviços</li>
              <li>• Verifique compatibilidade com sua versão do console</li>
              <li>• Garantia da UTI dos Games: conforme legislação vigente</li>
            </ul>
          </div>
        </div>
      </div>


      {/* 3. Produtos Relacionados */}
      <RelatedProductsCarousel 
        currentProduct={product}
      />

      {/* 4. Call-to-Action Final */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-8 text-center shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <h4 className="text-2xl font-bold text-slate-900 mb-3">
            Gostou deste produto?
          </h4>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            Adicione ao carrinho agora e aproveite nossas condições especiais!
          </p>
          
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              💬 Finalizamos todas as vendas pelo WhatsApp para melhor atendimento!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMainContent;

