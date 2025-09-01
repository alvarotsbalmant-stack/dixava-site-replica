import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductGalleryProps {
  product: Product;
  layout?: 'vertical' | 'main';
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ product, layout = 'main' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  
  // Combinar imagem principal com imagens adicionais
  const allImages = [product.image, ...(product.additional_images || [])].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Layout Vertical (Coluna 1 - Miniaturas)
  if (layout === 'vertical') {
    return (
      <div className="hidden lg:block space-y-2">
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

  // Layout Main (Coluna 2 - Imagem Principal)
  return (
    <div className="space-y-4">
      {/* Imagem Principal */}
      <div className="relative group">
        <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 relative">
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

          {/* Navegação de Imagens */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
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

      {/* Indicador de Imagens para Mobile */}
      {allImages.length > 1 && (
        <div className="lg:hidden flex justify-center gap-2">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentImageIndex === index
                  ? 'bg-red-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;

