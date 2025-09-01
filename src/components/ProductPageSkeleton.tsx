import { Skeleton } from "@/components/ui/skeleton";

export const ProductPageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galeria de imagens skeleton */}
        <div className="space-y-4">
          {/* Imagem principal */}
          <div className="aspect-square relative">
            <Skeleton className="w-full h-full rounded-lg" />
            {/* Badges skeleton */}
            <div className="absolute top-4 left-4 space-y-2">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-12 h-6 rounded-full" />
            </div>
            {/* Navegação skeleton */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
          </div>
          
          {/* Thumbnails skeleton */}
          <div className="flex space-x-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="w-16 h-16 rounded" />
            ))}
          </div>
        </div>
        
        {/* Informações do produto skeleton */}
        <div className="space-y-6">
          {/* Título e código */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Rating e visualizações */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          
          {/* Preços */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
          
          {/* Formas de pagamento */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-6 w-12 rounded" />
            </div>
          </div>
          
          {/* Plataforma */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-48" />
          </div>
          
          {/* Frete */}
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
          
          {/* Prazo de entrega */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
          
          {/* Botões de ação */}
          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          
          {/* Especificações */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
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
      
      {/* Produtos relacionados skeleton */}
      <div className="mt-12 space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProductImageSkeleton = () => {
  return (
    <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
      <Skeleton className="w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
    </div>
  );
};

