import React from 'react';
import { Monitor, Smartphone, Tablet, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PreviewPanelProps {
  page: any;
  sections: any[];
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ page, sections }) => {
  const [deviceMode, setDeviceMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = React.useState(false);

  const visibleSections = sections.filter(s => s.is_visible);

  const handleOpenInNewTab = () => {
    const url = `/prime/${page.slug}`;
    window.open(url, '_blank');
  };

  const handleRefreshPreview = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const getDeviceClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'w-full';
    }
  };

  const getSectionPreview = (section: any) => {
    const { section_type, section_config } = section;

    switch (section_type) {
      case 'product_section':
        return (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">
              {section_config?.name || 'Seção de Produtos'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: Math.min(section_config?.criteria?.limit || 4, 8) }).map((_, i) => (
                <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                  <div className="text-xs space-y-1">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              {section_config?.mode === 'automatic' ? 
                `Critérios automáticos • ${section_config?.criteria?.limit || 12} produtos` :
                `Seleção manual • ${section_config?.selectedProducts?.length || 0} produtos`
              }
            </p>
          </div>
        );

      case 'custom_banner':
        return (
          <div 
            className="rounded-lg p-8 text-center"
            style={{
              backgroundColor: section_config?.backgroundColor || '#f3f4f6',
              color: section_config?.textColor || '#1f2937',
              minHeight: '200px'
            }}
          >
            {section_config?.title && (
              <h2 className="text-2xl font-bold mb-2">{section_config.title}</h2>
            )}
            {section_config?.description && (
              <p className="mb-4">{section_config.description}</p>
            )}
            {section_config?.buttonText && (
              <button
                className="px-6 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: section_config?.buttonColor || '#3b82f6',
                  color: section_config?.buttonTextColor || '#ffffff'
                }}
              >
                {section_config.buttonText}
              </button>
            )}
          </div>
        );

      case 'promo_banner':
        return (
          <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">
              {section_config?.bannerData?.title || 'Banner Promocional'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {section_config?.bannerData?.description || 'Descrição do banner promocional'}
            </p>
            <button className="bg-red-600 text-white px-4 py-2 rounded text-sm">
              {section_config?.bannerData?.buttonText || 'Saiba Mais'}
            </button>
          </div>
        );

      case 'hero_banner':
        return (
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Banner Hero</h2>
            <p className="text-muted-foreground mb-6">Banner principal da página</p>
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg">
              Ação Principal
            </button>
          </div>
        );

      case 'spacer':
        return (
          <div 
            className="border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center"
            style={{ height: `${section_config?.height || 50}px` }}
          >
            <span className="text-xs text-muted-foreground">
              Espaçador ({section_config?.height || 50}px)
            </span>
          </div>
        );

      default:
        return (
          <div className="bg-muted rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              {section_type} - Seção configurada
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>PREVIEW DA PÁGINA</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {visibleSections.length} seções visíveis
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Device selector */}
          <div className="flex items-center space-x-1">
            <Button
              variant={deviceMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceMode('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceMode === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceMode('tablet')}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDeviceMode('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPreview}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Abrir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className={`${getDeviceClass()} transition-all duration-300`}>
            <div className="bg-background border-x min-h-[600px]">
              {/* Page header */}
              <div className="bg-primary text-primary-foreground p-4 text-center">
                <h1 className="text-xl font-bold">{page.title}</h1>
                <p className="text-sm opacity-90">/prime/{page.slug}</p>
              </div>

              {/* Sections preview */}
              <div className="p-4 space-y-6">
                {visibleSections.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Nenhuma seção visível para exibir
                    </p>
                  </div>
                ) : (
                  visibleSections.map((section, index) => (
                    <div key={section.id}>
                      {getSectionPreview(section)}
                      {index < visibleSections.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="bg-muted p-4 text-center mt-8">
                <p className="text-xs text-muted-foreground">
                  Preview da página • {visibleSections.length} seções
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewPanel;