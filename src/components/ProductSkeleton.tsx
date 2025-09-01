import React from 'react';

interface ProductSkeletonProps {
  count?: number;
  className?: string;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 4, className = "" }) => {
  return (
    <div className={`flex gap-3 min-w-max px-1 py-1 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-[280px] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Imagem skeleton */}
          <div className="w-full h-[200px] bg-gray-200"></div>
          
          {/* Conteúdo skeleton */}
          <div className="p-4 space-y-3">
            {/* Título skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            {/* Preço skeleton */}
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            
            {/* Botão skeleton */}
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;

