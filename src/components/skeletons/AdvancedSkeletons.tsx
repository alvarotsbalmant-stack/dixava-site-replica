import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton base com animação aprimorada
const EnhancedSkeleton: React.FC<{
  className?: string;
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave';
  children?: React.ReactNode;
}> = ({ className, variant = 'shimmer', children, ...props }) => {
  const variants = {
    default: 'animate-pulse',
    shimmer: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',
    pulse: 'animate-pulse',
    wave: 'animate-wave'
  };

  return (
    <div
      className={cn(
        'rounded-md bg-muted',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Skeleton para card de produto
export const ProductCardSkeleton: React.FC<{
  variant?: 'grid' | 'list';
  showPrice?: boolean;
  showBadge?: boolean;
}> = ({ variant = 'grid', showPrice = true, showBadge = true }) => {
  if (variant === 'list') {
    return (
      <div className="flex space-x-4 p-4 border rounded-lg">
        <EnhancedSkeleton className="w-24 h-24 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <EnhancedSkeleton className="h-4 w-3/4" />
          <EnhancedSkeleton className="h-3 w-1/2" />
          {showPrice && <EnhancedSkeleton className="h-5 w-20" />}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      {/* Badge skeleton */}
      {showBadge && (
        <div className="relative">
          <EnhancedSkeleton className="absolute top-2 left-2 h-5 w-12 rounded-full z-10" />
        </div>
      )}
      
      {/* Image skeleton */}
      <EnhancedSkeleton className="aspect-square w-full" />
      
      {/* Content skeleton */}
      <div className="space-y-2">
        <EnhancedSkeleton className="h-4 w-full" />
        <EnhancedSkeleton className="h-3 w-2/3" />
        
        {showPrice && (
          <div className="flex items-center space-x-2">
            <EnhancedSkeleton className="h-5 w-16" />
            <EnhancedSkeleton className="h-4 w-12" />
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton para grid de produtos
export const ProductGridSkeleton: React.FC<{
  count?: number;
  columns?: number;
  variant?: 'grid' | 'list';
}> = ({ count = 8, columns = 4, variant = 'grid' }) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3', 
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  return (
    <div className={cn(
      'grid gap-10 md:gap-3 lg:gap-4',
      variant === 'grid' ? gridCols[columns as keyof typeof gridCols] : 'grid-cols-1',
      'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} variant={variant} />
      ))}
    </div>
  );
};

// Skeleton para seção de produtos
export const ProductSectionSkeleton: React.FC<{
  title?: boolean;
  subtitle?: boolean;
  productCount?: number;
  columns?: number;
}> = ({ title = true, subtitle = false, productCount = 5, columns = 5 }) => {
  return (
    <div className="space-y-6 py-8">
      {/* Header skeleton */}
      {title && (
        <div className="text-center space-y-2">
          <EnhancedSkeleton className="h-8 w-64 mx-auto" />
          {subtitle && <EnhancedSkeleton className="h-4 w-96 mx-auto" />}
        </div>
      )}
      
      {/* Products skeleton */}
      <ProductGridSkeleton count={productCount} columns={columns} />
      
      {/* View more button skeleton */}
      <div className="text-center">
        <EnhancedSkeleton className="h-10 w-32 mx-auto" />
      </div>
    </div>
  );
};

// Skeleton para página de produto
export const ProductPageSkeleton: React.FC<{
  variant?: 'desktop' | 'mobile';
}> = ({ variant = 'desktop' }) => {
  if (variant === 'mobile') {
    return (
      <div className="space-y-6 p-4">
        {/* Image skeleton */}
        <EnhancedSkeleton className="aspect-square w-full" />
        
        {/* Title and price */}
        <div className="space-y-3">
          <EnhancedSkeleton className="h-6 w-full" />
          <EnhancedSkeleton className="h-4 w-2/3" />
          <div className="flex items-center space-x-2">
            <EnhancedSkeleton className="h-6 w-20" />
            <EnhancedSkeleton className="h-4 w-16" />
          </div>
        </div>
        
        {/* Buttons */}
        <div className="space-y-2">
          <EnhancedSkeleton className="h-12 w-full" />
          <EnhancedSkeleton className="h-10 w-full" />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <EnhancedSkeleton className="h-4 w-full" />
          <EnhancedSkeleton className="h-4 w-full" />
          <EnhancedSkeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* Images column */}
      <div className="space-y-4">
        <EnhancedSkeleton className="aspect-square w-full" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <EnhancedSkeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
      
      {/* Info column */}
      <div className="space-y-6">
        {/* Title and price */}
        <div className="space-y-3">
          <EnhancedSkeleton className="h-8 w-full" />
          <EnhancedSkeleton className="h-5 w-2/3" />
          <div className="flex items-center space-x-3">
            <EnhancedSkeleton className="h-8 w-24" />
            <EnhancedSkeleton className="h-6 w-20" />
          </div>
        </div>
        
        {/* Variants */}
        <div className="space-y-3">
          <EnhancedSkeleton className="h-4 w-16" />
          <div className="flex space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <EnhancedSkeleton key={i} className="h-10 w-16" />
            ))}
          </div>
        </div>
        
        {/* Buttons */}
        <div className="space-y-3">
          <EnhancedSkeleton className="h-12 w-full" />
          <EnhancedSkeleton className="h-10 w-full" />
        </div>
        
        {/* Features */}
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <EnhancedSkeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton para homepage
export const HomepageSkeleton: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero banner skeleton */}
      <EnhancedSkeleton className="h-96 w-full" />
      
      {/* Quick links skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <EnhancedSkeleton className="h-16 w-16 rounded-full mx-auto" />
            <EnhancedSkeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
      
      {/* Product sections skeleton */}
      <ProductSectionSkeleton productCount={5} />
      <ProductSectionSkeleton productCount={4} />
      <ProductSectionSkeleton productCount={6} />
    </div>
  );
};

// Skeleton para seção especial
export const SpecialSectionSkeleton: React.FC<{
  type?: 'carousel' | 'grid' | 'banner' | 'text';
  itemCount?: number;
}> = ({ type = 'carousel', itemCount = 5 }) => {
  const skeletonsByType = {
    carousel: (
      <div className="space-y-4">
        <div className="text-center">
          <EnhancedSkeleton className="h-6 w-48 mx-auto" />
        </div>
        <div className="flex space-x-4 overflow-hidden">
          {Array.from({ length: itemCount }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    ),
    
    grid: (
      <div className="space-y-4">
        <EnhancedSkeleton className="h-6 w-48 mx-auto" />
        <ProductGridSkeleton count={itemCount} />
      </div>
    ),
    
    banner: (
      <div className="relative">
        <EnhancedSkeleton className="h-64 w-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <EnhancedSkeleton className="h-8 w-64" />
            <EnhancedSkeleton className="h-4 w-48" />
            <EnhancedSkeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    ),
    
    text: (
      <div className="max-w-4xl mx-auto space-y-4 p-6">
        <EnhancedSkeleton className="h-8 w-64 mx-auto" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <EnhancedSkeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="py-8">
      {skeletonsByType[type]}
    </div>
  );
};

// Skeleton para layout dinâmico
export const DynamicLayoutSkeleton: React.FC<{
  sectionCount?: number;
}> = ({ sectionCount = 5 }) => {
  const sectionTypes = ['carousel', 'grid', 'banner', 'text'] as const;
  
  return (
    <div className="space-y-8">
      {Array.from({ length: sectionCount }).map((_, index) => {
        const randomType = sectionTypes[index % sectionTypes.length];
        return (
          <SpecialSectionSkeleton 
            key={index} 
            type={randomType}
            itemCount={Math.floor(Math.random() * 5) + 3}
          />
        );
      })}
    </div>
  );
};

