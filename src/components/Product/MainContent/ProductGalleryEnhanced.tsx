import React, { useState, useEffect } from 'react';
import { Product } from '@/hooks/useProducts';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductGalleryEnhancedProps {
  product: Product;
  className?: string;
}

const ProductGalleryEnhanced: React.FC<ProductGalleryEnhancedProps> = ({ 
  product, 
  className 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Combinar imagem principal com imagens adicionais
  const allImages = [product.image, ...(product.additional_images || [])].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    setZoomLevel(1);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    setZoomLevel(1);
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setZoomLevel(1);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    setZoomLevel(isZoomed ? 1 : 2);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setZoomLevel(1);
    setIsZoomed(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
            prevImage();
            break;
          case 'ArrowRight':
            nextImage();
            break;
          case 'Escape':
            setIsFullscreen(false);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Imagem Principal - Maior */}
        <div className="relative group">
          <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 relative">
            <img
              src={allImages[currentImageIndex]}
              alt={`${product.name} - Imagem ${currentImageIndex + 1}`}
              className={cn(
                "w-full h-full object-contain transition-all duration-300 cursor-pointer",
                isZoomed && "scale-150"
              )}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }
                  : {}
              }
              onClick={toggleZoom}
              onMouseMove={handleMouseMove}
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_featured && (
                <Badge className="bg-red-600 text-white font-bold shadow-lg">
                  DESTAQUE
                </Badge>
              )}
              {product.badge_visible && product.badge_text && (
                <Badge 
                  className="font-bold text-white shadow-lg"
                  style={{ backgroundColor: product.badge_color || '#DC2626' }}
                >
                  {product.badge_text}
                </Badge>
              )}
              {product.list_price && product.list_price > product.price && (
                <Badge className="bg-green-600 text-white font-bold shadow-lg">
                  -{Math.round(((product.list_price - product.price) / product.list_price) * 100)}% OFF
                </Badge>
              )}
            </div>

            {/* Controles de Zoom */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                onClick={toggleZoom}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white border-0"
              >
                {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={toggleFullscreen}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white border-0"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Navegação de Imagens */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}

            {/* Indicador de Imagem */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnails - Melhoradas */}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                  currentImageIndex === index
                    ? "border-red-500 ring-2 ring-red-200"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <img
                  src={image}
                  alt={`${product.name} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-contain bg-white"
                />
              </button>
            ))}
          </div>
        )}

        {/* Informações da Imagem */}
        <div className="text-sm text-gray-600 space-y-1">
          <div>📸 Imagens reais do produto</div>
          <div>🔍 Clique para ampliar</div>
          {allImages.length > 1 && (
            <div>⌨️ Use as setas do teclado para navegar</div>
          )}
        </div>
      </div>

      {/* Modal Fullscreen */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            {/* Botão Fechar */}
            <Button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Imagem Fullscreen */}
            <img
              src={allImages[currentImageIndex]}
              alt={`${product.name} - Fullscreen`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navegação Fullscreen */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Indicador Fullscreen */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductGalleryEnhanced;

