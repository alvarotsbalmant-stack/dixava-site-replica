import React, { useState } from 'react';
import { X, Image, Type, Sparkles, Zap, Layout, Palette, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface SpecialSectionCreatorProps {
  onSave: (sectionData: any) => void;
  onClose: () => void;
}

export const SpecialSectionCreator: React.FC<SpecialSectionCreatorProps> = ({ onSave, onClose }) => {
  const [sectionType, setSectionType] = useState<'banner' | 'carousel' | 'gallery' | 'cta'>('banner');
  const [sectionData, setSectionData] = useState({
    name: '',
    description: '',
    // Banner/CTA fields
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    imageUrl: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    buttonColor: '#3b82f6',
    buttonTextColor: '#ffffff',
    // Layout fields
    height: '300',
    alignment: 'center',
    backgroundType: 'color', // color, image, gradient
    gradientStart: '#3b82f6',
    gradientEnd: '#8b5cf6',
    // Carousel specific
    autoPlay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
    items: [] as any[]
  });

  const sectionTypes = [
    { value: 'banner', label: 'Banner Promocional', icon: Image },
    { value: 'cta', label: 'Call to Action', icon: Zap },
    { value: 'carousel', label: 'Carrossel Especial', icon: Layout },
    { value: 'gallery', label: 'Galeria de Imagens', icon: Sparkles }
  ];

  const backgroundTypes = [
    { value: 'color', label: 'Cor Sólida' },
    { value: 'gradient', label: 'Gradiente' },
    { value: 'image', label: 'Imagem' }
  ];

  const alignmentOptions = [
    { value: 'left', label: 'Esquerda' },
    { value: 'center', label: 'Centro' },
    { value: 'right', label: 'Direita' }
  ];

  const handleAddCarouselItem = () => {
    setSectionData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: `item_${Date.now()}`,
        title: '',
        subtitle: '',
        imageUrl: '',
        buttonText: '',
        buttonLink: ''
      }]
    }));
  };

  const handleUpdateCarouselItem = (index: number, updates: any) => {
    setSectionData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, ...updates } : item)
    }));
  };

  const handleRemoveCarouselItem = (index: number) => {
    setSectionData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!sectionData.name.trim()) {
      return;
    }

    const finalData = {
      type: sectionType,
      config: {
        ...sectionData,
        createdAt: new Date().toISOString()
      }
    };

    onSave(finalData);
  };

  const renderPreview = () => {
    const { backgroundColor, gradientStart, gradientEnd, backgroundType, height } = sectionData;
    
    let backgroundStyle: any = {};
    switch (backgroundType) {
      case 'color':
        backgroundStyle.backgroundColor = backgroundColor;
        break;
      case 'gradient':
        backgroundStyle.background = `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`;
        break;
      case 'image':
        if (sectionData.imageUrl) {
          backgroundStyle.backgroundImage = `url(${sectionData.imageUrl})`;
          backgroundStyle.backgroundSize = 'cover';
          backgroundStyle.backgroundPosition = 'center';
        }
        break;
    }

    return (
      <div
        className="rounded-lg overflow-hidden shadow-sm border"
        style={{
          ...backgroundStyle,
          height: `${height}px`,
          minHeight: '150px'
        }}
      >
        <div className={`h-full flex items-center justify-${sectionData.alignment} p-8`}>
          <div className={`text-${sectionData.alignment} max-w-md`}>
            {sectionData.title && (
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: sectionData.textColor }}
              >
                {sectionData.title}
              </h2>
            )}
            {sectionData.subtitle && (
              <p
                className="text-lg mb-4 opacity-90"
                style={{ color: sectionData.textColor }}
              >
                {sectionData.subtitle}
              </p>
            )}
            {sectionData.buttonText && (
              <button
                className="px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: sectionData.buttonColor,
                  color: sectionData.buttonTextColor
                }}
              >
                {sectionData.buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Criar Seção Especial</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configurações */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tipo de Seção */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">TIPO DE SEÇÃO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {sectionTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        variant={sectionType === type.value ? 'default' : 'outline'}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                        onClick={() => setSectionType(type.value as any)}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs">{type.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Configurações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">CONFIGURAÇÕES BÁSICAS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sectionName">Nome da Seção *</Label>
                  <Input
                    id="sectionName"
                    value={sectionData.name}
                    onChange={(e) => setSectionData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Banner Promocional de Verão"
                  />
                </div>
                <div>
                  <Label htmlFor="sectionDescription">Descrição</Label>
                  <Textarea
                    id="sectionDescription"
                    value={sectionData.description}
                    onChange={(e) => setSectionData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição opcional da seção"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="content">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">CONTEÚDO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={sectionData.title}
                        onChange={(e) => setSectionData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título principal"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Subtítulo</Label>
                      <Textarea
                        id="subtitle"
                        value={sectionData.subtitle}
                        onChange={(e) => setSectionData(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Subtítulo ou descrição"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="buttonText">Texto do Botão</Label>
                        <Input
                          id="buttonText"
                          value={sectionData.buttonText}
                          onChange={(e) => setSectionData(prev => ({ ...prev, buttonText: e.target.value }))}
                          placeholder="Saiba Mais"
                        />
                      </div>
                      <div>
                        <Label htmlFor="buttonLink">Link do Botão</Label>
                        <Input
                          id="buttonLink"
                          value={sectionData.buttonLink}
                          onChange={(e) => setSectionData(prev => ({ ...prev, buttonLink: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">DESIGN E CORES</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Tipo de Fundo</Label>
                      <Select 
                        value={sectionData.backgroundType} 
                        onValueChange={(value) => setSectionData(prev => ({ ...prev, backgroundType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {backgroundTypes.map(bg => (
                            <SelectItem key={bg.value} value={bg.value}>{bg.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {sectionData.backgroundType === 'color' && (
                      <div>
                        <Label htmlFor="backgroundColor">Cor de Fundo</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="backgroundColor"
                            type="color"
                            value={sectionData.backgroundColor}
                            onChange={(e) => setSectionData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            className="w-16 h-10"
                          />
                          <Input
                            value={sectionData.backgroundColor}
                            onChange={(e) => setSectionData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            placeholder="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    )}

                    {sectionData.backgroundType === 'gradient' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Cor Inicial</Label>
                          <Input
                            type="color"
                            value={sectionData.gradientStart}
                            onChange={(e) => setSectionData(prev => ({ ...prev, gradientStart: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Cor Final</Label>
                          <Input
                            type="color"
                            value={sectionData.gradientEnd}
                            onChange={(e) => setSectionData(prev => ({ ...prev, gradientEnd: e.target.value }))}
                          />
                        </div>
                      </div>
                    )}

                    {sectionData.backgroundType === 'image' && (
                      <div>
                        <Label htmlFor="imageUrl">URL da Imagem de Fundo</Label>
                        <Input
                          id="imageUrl"
                          value={sectionData.imageUrl}
                          onChange={(e) => setSectionData(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="textColor">Cor do Texto</Label>
                      <Input
                        id="textColor"
                        type="color"
                        value={sectionData.textColor}
                        onChange={(e) => setSectionData(prev => ({ ...prev, textColor: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="buttonColor">Cor do Botão</Label>
                        <Input
                          id="buttonColor"
                          type="color"
                          value={sectionData.buttonColor}
                          onChange={(e) => setSectionData(prev => ({ ...prev, buttonColor: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="buttonTextColor">Cor do Texto do Botão</Label>
                        <Input
                          id="buttonTextColor"
                          type="color"
                          value={sectionData.buttonTextColor}
                          onChange={(e) => setSectionData(prev => ({ ...prev, buttonTextColor: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">CONFIGURAÇÕES AVANÇADAS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="height">Altura (px)</Label>
                        <Select 
                          value={sectionData.height} 
                          onValueChange={(value) => setSectionData(prev => ({ ...prev, height: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="200">200px - Pequeno</SelectItem>
                            <SelectItem value="300">300px - Médio</SelectItem>
                            <SelectItem value="400">400px - Grande</SelectItem>
                            <SelectItem value="500">500px - Extra Grande</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Alinhamento</Label>
                        <Select 
                          value={sectionData.alignment} 
                          onValueChange={(value) => setSectionData(prev => ({ ...prev, alignment: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {alignmentOptions.map(align => (
                              <SelectItem key={align.value} value={align.value}>{align.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-0">
              <CardHeader>
                <CardTitle className="text-sm font-medium">PREVIEW EM TEMPO REAL</CardTitle>
              </CardHeader>
              <CardContent>
                {renderPreview()}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!sectionData.name.trim()}>
            <Sparkles className="w-4 h-4 mr-2" />
            Criar Seção
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpecialSectionCreator;