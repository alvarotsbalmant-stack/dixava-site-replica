// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, PlusCircle, Trash2, ArrowUp, ArrowDown, Settings, Package, Image, Sparkles, Save, XCircle, Upload } from 'lucide-react';
import ImageUploadInput from '@/components/Admin/ImageUploadInput';
import { useTags } from '@/hooks/useTags';
import { useProducts } from '@/hooks/useProducts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BannerType, BannerRowConfig, CarouselConfig } from '@/types/specialSections';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Define the structure for carousel configuration
const carouselConfigSchema = z.object({
  title: z.string().optional(),
  selection_mode: z.enum(['tags', 'products', 'combined']).optional().default('products'),
  tag_ids: z.array(z.string()).optional().default([]),
  product_ids: z.array(z.string()).optional().default([]),
});

// Define the schema for a single banner
const bannerSchema = z.object({
  type: z.enum(['full_width', 'half_width', 'third_width', 'quarter_width', 'product_highlight']),
  image_url: z.string().url().or(z.literal('')).optional(),
  link_url: z.string().url().or(z.literal('')).optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  button_text: z.string().optional(),
  enable_hover_animation: z.boolean().optional().default(true),
});

// Define the schema for a banner row
const bannerRowSchema = z.object({
  row_id: z.string().uuid().optional(),
  layout: z.enum(['1_col_full', '2_col_half', '3_col_third', '4_col_quarter']),
  banners: z.array(bannerSchema),
  margin_included_in_banner: z.boolean().optional().default(false),
});

// Define the structure of the fixed content configuration with dynamic banner rows
const fixedContentSchema = z.object({
  banner_rows: z.array(bannerRowSchema).optional().default([]),
  carrossel_1: carouselConfigSchema.optional(),
  carrossel_2: carouselConfigSchema.optional(),
});

type FixedContentFormData = z.infer<typeof fixedContentSchema>;

interface SpecialSectionFixedContentManagerProps {
  sectionId: string;
}

const SpecialSectionFixedContentManager: React.FC<SpecialSectionFixedContentManagerProps> = ({ sectionId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { tags, loading: tagsLoading } = useTags();
  const { products, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<BannerRowConfig['layout']>('1_col_full');
  
  const { handleSubmit, control, reset, formState: { errors, isDirty }, getValues, setValue } = useForm<FixedContentFormData>({
    resolver: zodResolver(fixedContentSchema),
    defaultValues: {
      banner_rows: [],
      carrossel_1: { title: "", selection_mode: "products" as const, tag_ids: [], product_ids: [] },
      carrossel_2: { title: "", selection_mode: "products" as const, tag_ids: [], product_ids: [] },
    }
  });

  const { fields: bannerRows, append: appendBannerRow, remove: removeBannerRow, move: moveBannerRow } = useFieldArray({
    control,
    name: 'banner_rows',
  });

  const carrossel1Value = useWatch({ control, name: 'carrossel_1' });
  const carrossel2Value = useWatch({ control, name: 'carrossel_2' });

  const fetchContentConfig = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('special_sections')
        .select('content_config')
        .eq('id', sectionId)
        .single();

      if (error) {
        if (error.message.includes('column special_sections.content_config does not exist')) {
          toast({
            title: 'Erro de Configuração do Banco',
            description: "A coluna 'content_config' não existe na tabela 'special_sections'. Peça ao administrador para adicioná-la (tipo jsonb).",
            variant: 'destructive',
            duration: 10000,
          });
        } else {
          throw error;
        }
      } else if (data?.content_config) {
        const fetchedConfig = data.content_config as FixedContentFormData;
        const defaults = {
            selection_mode: 'products' as const,
            tag_ids: [],
            product_ids: [],
        };
        
        reset({
            ...fetchedConfig,
            carrossel_1: { ...defaults, ...fetchedConfig.carrossel_1 },
            carrossel_2: { ...defaults, ...fetchedConfig.carrossel_2 },
        });     }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar configuração de conteúdo',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [sectionId, reset, toast]);

  useEffect(() => {
    fetchContentConfig();
    refetchProducts();
  }, [fetchContentConfig, refetchProducts]);

  const handleSaveContent = async (data: FixedContentFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("special_sections")
        .update({ content_config: data })
        .eq("id", sectionId);

      if (error) throw error;

      toast({
        title: 'Configuração salva com sucesso!',
        description: 'O conteúdo da seção especial foi atualizado.',
        variant: 'default',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar configuração',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const nameMatch = product.name && typeof product.name === 'string' 
                      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) 
                      : false;
    const idMatch = product.id && typeof product.id === 'string' 
                     ? product.id.toLowerCase().includes(searchTerm.toLowerCase()) 
                     : false;
    return nameMatch || idMatch;
  });

  const CarouselConfigSection = ({ 
    carouselKey, 
    carouselValue
  }: { 
    carouselKey: 'carrossel_1' | 'carrossel_2',
    carouselValue: any
  }) => {
    return (
      <Card className="bg-[#2C2C44] border-[#343A40] text-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-blue-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Carrossel de Produtos {carouselKey === 'carrossel_1' ? '1' : '2'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure o {carouselKey === 'carrossel_1' ? 'primeiro' : 'segundo'} carrossel de produtos da sua seção especial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Título do Carrossel */}
          <div className="space-y-2">
            <Label className="text-yellow-400 flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4" />
              Título do Carrossel
            </Label>
          <Controller
              name={`${carouselKey}.title`}
              control={control}
              render={({ field }) => (
                <Input 
                  {...field}
                  className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500" 
                  placeholder="Digite o título do carrossel"
                />
              )}
            />
          </div>
          
          {/* Modo de Seleção */}
          <div className="space-y-2">
            <Label className="text-orange-400 flex items-center gap-2 font-medium">
              <Settings className="w-4 h-4" />
              Modo de Seleção de Produtos
            </Label>
            <Controller
              name={`${carouselKey}.selection_mode`}
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={(value: 'tags' | 'products' | 'combined') => field.onChange(value)}
                >
                  <SelectTrigger className="bg-[#1A1A2E] border-[#343A40] text-white focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione o modo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2C2C44] border-[#343A40]">
                    <SelectItem value="tags" className="text-white hover:bg-[#343A40]">Por Tags</SelectItem>
                    <SelectItem value="products" className="text-white hover:bg-[#343A40]">Produtos Específicos</SelectItem>
                    <SelectItem value="combined" className="text-white hover:bg-[#343A40]">Combinado (Tags + Produtos)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          {/* Seleção por Tags */}
          {(carouselValue?.selection_mode === 'tags' || carouselValue?.selection_mode === 'combined') && (
            <Card className="bg-[#343A40] border-[#495057]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <Badge className="bg-[#007BFF] text-white">Tags</Badge>
                  Selecione as Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tagsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-[#007BFF]" />
                  </div>
                ) : (
                  <ScrollArea className="h-40 border rounded-md p-2 bg-[#1A1A2E] border-[#343A40]">
                    <div className="space-y-2">
                      {tags.map(tag => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Controller
                            name={`${carouselKey}.tag_ids`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id={`tag-${tag.id}-${carouselKey}`}
                                checked={field.value?.includes(tag.id)}
                                onCheckedChange={(checked) => {
                                  const currentTags = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentTags, tag.id]);
                                  } else {
                                    field.onChange(currentTags.filter(id => id !== tag.id));
                                  }
                                }}
                              />
                            )}
                          />
                          <Label htmlFor={`tag-${tag.id}-${carouselKey}`} className="text-sm text-gray-300">{tag.name}</Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Seleção por Produtos */}
          {(carouselValue?.selection_mode === 'products' || carouselValue?.selection_mode === 'combined') && (
            <Card className="bg-[#343A40] border-[#495057]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <Badge className="bg-[#28A745] text-white">Produtos</Badge>
                  Selecione os Produtos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Buscar produtos por nome ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
                {productsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-[#28A745]" />
                  </div>
                ) : (
                  <ScrollArea className="h-40 border rounded-md p-2 bg-[#1A1A2E] border-[#343A40]">
                    <div className="space-y-2">
                      {filteredProducts.map(product => (
                        <div key={product.id} className="flex items-center space-x-2">
                          <Controller
                            name={`${carouselKey}.product_ids`}
                            control={control}
                            render={({ field }) => (
                              <Checkbox
                                id={`product-${product.id}-${carouselKey}`}
                                checked={field.value?.includes(product.id)}
                                onCheckedChange={(checked) => {
                                  const currentProducts = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentProducts, product.id]);
                                  } else {
                                    field.onChange(currentProducts.filter(id => id !== product.id));
                                  }
                                }}
                              />
                            )}
                          />
                          <Label htmlFor={`product-${product.id}-${carouselKey}`} className="text-sm text-gray-300">
                            {product.name || 'Produto sem nome'} ({product.id?.slice(0, 8) || 'Sem ID'}...)
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    );
  };

  const getDimensionsForLayout = (layout: BannerRowConfig['layout']) => {
    switch (layout) {
      case '1_col_full': return { width: 1200, height: 180 };
      case '2_col_half': return { width: 600, height: 300 };
      case '3_col_third': return { width: 400, height: 200 };
      case '4_col_quarter': return { width: 300, height: 150 };
      default: return { width: 0, height: 0 };
    }
  };

  const getLayoutDisplayName = (layout: BannerRowConfig['layout']) => {
    switch (layout) {
      case '1_col_full': return 'Layout: 1 coluna full';
      case '2_col_half': return 'Layout: 2 colunas half';
      case '3_col_third': return 'Layout: 3 colunas third';
      case '4_col_quarter': return 'Layout: 4 colunas quarter';
      default: return 'Layout desconhecido';
    }
  };

  const handleAddBannerRow = () => {
    let numBanners = 0;
    let bannerType: BannerType = 'full_width';

    switch (selectedLayout) {
      case '1_col_full': 
        numBanners = 1; 
        bannerType = 'full_width';
        break;
      case '2_col_half': 
        numBanners = 2; 
        bannerType = 'half_width';
        break;
      case '3_col_third': 
        numBanners = 3; 
        bannerType = 'third_width';
        break;
      case '4_col_quarter': 
        numBanners = 4; 
        bannerType = 'quarter_width';
        break;
    }
    const newBanners = Array.from({ length: numBanners }, () => ({ 
      type: bannerType, 
      image_url: '', 
      link_url: '', 
      title: '',
      subtitle: '',
      button_text: '',
      enable_hover_animation: true 
    }));
    appendBannerRow({ row_id: crypto.randomUUID(), layout: selectedLayout, banners: newBanners });
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <form onSubmit={handleSubmit(handleSaveContent)} className="space-y-8">

        {/* Header com botão de salvar */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Editar Seção Especial</h2>
            <p className="text-gray-400">Configure banners e carrosseis de produtos para sua seção especial.</p>
          </div>
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-[#28A745] hover:bg-[#218838] text-white px-6 py-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>

        {/* Seção de Banners */}
        <Card className="bg-[#2C2C44] border-[#343A40] text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-blue-300 flex items-center gap-2">
              <Image className="w-6 h-6 text-purple-400" />
              Linhas de Banners
            </CardTitle>
            <CardDescription className="text-gray-400">
              Adicione e configure linhas de banners com diferentes layouts para sua seção especial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {bannerRows.map((row, rowIndex) => {
              const dimensions = getDimensionsForLayout(row.layout);
              return (
                <Card key={row.id} className="bg-[#343A40] border-[#495057]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-white text-lg">
                        <Image className="w-5 h-5 text-blue-400" />
                        Linha de Banners {rowIndex + 1} - {getLayoutDisplayName(row.layout)}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveBannerRow(rowIndex, Math.max(0, rowIndex - 1))}
                          disabled={rowIndex === 0}
                          className="bg-[#495057] border-[#6C757D] text-white hover:bg-[#5A6268]"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveBannerRow(rowIndex, Math.min(bannerRows.length - 1, rowIndex + 1))}
                          disabled={rowIndex === bannerRows.length - 1}
                          className="bg-[#495057] border-[#6C757D] text-white hover:bg-[#5A6268]"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBannerRow(rowIndex)}
                          className="bg-[#DC3545] hover:bg-[#C82333]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {/* Checkbox para Margem Inclusa no Banner */}
                  <div className="px-6 pb-4">
                    <div className="flex items-center space-x-2">
                      <Controller
                        name={`banner_rows.${rowIndex}.margin_included_in_banner`}
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={`margin-${rowIndex}`}
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                            className="border-[#6C757D] data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                        )}
                      />
                      <Label 
                        htmlFor={`margin-${rowIndex}`}
                        className="text-sm text-gray-300 cursor-pointer"
                      >
                        Considerar que a margem da seção já está inclusa no banner
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Quando marcado, o banner se estende até as bordas horizontais da seção especial
                    </p>
                  </div>
                  
                  <CardContent>
                    <div className={`grid gap-4 ${
                      row.layout === '1_col_full' ? 'grid-cols-1' :
                      row.layout === '2_col_half' ? 'grid-cols-1 lg:grid-cols-2' :
                      row.layout === '3_col_third' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                      'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                    }`}>
                      {row.banners.map((banner, bannerIndex) => (
                        <Card key={bannerIndex} className="bg-[#495057] border-[#6C757D]">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-white text-sm">
                              Banner {bannerIndex + 1}
                            </CardTitle>
                            <CardDescription className="text-xs text-gray-400">
                              Recomendado: {dimensions.width}×{dimensions.height}px
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {/* URL da Imagem com Upload */}
                            <div className="space-y-2">
                              <Label className="text-purple-400 text-sm font-medium">URL da Imagem</Label>
                              <Controller
                                name={`banner_rows.${rowIndex}.banners.${bannerIndex}.image_url`}
                                control={control}
                                render={({ field }) => (
                                  <ImageUploadInput
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="https://exemplo.com/banner.jpg"
                                    className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                )}
                              />
                            </div>

                            {/* URL do Link */}
                            <div className="space-y-2">
                              <Label className="text-blue-400 text-sm font-medium">URL do Link (Opcional)</Label>
                              <Controller
                                name={`banner_rows.${rowIndex}.banners.${bannerIndex}.link_url`}
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="https://exemplo.com/destino"
                                    className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                )}
                              />
                            </div>

                            {/* Título */}
                            <div className="space-y-2">
                              <Label className="text-orange-400 text-sm font-medium">Título (Opcional)</Label>
                              <Controller
                                name={`banner_rows.${rowIndex}.banners.${bannerIndex}.title`}
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="Título do Banner"
                                    className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                )}
                              />
                            </div>

                            {/* Subtítulo */}
                            <div className="space-y-2">
                              <Label className="text-yellow-400 text-sm font-medium">Subtítulo (Opcional)</Label>
                              <Controller
                                name={`banner_rows.${rowIndex}.banners.${bannerIndex}.subtitle`}
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="Subtítulo do Banner"
                                    className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                )}
                              />
                            </div>

                            {/* Texto do Botão */}
                            <div className="space-y-2">
                              <Label className="text-red-400 text-sm font-medium">Texto do Botão (Opcional)</Label>
                              <Controller
                                name={`banner_rows.${rowIndex}.banners.${bannerIndex}.button_text`}
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    value={field.value || ''}
                                    onChange={field.onChange}
                                    placeholder="Saiba Mais"
                                    className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                )}
                              />
                            </div>

                            {/* Habilitar Animação Hover */}
                            <div className="flex items-center space-x-2">
                              <Controller
                                name={`banner_rows.${rowIndex}.banners.${bannerIndex}.enable_hover_animation`}
                                control={control}
                                defaultValue={true}
                                render={({ field }) => (
                                  <Checkbox
                                    id={`hover-${rowIndex}-${bannerIndex}`}
                                    checked={field.value ?? true}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked);
                                      console.log(`Hover animation for banner ${rowIndex}-${bannerIndex}:`, checked);
                                    }}
                                    className="border-[#495057] data-[state=checked]:bg-[#FF8C00] data-[state=checked]:text-white"
                                  />
                                )}
                              />
                              <Label htmlFor={`hover-${rowIndex}-${bannerIndex}`} className="text-sm text-gray-300">
                                Habilitar Animação Hover
                              </Label>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Botão para adicionar nova linha de banners */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  type="button"
                  className="w-full bg-[#28A745] hover:bg-[#218838] text-white py-3"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Adicionar Nova Linha de Banners
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#2C2C44] border-[#343A40] text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl text-blue-300">Selecionar Layout da Linha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <RadioGroup value={selectedLayout} onValueChange={(value: BannerRowConfig['layout']) => setSelectedLayout(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1_col_full" id="1_col_full" />
                      <Label htmlFor="1_col_full" className="text-gray-300">1 coluna full (1200×180px)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2_col_half" id="2_col_half" />
                      <Label htmlFor="2_col_half" className="text-gray-300">2 colunas half (600×300px cada)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3_col_third" id="3_col_third" />
                      <Label htmlFor="3_col_third" className="text-gray-300">3 colunas third (400×200px cada)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="4_col_quarter" id="4_col_quarter" />
                      <Label htmlFor="4_col_quarter" className="text-gray-300">4 colunas quarter (300×150px cada)</Label>
                    </div>
                  </RadioGroup>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    onClick={handleAddBannerRow}
                    className="bg-[#28A745] hover:bg-[#218838] text-white"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adicionar Linha
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Carrosseis de Produtos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <CarouselConfigSection 
            carouselKey="carrossel_1" 
            carouselValue={carrossel1Value}
          />
          <CarouselConfigSection 
            carouselKey="carrossel_2" 
            carouselValue={carrossel2Value}
          />
        </div>

        {/* Botão de salvar fixo no final */}
        <div className="flex justify-end pt-6 border-t border-[#343A40]">
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-[#28A745] hover:bg-[#218838] text-white px-8 py-3"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salvar Todas as Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SpecialSectionFixedContentManager;

