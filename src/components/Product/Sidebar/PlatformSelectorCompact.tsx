import React from 'react';
import { Button } from '@/components/ui/button';
import { SKUNavigation } from '@/hooks/useProducts/types';
import useDynamicPlatforms from '@/hooks/useDynamicPlatforms';
import { useOptimizedPlatformNavigation } from '@/hooks/useOptimizedPlatformNavigation';
import { useIntelligentSKUPrefetch } from '@/hooks/useIntelligentSKUPrefetch';
import { cn } from '@/lib/utils';

interface PlatformSelectorCompactProps {
  skuNavigation: SKUNavigation;
  className?: string;
}

const PlatformSelectorCompact: React.FC<PlatformSelectorCompactProps> = ({
  skuNavigation,
  className
}) => {
  const { platformConfig } = useDynamicPlatforms();
  const { navigateToPlatform, isTransitioning } = useOptimizedPlatformNavigation();
  const { handlePlatformHover, cancelPlatformHover } = useIntelligentSKUPrefetch();

  const handlePlatformClick = (platform: string, sku: any) => {
    if (sku && !isTransitioning) {
      navigateToPlatform(platform, sku, skuNavigation.currentSKU?.id);
    }
  };

  const getCurrentPlatform = (): string | null => {
    if (skuNavigation.currentSKU) {
      return skuNavigation.currentSKU.variant_attributes?.platform || null;
    }
    return null;
  };

  const currentPlatform = getCurrentPlatform();

  // Mostrar apenas as primeiras 4 plataformas na sidebar
  const visiblePlatforms = skuNavigation.platforms.slice(0, 4);
  const hasMorePlatforms = skuNavigation.platforms.length > 4;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Plataforma:</h4>
        {hasMorePlatforms && (
          <button className="text-sm text-blue-600 hover:underline">
            Ver todas ({skuNavigation.platforms.length})
          </button>
        )}
      </div>
      
      {/* Grid Compacto 2x2 */}
      <div className="grid grid-cols-2 gap-2">
        {visiblePlatforms.map(({ platform, sku, available }, index) => {
          const platformInfo = platformConfig[platform];
          const isCurrentPlatform = currentPlatform === platform;
          
          if (!platformInfo) return null;

          return (
            <Button
              key={`${platform}-${sku?.id || index}`}
              variant={isCurrentPlatform ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-12 flex flex-col items-center gap-1 relative text-xs transition-all duration-200",
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
              <div className="flex items-center justify-center w-6 h-6">
                {platformInfo.icon.startsWith('http') ? (
                  <img 
                    src={platformInfo.icon} 
                    alt={platformInfo.name}
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <span className="text-lg">{platformInfo.icon}</span>
                )}
              </div>
              
              {/* Nome da plataforma */}
              <span className="text-xs font-medium truncate w-full text-center">
                {platformInfo.name}
              </span>
              
              {/* Indicador de preço diferente */}
              {sku && sku.price !== skuNavigation.currentSKU?.price && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Informação sobre variação de preços */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        💡 Preços podem variar entre plataformas
      </div>

      {/* Link para expandir seleção */}
      {hasMorePlatforms && (
        <button 
          className="w-full text-sm text-blue-600 hover:underline py-2"
          onClick={() => {
            // Scroll para o seletor expandido na main content
            const expandedSelector = document.getElementById('platform-selector-expanded');
            if (expandedSelector) {
              expandedSelector.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          Ver todas as {skuNavigation.platforms.length} plataformas disponíveis
        </button>
      )}
    </div>
  );
};

export default PlatformSelectorCompact;

