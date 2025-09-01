import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  quality?: number;
  fallbackSrc?: string;
}

// Cache global de imagens carregadas
const imageCache = new Set<string>();

// Função para gerar placeholder blur otimizado
const generateBlurDataURL = (width: number = 10, height: number = 10) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(0.5, '#e2e8f0');
    gradient.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'skeleton',
  blurDataURL,
  onLoad,
  onError,
  sizes,
  fallbackSrc = '/placeholder-image.webp',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isInView, setIsInView] = useState(priority);

  // Intersection Observer para lazy loading
  useIntersectionObserver(
    containerRef,
    useCallback(([entry]) => {
      if (entry.isIntersecting && !isInView) {
        setIsInView(true);
      }
    }, [isInView]),
    {
      rootMargin: '100px',
      threshold: 0.1,
    }
  );

  // Gerar placeholder se não fornecido
  const defaultBlurDataURL = blurDataURL || generateBlurDataURL();

  // Preload de imagem
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

  // Carregar imagem quando em view
  React.useEffect(() => {
    if (!src || isLoaded || isError || !isInView) return;

    const loadImage = async () => {
      try {
        await preloadImage(src);
        setCurrentSrc(src);
        setIsLoaded(true);
        onLoad?.();
      } catch (error) {
        try {
          // Tentar fallback
          await preloadImage(fallbackSrc);
          setCurrentSrc(fallbackSrc);
          setIsLoaded(true);
        } catch {
          setIsError(true);
          onError?.();
        }
      }
    };

    loadImage();
  }, [src, isInView, isLoaded, isError, preloadImage, onLoad, onError, fallbackSrc]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setIsError(true);
      onError?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted',
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

      {/* Skeleton placeholder */}
      {placeholder === 'skeleton' && !isLoaded && !isError && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
      )}

      {/* Imagem principal */}
      {currentSrc && !isError && (
        <img
          ref={imgRef}
          src={currentSrc}
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
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}

      {/* Fallback para erro */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
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
      {!isLoaded && !isError && isInView && placeholder !== 'skeleton' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};