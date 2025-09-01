import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, Eye, Palette, Settings, Image, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSectionPreview } from '@/hooks/specialSections/useSpecialSections';
import { SectionPreview } from './SectionPreview';
import { ImageUploader } from '../UI/ImageUploader';
import { ProductSelector } from '../UI/ProductSelector';
import type { 
  CreateSectionRequest,
  UpdateSectionRequest,
  SpecialSection,
  DragDropItem
} from '@/hooks/specialSections/useSpecialSections';

const SECTION_TYPES = [
  { value: 'banner_hero', label: 'Banner Hero', icon: Image },
  { value: 'product_carousel', label: 'Carrossel de Produtos', icon: Settings },
  { value: 'category_grid', label: 'Grid de Categorias', icon: Settings },
  { value: 'promotional_banner', label: 'Banner Promocional', icon: Image },
  { value: 'news_section', label: 'Seção de Notícias', icon: Type },
  { value: 'custom_html', label: 'HTML Customizado', icon: Settings }
] as const;

const VISIBILITY_OPTIONS = [
  { value: 'both', label: 'Desktop e Mobile' },
  { value: 'desktop_only', label: 'Apenas Desktop' },
  { value: 'mobile_only', label: 'Apenas Mobile' },
  { value: 'hidden', label: 'Oculto' }
] as const;

const IMAGE_POSITIONS = [
  { value: 'left', label: 'Esquerda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Direita' },
  { value: 'top', label: 'Topo' },
  { value: 'bottom', label: 'Rodapé' }
] as const;

// Schema de validação dinâmico
const createValidationSchema = (sectionType: string) => {
  const baseSchema = z.object({
    type: z.enum(['banner_hero', 'product_carousel', 'category_grid', 'promotional_banner', 'news_section', 'custom_html']),
    title: z.string().min(1, 'Título é obrigatório'),
    visibility: z.enum(['both', 'desktop_only', 'mobile_only', 'hidden']),
    isVisible: z.boolean(),
    order: z.number().optional()
  });

  return baseSchema.extend({
    config: z.record(z.any())
  });
};

interface SectionEditorProps {
  section?: SpecialSection | null;
  onSave: (data: CreateSectionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [selectedType, setSelectedType] = useState<string>(
    section?.background_type || 'banner_hero'
  );
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { previewSection, isPreviewMode, startPreview, stopPreview, updatePreview } = useSectionPreview();

  // Schema de validação dinâmico
  const validationSchema = createValidationSchema(selectedType);
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      type: selectedType,
      title: section?.title || '',
      visibility: 'both',
      isVisible: section?.is_active ?? true,
      order: section?.display_order || 0,
      config: (section?.content_config as any) || getDefaultConfig(selectedType)
    }
  });

  // Observar mudanças no formulário para preview
  const watchedValues = watch();

  // Função para obter configuração padrão por tipo
  function getDefaultConfig(type: string) {
    switch (type) {
      case 'banner_hero':
        return {
          imageUrl: '',
          imageAlt: '',
          title: '',
          subtitle: '',
          ctaText: '',
          ctaUrl: '',
          overlayOpacity: 0.3,
          textPosition: 'center',
          enableHoverAnimation: true,
          backgroundColor: '#000000',
          textColor: '#ffffff'
        };
      case 'product_carousel':
        return {
          title: '',
          subtitle: '',
          productSelectionType: 'manual',
          productIds: [],
          tagIds: [],
          categoryIds: [],
          maxProducts: 12,
          showPrice: true,
          showRating: true,
          enableAutoplay: false,
          autoplayInterval: 3000,
          itemsPerView: {
            desktop: 4,
            tablet: 3,
            mobile: 2
          }
        };
      default:
        return {};
    }
  }

  // Atualizar preview quando formulário mudar
  useEffect(() => {
    if (isPreviewMode && watchedValues) {
      const previewData: any = {
        id: section?.id || 'preview',
        title: watchedValues.title,
        background_type: watchedValues.type,
        is_active: watchedValues.isVisible,
        display_order: watchedValues.order || 0,
        content_config: watchedValues.config,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      updatePreview(previewData);
    }
  }, [watchedValues, isPreviewMode, section?.id, updatePreview]);

  // Reset form quando seção mudar
  useEffect(() => {
    if (section) {
      reset({
        type: section.background_type,
        title: section.title,
        visibility: 'both', // Default value since DB doesn't have this
        isVisible: section.is_active,
        order: section.display_order || 0,
        config: section.content_config || {}
      });
      setSelectedType(section.background_type || 'banner_hero');
    }
  }, [section, reset]);

  // Handler para mudança de tipo
  const handleTypeChange = useCallback((newType: string) => {
    setSelectedType(newType);
    setValue('type', newType);
    setValue('config', getDefaultConfig(newType));
  }, [setValue]);

  // Handler para salvar
  const handleSave = useCallback(async (data: any) => {
    try {
      setIsSaving(true);
      await onSave(data);
      toast.success('Seção salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar seção');
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  // Handler para preview
  const handleTogglePreview = useCallback(() => {
    if (isPreviewMode) {
      stopPreview();
      setShowPreview(false);
    } else {
      const previewData: any = {
        id: section?.id || 'preview',
        title: watchedValues.title,
        background_type: watchedValues.type,
        is_active: watchedValues.isVisible,
        display_order: watchedValues.order || 0,
        content_config: watchedValues.config,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      startPreview(previewData);
      setShowPreview(true);
    }
  }, [isPreviewMode, stopPreview, startPreview, watchedValues, section?.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {section ? 'Editar Seção' : 'Nova Seção'}
          </h2>
          <p className="text-sm text-gray-600">
            Configure os detalhes da seção especial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleTogglePreview}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {isPreviewMode ? 'Ocultar Preview' : 'Mostrar Preview'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            {/* Configurações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tipo de Seção */}
                <div className="space-y-2">
                  <Label>Tipo de Seção</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTION_TYPES.map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        type="button"
                        variant={selectedType === value ? 'default' : 'outline'}
                        onClick={() => handleTypeChange(value)}
                        className="justify-start gap-2 h-auto p-3"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Título */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Input
                          {...field}
                          id="title"
                          placeholder="Digite o título da seção"
                          disabled={isLoading}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                      </>
                    )}
                  />
                </div>

                {/* Visibilidade */}
                <div className="space-y-2">
                  <Label>Visibilidade</Label>
                  <Controller
                    name="visibility"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VISIBILITY_OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* Ativo */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="isVisible">Seção Ativa</Label>
                  <Controller
                    name="isVisible"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="isVisible"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configurações Específicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Configurações Específicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedType === 'banner_hero' && (
                  <BannerHeroForm control={control} errors={errors} />
                )}
                {selectedType === 'product_carousel' && (
                  <ProductCarouselForm control={control} errors={errors} />
                )}
                {/* Adicionar outros tipos conforme necessário */}
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !isDirty}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Seção'}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview */}
        {showPreview && previewSection && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <h3 className="font-medium">Preview em Tempo Real</h3>
              <Badge variant="secondary">Atualização Automática</Badge>
            </div>
            <Card className="p-4">
              <SectionPreview section={previewSection as any} isEditing />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para formulário de Banner Hero
const BannerHeroForm: React.FC<{ control: any; errors: any }> = ({ control, errors }) => (
  <Tabs defaultValue="content" className="space-y-4">
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="content">Conteúdo</TabsTrigger>
      <TabsTrigger value="design">Design</TabsTrigger>
      <TabsTrigger value="behavior">Comportamento</TabsTrigger>
    </TabsList>

    <TabsContent value="content" className="space-y-4">
      {/* Imagem */}
      <div className="space-y-2">
        <Label>Imagem do Banner</Label>
        <Controller
          name="config.imageUrl"
          control={control}
          render={({ field }) => (
            <ImageUploader
              value={field.value}
              onChange={field.onChange}
              aspectRatio="16:9"
              maxSize={5 * 1024 * 1024} // 5MB
            />
          )}
        />
      </div>

      {/* Texto alternativo */}
      <div className="space-y-2">
        <Label htmlFor="imageAlt">Texto Alternativo</Label>
        <Controller
          name="config.imageAlt"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="imageAlt"
              placeholder="Descreva a imagem para acessibilidade"
            />
          )}
        />
      </div>

      {/* Título do banner */}
      <div className="space-y-2">
        <Label htmlFor="bannerTitle">Título do Banner</Label>
        <Controller
          name="config.title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="bannerTitle"
              placeholder="Título principal do banner"
            />
          )}
        />
      </div>

      {/* Subtítulo */}
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtítulo</Label>
        <Controller
          name="config.subtitle"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="subtitle"
              placeholder="Subtítulo ou descrição"
              rows={2}
            />
          )}
        />
      </div>

      {/* CTA */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ctaText">Texto do Botão</Label>
          <Controller
            name="config.ctaText"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="ctaText"
                placeholder="Ex: Comprar Agora"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ctaUrl">Link do Botão</Label>
          <Controller
            name="config.ctaUrl"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="ctaUrl"
                placeholder="https://..."
                type="url"
              />
            )}
          />
        </div>
      </div>
    </TabsContent>

    <TabsContent value="design" className="space-y-4">
      {/* Posição do texto */}
      <div className="space-y-2">
        <Label>Posição do Texto</Label>
        <Controller
          name="config.textPosition"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_POSITIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Opacidade do overlay */}
      <div className="space-y-2">
        <Label>Opacidade do Overlay</Label>
        <Controller
          name="config.overlayOpacity"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Slider
                value={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">
                {Math.round(field.value * 100)}%
              </div>
            </div>
          )}
        />
      </div>

      {/* Cores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">Cor de Fundo</Label>
          <Controller
            name="config.backgroundColor"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="backgroundColor"
                type="color"
                className="h-10"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="textColor">Cor do Texto</Label>
          <Controller
            name="config.textColor"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="textColor"
                type="color"
                className="h-10"
              />
            )}
          />
        </div>
      </div>
    </TabsContent>

    <TabsContent value="behavior" className="space-y-4">
      {/* Animação de hover */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="enableHoverAnimation">Animação no Hover</Label>
          <p className="text-sm text-gray-500">
            Ativa efeito de zoom suave ao passar o mouse
          </p>
        </div>
        <Controller
          name="config.enableHoverAnimation"
          control={control}
          render={({ field }) => (
            <Switch
              id="enableHoverAnimation"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>
    </TabsContent>
  </Tabs>
);

// Componente para formulário de Product Carousel
const ProductCarouselForm: React.FC<{ control: any; errors: any }> = ({ control, errors }) => (
  <Tabs defaultValue="content" className="space-y-4">
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="content">Conteúdo</TabsTrigger>
      <TabsTrigger value="products">Produtos</TabsTrigger>
      <TabsTrigger value="display">Exibição</TabsTrigger>
    </TabsList>

    <TabsContent value="content" className="space-y-4">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="carouselTitle">Título do Carrossel</Label>
        <Controller
          name="config.title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="carouselTitle"
              placeholder="Ex: Produtos em Destaque"
            />
          )}
        />
      </div>

      {/* Subtítulo */}
      <div className="space-y-2">
        <Label htmlFor="carouselSubtitle">Subtítulo</Label>
        <Controller
          name="config.subtitle"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="carouselSubtitle"
              placeholder="Descrição opcional do carrossel"
              rows={2}
            />
          )}
        />
      </div>
    </TabsContent>

    <TabsContent value="products" className="space-y-4">
      {/* Tipo de seleção */}
      <div className="space-y-2">
        <Label>Tipo de Seleção de Produtos</Label>
        <Controller
          name="config.productSelectionType"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Seleção Manual</SelectItem>
                <SelectItem value="by_tag">Por Tags</SelectItem>
                <SelectItem value="by_category">Por Categoria</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Seletor de produtos */}
      <Controller
        name="config.productIds"
        control={control}
        render={({ field }) => (
          <ProductSelector
            selectedIds={field.value || []}
            onChange={field.onChange}
            selectionType="manual"
          />
        )}
      />

      {/* Máximo de produtos */}
      <div className="space-y-2">
        <Label>Máximo de Produtos</Label>
        <Controller
          name="config.maxProducts"
          control={control}
          render={({ field }) => (
            <div className="space-y-2">
              <Slider
                value={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-gray-500 text-center">
                {field.value} produtos
              </div>
            </div>
          )}
        />
      </div>
    </TabsContent>

    <TabsContent value="display" className="space-y-4">
      {/* Opções de exibição */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="showPrice">Mostrar Preço</Label>
          <Controller
            name="config.showPrice"
            control={control}
            render={({ field }) => (
              <Switch
                id="showPrice"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showRating">Mostrar Avaliação</Label>
          <Controller
            name="config.showRating"
            control={control}
            render={({ field }) => (
              <Switch
                id="showRating"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="enableAutoplay">Autoplay</Label>
          <Controller
            name="config.enableAutoplay"
            control={control}
            render={({ field }) => (
              <Switch
                id="enableAutoplay"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      {/* Items por visualização */}
      <div className="space-y-4">
        <Label>Items por Visualização</Label>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Desktop</Label>
            <Controller
              name="config.itemsPerView.desktop"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={8}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Tablet</Label>
            <Controller
              name="config.itemsPerView.tablet"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={6}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm">Mobile</Label>
            <Controller
              name="config.itemsPerView.mobile"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={3}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
          </div>
        </div>
      </div>
    </TabsContent>
  </Tabs>
);

