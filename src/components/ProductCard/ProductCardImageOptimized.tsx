import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { optimizeImageUrl, OPTIMIZED_PLACEHOLDER, preloadImage } from '@/utils/imageOptimization';

interface ProductCardImageOptimizedProps {
  product: Product;
  isHovered: boolean;
  priority?: boolean; // Para imagens críticas (above the fold)
}

// Cache de imagens carregadas
const imageCache = new Set<string>();

const ProductCardImageOptimized: React.FC<ProductCardImageOptimizedProps> = React.memo(({ 
  product, 
  isHovered, 
  priority = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Se for priority, carrega imediatamente
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || isInView) return; // Não precisa de observer se já está carregando

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Começar a carregar 50px antes de entrar na viewport
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    if (product.image) {
      imageCache.add(product.image);
    }
  }, [product.image]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log(`[IMAGE ERROR] Falha ao carregar imagem: ${e.currentTarget.src}`);
    setImageError(true);
    e.currentTarget.onerror = null;
    e.currentTarget.src = OPTIMIZED_PLACEHOLDER;
  }, []);

  // URLs otimizadas
  const optimizedImageUrl = optimizeImageUrl(product.image, 200, 160);
  const shouldLoadImage = isInView && !imageError;

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden flex items-center justify-center bg-gray-50" 
      style={{ height: '160px' }}
    >
      {/* Loading skeleton */}
      {!imageLoaded && shouldLoadImage && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
        </div>
      )}

      {/* Placeholder quando não está carregando */}
      {!shouldLoadImage && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
              <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      )}

      {/* Imagem principal */}
      {shouldLoadImage && (
        <img
          ref={imgRef}
          src={optimizedImageUrl || OPTIMIZED_PLACEHOLDER}
          alt={product.name}
          className={cn(
            "h-full w-full object-contain p-2 transition-all duration-300 ease-in-out",
            imageLoaded ? "opacity-100" : "opacity-0",
            isHovered && imageLoaded ? "scale-105" : "scale-100"
          )}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: '200px 160px'
          }}
          // Preconnect para domínios de imagem
          {...(priority && {
            fetchPriority: 'high' as any
          })}
        />
      )}
    </div>
  );
});

ProductCardImageOptimized.displayName = 'ProductCardImageOptimized';

export default ProductCardImageOptimized;

