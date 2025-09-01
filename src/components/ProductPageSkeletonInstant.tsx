import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton instantâneo que aparece imediatamente ao clicar no produto
export const ProductPageSkeletonInstant = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-12" />
            <span className="text-gray-400">/</span>
            <Skeleton className="h-4 w-20" />
            <span className="text-gray-400">/</span>
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de imagens skeleton */}
          <div className="space-y-4">
            {/* Imagem principal */}
            <div className="aspect-square relative bg-white rounded-lg border overflow-hidden">
              <Skeleton className="w-full h-full" />
              {/* Badges skeleton */}
              <div className="absolute top-4 left-4 space-y-2">
                <Skeleton className="w-16 h-6 rounded-full bg-red-200" />
              </div>
              {/* Navegação skeleton */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Skeleton className="w-16 h-6 rounded-full bg-gray-300" />
              </div>
              {/* Botões de navegação */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Skeleton className="w-8 h-8 rounded-full bg-white/80" />
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Skeleton className="w-8 h-8 rounded-full bg-white/80" />
              </div>
            </div>
            
            {/* Thumbnails skeleton */}
            <div className="flex space-x-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="w-16 h-16 rounded border" />
              ))}
            </div>
          </div>
          
          {/* Informações do produto skeleton */}
          <div className="space-y-6">
            {/* Título e código */}
            <div className="space-y-3">
              <Skeleton className="h-8 w-4/5" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            
            {/* Rating e visualizações */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="w-4 h-4 rounded-sm" />
                ))}
                <Skeleton className="h-4 w-8 ml-2" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            
            {/* Preços */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-gray-300" />
              <Skeleton className="h-10 w-32 bg-green-200" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-36" />
            </div>
            
            {/* Formas de pagamento */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-28" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-12 rounded bg-green-200" />
                <Skeleton className="h-6 w-12 rounded bg-blue-200" />
                <Skeleton className="h-6 w-12 rounded bg-orange-200" />
              </div>
            </div>
            
            {/* Plataforma */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-48" />
            </div>
            
            {/* Frete */}
            <div className="bg-green-50 p-4 rounded-lg space-y-3 border border-green-200">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-5 h-5 rounded bg-green-300" />
                <Skeleton className="h-5 w-24 bg-green-300" />
              </div>
              <Skeleton className="h-4 w-32 bg-green-200" />
              <Skeleton className="h-4 w-28 bg-green-200" />
              <Skeleton className="h-4 w-36 bg-green-200" />
            </div>
            
            {/* Prazo de entrega */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </div>
            
            {/* Botões de ação */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg bg-blue-200" />
              <Skeleton className="h-10 w-full rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
        
        {/* Seções adicionais skeleton */}
        <div className="mt-12 space-y-8">
          {/* Tabs skeleton */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex space-x-6 border-b pb-4 mb-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          
          {/* Produtos relacionados skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border p-3 space-y-3">
                  <Skeleton className="aspect-square w-full rounded" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom CTA skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
        <div className="flex space-x-3">
          <Skeleton className="h-12 flex-1 rounded-lg bg-gray-200" />
          <Skeleton className="h-12 flex-1 rounded-lg bg-blue-200" />
        </div>
      </div>
    </div>
  );
};

// Skeleton para mobile
export const ProductPageSkeletonMobile = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Header mobile skeleton */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </div>

      {/* Imagem principal mobile */}
      <div className="aspect-square relative bg-white">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-4 left-4">
          <Skeleton className="w-16 h-6 rounded-full bg-red-200" />
        </div>
        <div className="absolute bottom-4 right-4">
          <Skeleton className="w-8 h-8 rounded-full bg-white/80" />
        </div>
      </div>

      {/* Informações mobile */}
      <div className="bg-white p-4 space-y-4">
        <Skeleton className="h-6 w-4/5" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Botões mobile */}
      <div className="bg-white p-4 border-t">
        <div className="flex space-x-3">
          <Skeleton className="h-12 flex-1 rounded-lg bg-gray-200" />
          <Skeleton className="h-12 flex-1 rounded-lg bg-blue-200" />
        </div>
      </div>

      {/* Conteúdo adicional mobile */}
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-lg p-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        
        <div className="bg-white rounded-lg p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para detectar mobile
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

