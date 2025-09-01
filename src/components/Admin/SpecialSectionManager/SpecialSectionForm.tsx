import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { SpecialSection, SpecialSectionCreateInput, SpecialSectionUpdateInput } from '@/types/specialSections';
import NewSpecialSectionManager from './NewSpecialSectionManager';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Zod schema with background fields and color customization
const sectionSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório (para identificação no painel)').max(100, 'Título muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  is_active: z.boolean().default(true),
  background_type: z.enum(['color', 'image']).default('color'),
  background_value: z.string().optional(),
  background_image_position: z.enum(['center', 'top', 'bottom', 'left', 'right']).default('center'),
  // New color customization fields (removed carousel_background_color - using existing background_value)
  carousel_title_color: z.string().optional(),
  view_all_button_bg_color: z.string().optional(),
  view_all_button_text_color: z.string().optional(),
  scrollbar_color: z.string().optional(),
  scrollbar_hover_color: z.string().optional(),
});

type SectionFormData = z.infer<typeof sectionSchema>;

interface SpecialSectionFormProps {
  section: SpecialSection | null;
  onSubmit: (data: SpecialSectionCreateInput | SpecialSectionUpdateInput) => void;
  onCancel: () => void;
}

const SpecialSectionForm: React.FC<SpecialSectionFormProps> = ({ section, onSubmit, onCancel }) => {
  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: section ? {
      title: section.title ?? '',
      description: section.description ?? '',
      is_active: section.is_active ?? true,
      background_type: (section.background_type as 'color' | 'image') ?? 'color',
      background_value: section.background_value ?? '',
      background_image_position: (section.background_image_position as 'center' | 'top' | 'bottom' | 'left' | 'right') ?? 'center',
      carousel_title_color: section.carousel_title_color ?? '#ffffff',
      view_all_button_bg_color: section.view_all_button_bg_color ?? '#1f2937',
      view_all_button_text_color: section.view_all_button_text_color ?? '#ffffff',
      scrollbar_color: section.scrollbar_color ?? '#1f2937',
      scrollbar_hover_color: section.scrollbar_hover_color ?? '#111827',
    } : {
      title: '',
      description: '',
      is_active: true,
      background_type: 'color',
      background_value: '',
      background_image_position: 'center',
      carousel_title_color: '#ffffff',
      view_all_button_bg_color: '#1f2937',
      view_all_button_text_color: '#ffffff',
      scrollbar_color: '#1f2937',
      scrollbar_hover_color: '#111827',
    },
  });

  const backgroundType = watch('background_type');

  const handleFormSubmit = async (data: SectionFormData) => {
    try {
      await onSubmit(data as SpecialSectionCreateInput | SpecialSectionUpdateInput);
      toast.success('Seção especial salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar seção especial.');
      console.error('Erro ao salvar seção especial:', error);
    }
  };

  // Dummy function to provide image recommendations based on section size
  const getImageRecommendation = (sectionKey: string | undefined) => {
    switch (sectionKey) {
      case 'hero_banner':
        return 'Recomendado: 1920x600px (Desktop) e 750x400px (Mobile).';
      case 'promo_banner':
        return 'Recomendado: 1200x300px.';
      case 'product_section_4ca34da8-6213-4fb1-b948-bf09426dd422': // Exemplo de ID de seção de produto
        return 'Recomendado: 1200x600px (para fundo de grade de produtos).';
      case 'special_section_cd8c7b18-d911-473e-93d6-ba658f427717': // Exemplo de ID de seção especial
        return 'Recomendado: 800x400px (para banners dentro de seções especiais).';
      default:
        return 'Recomendado: Imagem de alta resolução, proporção 16:9 ou 21:9.';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 text-white w-full max-w-6xl mx-auto my-8">
      <form onSubmit={handleSubmit(handleFormSubmit)} id="section-details-form">
        <CardHeader className="border-b border-gray-700 pb-4">
          <CardTitle className="text-2xl font-bold text-blue-400">{section ? 'Editar Seção Especial' : 'Criar Nova Seção Especial'}</CardTitle>
          <CardDescription className="text-gray-400">
            {section
              ? 'Configure o título, status e o conteúdo dos elementos pré-definidos abaixo.'
              : 'Defina um título e status. Após salvar, você poderá configurar o conteúdo.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="text-gray-300">Título (Identificação Interna)</Label>
              <Input id="title" {...register('title')} className="bg-gray-700 border-gray-600 text-white mt-1 focus:border-blue-500 focus:ring-blue-500" />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-300">Descrição (Opcional, para referência)</Label>
              <Textarea id="description" {...register('description')} className="bg-gray-700 border-gray-600 text-white mt-1 focus:border-blue-500 focus:ring-blue-500" rows={3} />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Activation Status */}
          <div className="flex items-center space-x-3 pt-2">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-600"
                />
              )}
            />
            <Label htmlFor="is_active" className="text-gray-300">Seção Ativa (Visível no site)</Label>
          </div>

          <Separator className="bg-gray-700" />

          {/* Background Configuration */}
          <fieldset className="border border-gray-700 p-6 rounded-lg shadow-inner bg-gray-900">
            <legend className="text-xl font-semibold px-2 text-blue-300">Configuração de Fundo</legend>
            <div className="space-y-6 mt-4">
              <div>
                <Label className="text-gray-300">Tipo de Fundo</Label>
                <Controller
                  name="background_type"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="color" id="bg-type-color" className="text-blue-500 border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white" />
                        <Label htmlFor="bg-type-color" className="text-gray-300">Cor Sólida</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="bg-type-image" className="text-blue-500 border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white" />
                        <Label htmlFor="bg-type-image" className="text-gray-300">Imagem</Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              {backgroundType === 'color' && (
                <div>
                  <Label htmlFor="background_value_color" className="text-gray-300">Cor do Fundo (Hex ou Nome)</Label>
                  <Input
                    id="background_value_color"
                    {...register('background_value')}
                    className="bg-gray-700 border-gray-600 text-white mt-1 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="#RRGGBB ou nome da cor (ex: red)"
                  />
                  {errors.background_value && <p className="text-red-400 text-sm mt-1">{errors.background_value.message}</p>}
                </div>
              )}

              {backgroundType === 'image' && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="background_value_image" className="text-gray-300">URL da Imagem de Fundo</Label>
                    <Input
                      id="background_value_image"
                      {...register('background_value')}
                      className="bg-gray-700 border-gray-600 text-white mt-1 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="https://exemplo.com/sua-imagem.jpg"
                    />
                    {errors.background_value && <p className="text-red-400 text-sm mt-1">{errors.background_value.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="background_image_position" className="text-gray-300">Posição da Imagem</Label>
                    <Controller
                      name="background_image_position"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white mt-1 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecionar Posição" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 text-white border-gray-700">
                            <SelectItem value="center">Centro</SelectItem>
                            <SelectItem value="top">Topo</SelectItem>
                            <SelectItem value="bottom">Base</SelectItem>
                            <SelectItem value="left">Esquerda</SelectItem>
                            <SelectItem value="right">Direita</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.background_image_position && <p className="text-red-400 text-sm mt-1">{errors.background_image_position.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="image_recommendation" className="text-gray-300">Recomendação de Tamanho da Imagem</Label>
                     <Textarea
                       id="image_recommendation"
                       value={getImageRecommendation(section?.id)} // Use section.id instead of section_key
                       readOnly
                      className="bg-gray-700 border-gray-600 text-white resize-none mt-1"
                      rows={2}
                    />
                    <p className="text-sm text-gray-400 mt-1">A imagem será redimensionada para preencher a seção. Imagens muito pequenas podem ficar pixelizadas.</p>
                  </div>
                </div>
              )}
            </div>
          </fieldset>

          <Separator className="bg-gray-700" />

          {/* Color Customization Section */}
          <fieldset className="border border-gray-700 p-6 rounded-lg shadow-inner bg-gray-900">
            <legend className="text-xl font-semibold px-2 text-purple-300">Customização de Cores</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              
              {/* Carousel Title Color */}
              <div>
                <Label htmlFor="carousel_title_color" className="text-gray-300">Cor do Título do Carrossel</Label>
                <Controller
                  name="carousel_title_color"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={field.value || '#ffffff'}
                        onChange={field.onChange}
                        className="w-16 h-10 rounded border border-gray-600 bg-gray-700 cursor-pointer"
                        title="Cor do título do carrossel"
                      />
                      <Input
                        value={field.value || '#ffffff'}
                        onChange={field.onChange}
                        className="flex-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="#ffffff"
                      />
                    </div>
                  )}
                />
                {errors.carousel_title_color && <p className="text-red-400 text-sm mt-1">{errors.carousel_title_color.message}</p>}
              </div>

              {/* View All Button Background Color */}
              <div>
                <Label htmlFor="view_all_button_bg_color" className="text-gray-300">Cor de Fundo do Botão "Ver Todos"</Label>
                <Controller
                  name="view_all_button_bg_color"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={field.value || '#1f2937'}
                        onChange={field.onChange}
                        className="w-16 h-10 rounded border border-gray-600 bg-gray-700 cursor-pointer"
                        title="Cor de fundo do botão Ver Todos"
                      />
                      <Input
                        value={field.value || '#1f2937'}
                        onChange={field.onChange}
                        className="flex-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="#1f2937"
                      />
                    </div>
                  )}
                />
                {errors.view_all_button_bg_color && <p className="text-red-400 text-sm mt-1">{errors.view_all_button_bg_color.message}</p>}
              </div>

              {/* View All Button Text Color */}
              <div>
                <Label htmlFor="view_all_button_text_color" className="text-gray-300">Cor do Texto do Botão "Ver Todos"</Label>
                <Controller
                  name="view_all_button_text_color"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={field.value || '#ffffff'}
                        onChange={field.onChange}
                        className="w-16 h-10 rounded border border-gray-600 bg-gray-700 cursor-pointer"
                        title="Cor do texto do botão Ver Todos"
                      />
                      <Input
                        value={field.value || '#ffffff'}
                        onChange={field.onChange}
                        className="flex-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="#ffffff"
                      />
                    </div>
                  )}
                />
                {errors.view_all_button_text_color && <p className="text-red-400 text-sm mt-1">{errors.view_all_button_text_color.message}</p>}
              </div>

              {/* Scrollbar Color */}
              <div>
                <Label htmlFor="scrollbar_color" className="text-gray-300">Cor da Barra de Scroll</Label>
                <Controller
                  name="scrollbar_color"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={field.value || '#1f2937'}
                        onChange={field.onChange}
                        className="w-16 h-10 rounded border border-gray-600 bg-gray-700 cursor-pointer"
                        title="Cor da barra de scroll"
                      />
                      <Input
                        value={field.value || '#1f2937'}
                        onChange={field.onChange}
                        className="flex-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="#1f2937"
                      />
                    </div>
                  )}
                />
                {errors.scrollbar_color && <p className="text-red-400 text-sm mt-1">{errors.scrollbar_color.message}</p>}
              </div>

              {/* Scrollbar Hover Color */}
              <div>
                <Label htmlFor="scrollbar_hover_color" className="text-gray-300">Cor da Barra de Scroll (Hover)</Label>
                <Controller
                  name="scrollbar_hover_color"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={field.value || '#111827'}
                        onChange={field.onChange}
                        className="w-16 h-10 rounded border border-gray-600 bg-gray-700 cursor-pointer"
                        title="Cor da barra de scroll no hover"
                      />
                      <Input
                        value={field.value || '#111827'}
                        onChange={field.onChange}
                        className="flex-1 bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                        placeholder="#111827"
                      />
                    </div>
                  )}
                />
                {errors.scrollbar_hover_color && <p className="text-red-400 text-sm mt-1">{errors.scrollbar_hover_color.message}</p>}
              </div>

            </div>
          </fieldset>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 pt-6 border-t border-gray-700 mt-8">
          <Button type="button" variant="outline" onClick={onCancel} className="px-6 py-2 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white transition-colors duration-200">
            Cancelar
          </Button>
          <Button type="submit" form="section-details-form" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : (section ? 'Salvar Detalhes da Seção' : 'Criar Seção')}
          </Button>
        </CardFooter>
      </form>

      {section && section.id && (
        <CardContent className="mt-8 border-t border-gray-700 pt-6">
          <fieldset className="border border-gray-700 p-6 rounded-lg shadow-inner bg-gray-900">
            <legend className="text-xl font-semibold px-2 text-blue-300">Configuração do Conteúdo (Estrutura Fixa)</legend>
            <NewSpecialSectionManager sectionId={section.id} />
          </fieldset>
        </CardContent>
      )}

    </Card>
  );
};

export default SpecialSectionForm;


