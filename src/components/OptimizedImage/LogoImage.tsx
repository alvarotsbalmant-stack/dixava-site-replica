import React from 'react';
import { cn } from '@/lib/utils';

interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const LogoImage: React.FC<LogoImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = true,
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('object-contain', className)}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
};