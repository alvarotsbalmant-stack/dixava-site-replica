import React from 'react';
import { cn } from '@/lib/utils';
import { LazyImage } from './LazyImage';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  variant?: 'card' | 'detail' | 'thumbnail' | 'hero';
  isHovered?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  variant = 'card',
  isHovered = false,
  onLoad,
  onError,
}) => {
  const variantConfig = {
    card: {
      aspectRatio: 'aspect-square',
      quality: 75,
      sizes: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw',
      className: 'rounded-lg',
    },
    detail: {
      aspectRatio: 'aspect-square',
      quality: 90,
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      className: 'rounded-lg',
    },
    thumbnail: {
      aspectRatio: 'aspect-square',
      quality: 65,
      sizes: '80px',
      className: 'rounded border',
    },
    hero: {
      aspectRatio: 'aspect-[16/9]',
      quality: 95,
      sizes: '100vw',
      className: 'rounded-xl',
    },
  };

  const config = variantConfig[variant];

  return (
    <div className={cn(
      'relative overflow-hidden',
      config.aspectRatio,
      config.className,
      'transition-transform duration-200 ease-out',
      isHovered && variant === 'card' && 'scale-105',
      className
    )}>
      <LazyImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder="skeleton"
        sizes={config.sizes}
        onLoad={onLoad}
        onError={onError}
        className="w-full h-full"
        fallbackSrc="/placeholder-image.webp"
      />
      
      {/* Overlay gradient for better text readability */}
      {variant === 'card' && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      )}
    </div>
  );
};