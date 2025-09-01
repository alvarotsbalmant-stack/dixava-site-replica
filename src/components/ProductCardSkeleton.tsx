import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden md:hover:shadow-md transition-shadow duration-200">
      {/* Imagem skeleton */}
      <div className="relative aspect-square">
        <Skeleton className="w-full h-full" />
        {/* Badge skeleton */}
        <div className="absolute top-2 left-2">
          <Skeleton className="w-12 h-6 rounded-full" />
        </div>
        {/* Botão favorito skeleton */}
        <div className="absolute top-2 right-2">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
      
      {/* Conteúdo skeleton */}
      <div className="p-4 space-y-3">
        {/* Título skeleton */}
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        
        {/* Rating skeleton */}
        <div className="flex items-center space-x-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        
        {/* Preço skeleton */}
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        
        {/* Badges de pagamento skeleton */}
        <div className="flex space-x-1">
          <Skeleton className="h-5 w-8 rounded" />
          <Skeleton className="h-5 w-8 rounded" />
          <Skeleton className="h-5 w-8 rounded" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 md:gap-3 lg:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const ProductCarouselSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <div className="flex space-x-4 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex-shrink-0 w-48">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};

