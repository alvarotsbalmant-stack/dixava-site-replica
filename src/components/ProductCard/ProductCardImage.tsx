
import React, { useState, useCallback } from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface ProductCardImageProps {
  product: Product;
  isHovered: boolean;
}

const ProductCardImage: React.FC<ProductCardImageProps> = React.memo(({ product, isHovered }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log(`[IMAGE ERROR] Falha ao carregar imagem: ${e.currentTarget.src}`);
    setImageError(true);
    e.currentTarget.onerror = null;
    // Usar uma imagem de placeholder mais genérica que definitivamente existe
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDIwMCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA2MEw5MCA3NUwxMjUgNDBMMTUwIDY1VjEyMEg1MFY2NUw3NSA2MFoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNzAiIGN5PSI1MCIgcj0iMTAiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
  }, []);

  // Criar um ID único para este componente específico
  const uniqueId = `product-image-${product.id}`;

  return (
    <div className="relative w-full overflow-hidden flex items-center justify-center bg-white" style={{ height: '192px' }}>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-16 h-16 bg-gray-200 rounded"></div>
        </div>
      )}
      <img
        id={uniqueId}
        src={product.image || '/placeholder-image.webp'}
        alt={product.name}
        className={cn(
          "h-full w-full object-contain p-2.5 transition-transform duration-300 ease-in-out",
          imageLoaded ? "opacity-100" : "opacity-0",
          isHovered ? "md:scale-105" : "scale-100"
        )}
        loading="lazy"
        decoding="async"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          contentVisibility: 'auto',
          containIntrinsicSize: '204px 192px'
        }}
      />
    </div>
  );
});

ProductCardImage.displayName = 'ProductCardImage';

export default ProductCardImage;
