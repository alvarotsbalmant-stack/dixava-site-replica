import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  quality?: number;
}

// Cache de imagens carregadas
const imageCache = new Set<string>();

// Função para gerar placeholder blur simples
const generateBlurDataURL = (width: number = 10, height: number = 10) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Gradiente simples para placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

// Hook para intersection observer
const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        rootMargin: '50px', // Carregar 50px antes de aparecer
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  sizes,
  quality = 75,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isInView = useIntersectionObserver(containerRef, {
    rootMargin: '100px', // Carregar 100px antes
  });

  // Gerar placeholder se não fornecido
  const defaultBlurDataURL = blurDataURL || generateBlurDataURL();

  // Função para preload de imagem
  const preloadImage = useCallback((imageSrc: string) => {
    return new Promise<void>((resolve, reject) => {
      if (imageCache.has(imageSrc)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        imageCache.add(imageSrc);
        resolve();
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  }, []);

  // Carregar imagem quando em view ou priority
  useEffect(() => {
    if (!src || isLoaded || isError) return;
    if (!priority && !isInView) return;

    const loadImage = async () => {
      try {
        await preloadImage(src);
        setCurrentSrc(src);
        setIsLoaded(true);
        onLoad?.();
      } catch (error) {
        setIsError(true);
        onError?.();
      }
    };

    loadImage();
  }, [src, isInView, priority, isLoaded, isError, preloadImage, onLoad, onError]);

  // Preload de imagens priority imediatamente
  useEffect(() => {
    if (priority && src) {
      preloadImage(src);
    }
  }, [priority, src, preloadImage]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setIsError(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-gray-100',
        className
      )}
      style={{ width, height }}
    >
      {/* Placeholder blur */}
      {placeholder === 'blur' && !isLoaded && !isError && (
        <img
          src={defaultBlurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Shimmer effect durante carregamento */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      )}

      {/* Imagem principal */}
      {(currentSrc || priority) && !isError && (
        <img
          ref={imgRef}
          src={currentSrc || src}
          alt={alt}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
        />
      )}

      {/* Fallback para erro */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Loading indicator */}
      {!isLoaded && !isError && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Componente específico para produtos
export const ProductImage: React.FC<OptimizedImageProps & {
  productId?: string;
  variant?: 'card' | 'detail' | 'thumbnail';
}> = ({
  productId,
  variant = 'card',
  className,
  ...props
}) => {
  const variantClasses = {
    card: 'aspect-square rounded-lg',
    detail: 'aspect-square rounded-lg',
    thumbnail: 'aspect-square rounded border',
  };

  return (
    <OptimizedImage
      className={cn(variantClasses[variant], className)}
      placeholder="blur"
      quality={variant === 'detail' ? 90 : 75}
      sizes={
        variant === 'detail'
          ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          : variant === 'card'
          ? '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw'
          : '80px'
      }
      {...props}
    />
  );
};

// Hook para preload de imagens relacionadas
export const useImagePreload = () => {
  const preloadImages = useCallback((urls: string[]) => {
    urls.forEach(url => {
      if (!imageCache.has(url)) {
        const img = new Image();
        img.src = url;
        img.onload = () => imageCache.add(url);
      }
    });
  }, []);

  return { preloadImages };
};

