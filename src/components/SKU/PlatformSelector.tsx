import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SKUNavigation, Platform } from '@/hooks/useProducts/types';
import useDynamicPlatforms from '@/hooks/useDynamicPlatforms';
import { useOptimizedPlatformNavigation } from '@/hooks/useOptimizedPlatformNavigation';
import { useIntelligentSKUPrefetch } from '@/hooks/useIntelligentSKUPrefetch';
import { cn } from '@/lib/utils';

interface PlatformSelectorProps {
  skuNavigation: SKUNavigation;
  currentProductId?: string;
  className?: string;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  skuNavigation,
  currentProductId,
  className
}) => {
  const { platformConfig } = useDynamicPlatforms();
  const { navigateToPlatform, isTransitioning } = useOptimizedPlatformNavigation();
  const { handlePlatformHover, cancelPlatformHover } = useIntelligentSKUPrefetch();

  const handlePlatformClick = (platform: string, sku: any) => {
    if (sku && !isTransitioning) {
      navigateToPlatform(platform, sku, currentProductId);
    }
  };

  const getCurrentPlatform = (): string | null => {
    if (skuNavigation.currentSKU) {
      return skuNavigation.currentSKU.variant_attributes?.platform || null;
    }
    return null;
  };

  const currentPlatform = getCurrentPlatform();

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Escolha a Plataforma
        </h3>
        <p className="text-sm text-gray-600">
          Selecione a plataforma desejada para ver preço e disponibilidade específicos
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {skuNavigation.platforms.map(({ platform, sku, available }, index) => {
          const platformInfo = platformConfig[platform];
          const isCurrentPlatform = currentPlatform === platform;
          
          if (!platformInfo) return null;

          return (
            <Button
              key={`${platform}-${sku?.id || index}`}
              variant={isCurrentPlatform ? "default" : "outline"}
              className={cn(
                "h-auto p-4 flex flex-col items-center gap-2 relative transition-all duration-200",
                isCurrentPlatform && "ring-2 ring-red-500 bg-red-600 hover:bg-red-700",
                !available && "opacity-50 cursor-not-allowed",
                available && !isCurrentPlatform && "hover:bg-gray-50 hover:border-red-300 hover:scale-105",
                isTransitioning && "opacity-80 pointer-events-none"
              )}
              onClick={() => available && handlePlatformClick(platform, sku)}
              onMouseEnter={() => available && sku && handlePlatformHover(sku)}
              onMouseLeave={() => available && sku && cancelPlatformHover(sku)}
              disabled={!available || isTransitioning}
            >
              {/* Ícone da plataforma */}
              <div className="text-2xl mb-1 flex items-center justify-center w-8 h-8">
                {platformInfo.icon.startsWith('http') ? (
                  <img 
                    src={platformInfo.icon} 
                    alt={platformInfo.name}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <span className="text-2xl">{platformInfo.icon}</span>
                )}
              </div>
              
              {/* Nome da plataforma */}
              <span className={cn(
                "text-sm font-medium",
                isCurrentPlatform ? "text-white" : "text-gray-700"
              )}>
                {platformInfo.name}
              </span>

              {/* Preço se disponível */}
              {available && sku && (
                <span className={cn(
                  "text-xs",
                  isCurrentPlatform ? "text-white/90" : "text-gray-500"
                )}>
                  R$ {sku.price.toFixed(2)}
                </span>
              )}

              {/* Badge de status */}
              {isCurrentPlatform && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1"
                >
                  Atual
                </Badge>
              )}

              {!available && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-1"
                >
                  Indisponível
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Informações adicionais */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Preços e disponibilidade podem variar entre plataformas</p>
        <p>• Cada versão é otimizada para sua respectiva plataforma</p>
      </div>
    </div>
  );
};

export default PlatformSelector;

