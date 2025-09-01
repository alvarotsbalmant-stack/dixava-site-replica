import React from 'react';
import ProductSkeleton from '@/components/ProductSkeleton';

const LoadingStateProfessional: React.FC = () => {
  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden flex flex-col">
      {/* Header já está carregado, então não precisa de skeleton */}
      
      <main className="flex-grow">
        {/* Hero Banner Skeleton */}
        <div className="w-full h-[400px] bg-gray-200 relative overflow-hidden animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
          {/* Conteúdo do banner skeleton */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="h-12 bg-gray-300 rounded w-80 mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded w-60 mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer"></div>
              </div>
              <div className="h-12 bg-gray-300 rounded w-40 mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Skeleton */}
        <div className="py-8 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg relative overflow-hidden animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Primeira Seção de Produtos Skeleton */}
        <section className="py-8 md:py-12 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header da seção skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
              </div>
            </div>
            
            {/* Products skeleton */}
            <div className="overflow-hidden">
              <ProductSkeleton count={4} />
            </div>
          </div>
        </section>

        {/* Segunda Seção de Produtos Skeleton */}
        <section className="py-8 md:py-12 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header da seção skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
              <div className="h-8 bg-gray-200 rounded w-56 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
              </div>
            </div>
            
            {/* Products skeleton */}
            <div className="overflow-hidden">
              <ProductSkeleton count={4} />
            </div>
          </div>
        </section>

        {/* Banner Promocional Skeleton */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 my-8 md:my-12">
          <div className="w-full h-32 bg-gray-200 rounded-lg relative overflow-hidden animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="h-6 bg-gray-300 rounded w-64 mx-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-48 mx-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terceira Seção de Produtos Skeleton */}
        <section className="py-8 md:py-12 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header da seção skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
              <div className="h-8 bg-gray-200 rounded w-40 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
              </div>
            </div>
            
            {/* Products skeleton */}
            <div className="overflow-hidden">
              <ProductSkeleton count={4} />
            </div>
          </div>
        </section>

        {/* Seções de Serviços Skeleton */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-10 bg-gray-200 rounded w-80 mx-auto mb-4 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-32 mx-auto animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-40 mx-auto animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoadingStateProfessional;

