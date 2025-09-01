import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SKUNavigation, Platform } from '@/hooks/useProducts/types';
import useDynamicPlatforms from '@/hooks/useDynamicPlatforms';
import { cn } from '@/lib/utils';

interface SKUPriceComparisonProps {
  skuNavigation: SKUNavigation;
  className?: string;
}

const SKUPriceComparison: React.FC<SKUPriceComparisonProps> = ({
  skuNavigation,
  className
}) => {
  const { platformConfig } = useDynamicPlatforms();
  const availableSKUs = skuNavigation.availableSKUs.filter(sku => sku.stock && sku.stock > 0);
  
  if (availableSKUs.length <= 1) {
    return null; // Não mostrar se houver apenas um SKU disponível
  }

  // Encontrar o menor e maior preço
  const prices = availableSKUs.map(sku => sku.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Ordenar SKUs por preço
  const sortedSKUs = [...availableSKUs].sort((a, b) => a.price - b.price);

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Comparar Preços por Plataforma
            </h3>
            <Badge variant="outline" className="text-xs">
              {availableSKUs.length} opções disponíveis
            </Badge>
          </div>

          <div className="space-y-3">
            {sortedSKUs.map((sku) => {
              const platform = sku.variant_attributes?.platform;
              const platformInfo = platformConfig[platform || ''];
              const isLowestPrice = sku.price === minPrice;
              const isHighestPrice = sku.price === maxPrice && minPrice !== maxPrice;
              
              if (!platformInfo) return null;

              return (
                <div
                  key={sku.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    isLowestPrice && "bg-green-50 border-green-200",
                    "hover:bg-gray-50 transition-colors"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl flex items-center justify-center w-6 h-6">
                      {platformInfo.icon.startsWith('http') ? (
                        <img 
                          src={platformInfo.icon} 
                          alt={platformInfo.name}
                          className="w-5 h-5 object-contain"
                        />
                      ) : (
                        <span className="text-xl">{platformInfo.icon}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {platformInfo.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sku.stock} em estoque
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        R$ {sku.price.toFixed(2)}
                      </div>
                      {sku.pro_price && (
                        <div className="text-sm text-purple-600">
                          R$ {sku.pro_price.toFixed(2)} com Pro
                        </div>
                      )}
                    </div>

                    {isLowestPrice && (
                      <Badge className="bg-green-500 text-white text-xs">
                        Melhor Preço
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo de economia */}
          {minPrice !== maxPrice && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600 text-center">
                Economia de até <span className="font-semibold text-green-600">
                  R$ {(maxPrice - minPrice).toFixed(2)}
                </span> escolhendo a melhor opção
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SKUPriceComparison;

