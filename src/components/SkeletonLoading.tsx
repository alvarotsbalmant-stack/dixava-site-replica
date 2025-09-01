import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      aria-hidden="true"
    />
  );
};

// Skeleton específico para cards de produto
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3', className)}>
    {/* Imagem do produto */}
    <Skeleton className="w-full aspect-square" />
    
    {/* Nome do produto */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    
    {/* Preços */}
    <div className="space-y-1">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
    
    {/* Botão */}
    <Skeleton className="h-10 w-full" />
  </div>
);

// Skeleton para grid de produtos
export const ProductGridSkeleton: React.FC<{ 
  count?: number; 
  className?: string;
  columns?: number;
}> = ({ 
  count = 8, 
  className,
  columns = 4 
}) => (
  <div className={cn(
    'grid gap-10 md:gap-3 lg:gap-4',
    {
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4': columns === 4,
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3,
      'grid-cols-1 sm:grid-cols-2': columns === 2,
    },
    className
  )}>
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Skeleton para seção de produtos
export const ProductSectionSkeleton: React.FC<{ 
  title?: boolean;
  count?: number;
  className?: string;
}> = ({ 
  title = true, 
  count = 4,
  className 
}) => (
  <div className={cn('space-y-6', className)}>
    {/* Título da seção */}
    {title && (
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    )}
    
    {/* Grid de produtos */}
    <ProductGridSkeleton count={count} columns={4} />
  </div>
);

// Skeleton para página de produto individual
export const ProductPageSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Galeria de imagens */}
      <div className="space-y-4">
        <Skeleton className="w-full aspect-square" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square" />
          ))}
        </div>
      </div>
      
      {/* Informações do produto */}
      <div className="space-y-6">
        {/* Título */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        
        {/* Preços */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        {/* Descrição */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        
        {/* Botões */}
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Especificações */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Skeleton para header/navegação
export const HeaderSkeleton: React.FC = () => (
  <div className="border-b">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <Skeleton className="h-8 w-32" />
        
        {/* Navegação */}
        <div className="hidden md:flex space-x-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-16" />
          ))}
        </div>
        
        {/* Ações */}
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton para banner/hero
export const BannerSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => (
  <div className={cn('relative overflow-hidden rounded-lg', height)}>
    <Skeleton className="w-full h-full" />
    
    {/* Conteúdo sobreposto */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-10 w-32 mx-auto" />
      </div>
    </div>
  </div>
);

// Skeleton para lista/tabela
export const ListSkeleton: React.FC<{ 
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 3,
  className 
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex items-center space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            className={cn(
              'h-4',
              colIndex === 0 ? 'w-1/4' : colIndex === 1 ? 'w-1/2' : 'w-1/4'
            )} 
          />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;

