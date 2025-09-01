import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SKUNavigation } from '@/hooks/useProducts/types';
import useDynamicPlatforms from '@/hooks/useDynamicPlatforms';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface PlatformSelectorExpandedProps {
  skuNavigation: SKUNavigation;
  className?: string;
}

const PlatformSelectorExpanded: React.FC<PlatformSelectorExpandedProps> = ({
  skuNavigation,
  className
}) => {
  const navigate = useNavigate();
  const { platformConfig } = useDynamicPlatforms();
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  const handlePlatformClick = (platform: string, sku: any) => {
    if (sku) {
      navigate(`/produto/${sku.id}`);
    }
  };

  const getCurrentPlatform = (): string | null => {
    if (skuNavigation.currentSKU) {
      return skuNavigation.currentSKU.variant_attributes?.platform || null;
    }
    return null;
  };

  const currentPlatform = getCurrentPlatform();
  
  // Organizar plataformas por disponibilidade
  const availablePlatforms = skuNavigation.platforms.filter(p => p.available);
  const unavailablePlatforms = skuNavigation.platforms.filter(p => !p.available);
  
  // Mostrar primeiras 6 por padrão
  const visiblePlatforms = showAllPlatforms 
    ? availablePlatforms 
    : availablePlatforms.slice(0, 6);

  return (
    <div id="platform-selector-expanded" className={cn("space-y-6", className)}>
      {/* Título e Informações */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Escolha a Plataforma
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>{availablePlatforms.length} disponíveis</span>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800 space-y-1">
            <div>• Preços e disponibilidade podem variar entre plataformas</div>
            <div>• Cada versão é otimizada para sua respectiva plataforma</div>
            <div>• Clique para ver detalhes específicos da plataforma</div>
          </div>
        </div>
      </div>

      {/* Grid de Plataformas Disponíveis */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Plataformas Disponíveis</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {visiblePlatforms.map(({ platform, sku, available }, index) => {
            const platformInfo = platformConfig[platform];
            const isCurrentPlatform = currentPlatform === platform;
            
            if (!platformInfo) return null;

            return (
              <div
                key={`${platform}-${sku?.id || index}`}
                className={cn(
                  "relative border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer group",
                  isCurrentPlatform 
                    ? "border-red-500 bg-red-50 ring-2 ring-red-200" 
                    : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                )}
                onClick={() => available && handlePlatformClick(platform, sku)}
              >
                {/* Badge de Selecionado */}
                {isCurrentPlatform && (
                  <Badge className="absolute -top-2 -right-2 bg-red-600 text-white font-bold">
                    SELECIONADO
                  </Badge>
                )}

                {/* Ícone da Plataforma */}
                <div className="flex items-center justify-center mb-3">
                  <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    {platformInfo.icon.startsWith('http') ? (
                      <img 
                        src={platformInfo.icon} 
                        alt={platformInfo.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-3xl">{platformInfo.icon}</span>
                    )}
                  </div>
                </div>

                {/* Nome da Plataforma */}
                <div className="text-center mb-3">
                  <h5 className="font-bold text-gray-900 text-lg">
                    {platformInfo.name}
                  </h5>
                  <div className="text-sm text-gray-600">
                    {platformInfo.description || 'Console de jogos'}
                  </div>
                </div>

                {/* Preço */}
                {sku && (
                  <div className="text-center space-y-1">
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(sku.price)}
                    </div>
                    
                    {/* Comparação de Preço */}
                    {sku.price !== skuNavigation.currentSKU?.price && (
                      <div className="text-sm">
                        {sku.price > (skuNavigation.currentSKU?.price || 0) ? (
                          <span className="text-red-600">
                            +{formatPrice(sku.price - (skuNavigation.currentSKU?.price || 0))}
                          </span>
                        ) : (
                          <span className="text-green-600">
                            -{formatPrice((skuNavigation.currentSKU?.price || 0) - sku.price)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Estoque */}
                <div className="text-center mt-3">
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 text-xs"
                  >
                    Em estoque
                  </Badge>
                </div>

                {/* Hover Effect */}
                <div className={cn(
                  "absolute inset-0 rounded-lg transition-all duration-200",
                  !isCurrentPlatform && "group-hover:bg-red-500 group-hover:bg-opacity-5"
                )} />
              </div>
            );
          })}
        </div>

        {/* Botão Ver Mais */}
        {availablePlatforms.length > 6 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setShowAllPlatforms(!showAllPlatforms)}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              {showAllPlatforms ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Ver todas as {availablePlatforms.length} plataformas
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Plataformas Indisponíveis */}
      {unavailablePlatforms.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Temporariamente Indisponíveis</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {unavailablePlatforms.map(({ platform }, index) => {
              const platformInfo = platformConfig[platform];
              
              if (!platformInfo) return null;

              return (
                <div
                  key={`unavailable-${platform}-${index}`}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50 opacity-60"
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-10 h-10 bg-white rounded border border-gray-200 flex items-center justify-center">
                      {platformInfo.icon.startsWith('http') ? (
                        <img 
                          src={platformInfo.icon} 
                          alt={platformInfo.name}
                          className="w-6 h-6 object-contain grayscale"
                        />
                      ) : (
                        <span className="text-lg grayscale">{platformInfo.icon}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-700 text-sm">
                      {platformInfo.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Em breve
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h5 className="font-semibold text-gray-900 mb-3">Informações Importantes</h5>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Cada plataforma possui características únicas de performance e recursos</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Preços podem variar devido a licenciamento e demanda específica</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Produtos são originais e lacrados para todas as plataformas</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Garantia e suporte técnico disponível para todas as versões</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformSelectorExpanded;

