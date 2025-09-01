import React from 'react';
import { Eye, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SpecialSection } from '@/types/specialSections/core';

interface SectionPreviewProps {
  section: SpecialSection;
  isEditing?: boolean;
  className?: string;
}

export const SectionPreview: React.FC<SectionPreviewProps> = ({
  section,
  isEditing = false,
  className = ''
}) => {
  const renderBannerHero = () => {
    const config = section.config as any;
    
    return (
      <div className="relative overflow-hidden rounded-lg">
        {/* Imagem de fundo */}
        {config.imageUrl && (
          <div className="relative aspect-video">
            <img
              src={config.imageUrl}
              alt={config.imageAlt || section.title}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                config.enableHoverAnimation ? 'hover:scale-105' : ''
              }`}
            />
            
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: config.backgroundColor || '#000000',
                opacity: config.overlayOpacity || 0.3
              }}
            />
            
            {/* Conteúdo */}
            <div
              className={`absolute inset-0 flex items-center justify-center text-center p-8 ${
                config.textPosition === 'left' ? 'justify-start text-left' :
                config.textPosition === 'right' ? 'justify-end text-right' :
                'justify-center text-center'
              }`}
            >
              <div className="max-w-2xl">
                {config.title && (
                  <h2
                    className="text-4xl font-bold mb-4"
                    style={{ color: config.textColor || '#ffffff' }}
                  >
                    {config.title}
                  </h2>
                )}
                
                {config.subtitle && (
                  <p
                    className="text-lg mb-6 opacity-90"
                    style={{ color: config.textColor || '#ffffff' }}
                  >
                    {config.subtitle}
                  </p>
                )}
                
                {config.ctaText && config.ctaUrl && (
                  <Button
                    className="bg-white text-black hover:bg-gray-100"
                    size="lg"
                  >
                    {config.ctaText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Fallback se não houver imagem */}
        {!config.imageUrl && (
          <div
            className="aspect-video flex items-center justify-center"
            style={{ backgroundColor: config.backgroundColor || '#f3f4f6' }}
          >
            <div className="text-center">
              <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Adicione uma imagem para ver o preview</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProductCarousel = () => {
    const config = section.config as any;
    
    return (
      <div className="space-y-6">
        {/* Header */}
        {(config.title || config.subtitle) && (
          <div className="text-center">
            {config.title && (
              <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
            )}
            {config.subtitle && (
              <p className="text-gray-600">{config.subtitle}</p>
            )}
          </div>
        )}
        
        {/* Produtos mockados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: config.itemsPerView?.desktop || 4 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Produto {index + 1}</p>
                </div>
              </div>
              <CardContent className="p-3">
                <h4 className="font-medium text-sm mb-1">Produto Exemplo {index + 1}</h4>
                {config.showPrice && (
                  <p className="text-sm font-bold text-green-600">R$ 99,90</p>
                )}
                {config.showRating && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex text-yellow-400 text-xs">★★★★☆</div>
                    <span className="text-xs text-gray-500">(4.0)</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Informações de configuração */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Mostrando {config.maxProducts || 12} produtos máximo
            {config.enableAutoplay && ' • Autoplay ativo'}
          </p>
        </div>
      </div>
    );
  };

  const renderCategoryGrid = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
          <p className="text-gray-600">Grid de categorias</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-lg">📱</span>
                  </div>
                  <p className="font-medium text-sm">Categoria {index + 1}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderPromotionalBanner = () => {
    const config = section.config as any;
    
    return (
      <Card className="overflow-hidden">
        <div className="relative aspect-[3/1] bg-gradient-to-r from-red-500 to-pink-500">
          <div className="absolute inset-0 flex items-center justify-between p-8 text-white">
            <div>
              <h3 className="text-2xl font-bold mb-2">Oferta Especial!</h3>
              <p className="text-lg opacity-90">Até 50% de desconto</p>
            </div>
            <Button className="bg-white text-red-500 hover:bg-gray-100">
              Aproveitar
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const renderNewsSection = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
          <p className="text-gray-600">Últimas notícias e novidades</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video bg-gray-200"></div>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Notícia Exemplo {index + 1}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit...
                </p>
                <p className="text-xs text-gray-500">Há 2 dias</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomHtml = () => {
    return (
      <Card className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">HTML Customizado</h3>
          <p className="text-gray-600">
            Conteúdo personalizado será renderizado aqui
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <code className="text-sm text-gray-700">
              &lt;div&gt;Seu HTML customizado&lt;/div&gt;
            </code>
          </div>
        </div>
      </Card>
    );
  };

  const renderSectionContent = () => {
    switch (section.type) {
      case 'banner_hero':
        return renderBannerHero();
      case 'product_carousel':
        return renderProductCarousel();
      case 'category_grid':
        return renderCategoryGrid();
      case 'promotional_banner':
        return renderPromotionalBanner();
      case 'news_section':
        return renderNewsSection();
      case 'custom_html':
        return renderCustomHtml();
      default:
        return (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <Eye className="h-8 w-8 mx-auto mb-2" />
              <p>Preview não disponível para este tipo de seção</p>
            </div>
          </Card>
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header do preview */}
      {!isEditing && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <h3 className="font-medium">Preview da Seção</h3>
            <Badge variant="outline">{section.type}</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={section.isVisible ? 'default' : 'secondary'}>
              {section.isVisible ? 'Visível' : 'Oculta'}
            </Badge>
            <Badge variant="outline">
              {section.visibility === 'both' ? 'Desktop e Mobile' :
               section.visibility === 'desktop_only' ? 'Apenas Desktop' :
               section.visibility === 'mobile_only' ? 'Apenas Mobile' : 'Oculto'}
            </Badge>
          </div>
        </div>
      )}

      {/* Preview responsivo */}
      <Tabs defaultValue="desktop" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="desktop" className="gap-2">
            <Monitor className="h-4 w-4" />
            Desktop
          </TabsTrigger>
          <TabsTrigger value="tablet" className="gap-2">
            <Tablet className="h-4 w-4" />
            Tablet
          </TabsTrigger>
          <TabsTrigger value="mobile" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Mobile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desktop" className="mt-4">
          <div className="border rounded-lg p-6 bg-white">
            {renderSectionContent()}
          </div>
        </TabsContent>

        <TabsContent value="tablet" className="mt-4">
          <div className="max-w-2xl mx-auto border rounded-lg p-4 bg-white">
            {renderSectionContent()}
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="mt-4">
          <div className="max-w-sm mx-auto border rounded-lg p-3 bg-white">
            {renderSectionContent()}
          </div>
        </TabsContent>
      </Tabs>

      {/* Informações adicionais */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações da Seção</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Título:</span>
              <span>{section.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ordem:</span>
              <span>{section.order}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Criado em:</span>
              <span>{section.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Atualizado em:</span>
              <span>{section.updatedAt.toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

