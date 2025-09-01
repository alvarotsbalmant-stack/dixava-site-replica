import React, { useState, useCallback } from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface SearchResultProductCardImageProps {
  product: Product;
  isHovered: boolean;
}

const SearchResultProductCardImage: React.FC<SearchResultProductCardImageProps> = React.memo(({ product, isHovered }) => {
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
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIyMCIgdmlld0JveD0iMCAwIDIwMCAyMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03NSA4MEw5MCA5NUwxMjUgNjBMMTUwIDg1VjE2MEg1MFY4NUw3NSA4MFoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iMTAiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
  }, []);

  // Criar um ID único para este componente específico
  const uniqueId = `search-result-product-image-${product.id}`;

  return (
    <div className="relative w-full overflow-hidden flex items-center justify-center bg-white" style={{ height: '220px' }}>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-20 h-20 bg-gray-200 rounded"></div>
        </div>
      )}
      <img
        id={uniqueId}
        src={product.image || '/placeholder-image.webp'}
        alt={product.name}
        className={cn(
          "h-full w-full object-contain p-3 transition-transform duration-300 ease-in-out",
          imageLoaded ? "opacity-100" : "opacity-0",
          isHovered ? "scale-105" : "scale-100"
        )}
        loading="lazy"
        decoding="async"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          contentVisibility: 'auto',
          containIntrinsicSize: '200px 220px'
        }}
      />
    </div>
  );
});

SearchResultProductCardImage.displayName = 'SearchResultProductCardImage';

export default SearchResultProductCardImage;

