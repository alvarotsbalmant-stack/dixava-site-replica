
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SpecialSectionElement, SpecialSectionElementCreateInput, SpecialSectionElementUpdateInput } from '@/types/specialSections';

// Define element types based on analysis
const elementTypes = [
  'banner_full',
  'banner_medium',
  'banner_small',
  'banner_product_highlight',
  'product_carousel',
  'text_block',
] as const;

// Zod schema for element validation
const elementSchema = z.object({
  element_type: z.enum(elementTypes),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  link_url: z.string().url('URL inválida').optional().or(z.literal('')),
  link_text: z.string().optional(),
  background_type: z.enum(['color', 'image', 'gradient', 'transparent']).default('transparent'),
  background_color: z.string().optional(),
  background_image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  background_gradient: z.string().optional(),
  text_color: z.string().optional().default('#000000'),
  content_type: z.enum(['products', 'tags', 'manual']).optional(),
  content_ids: z.array(z.string()).optional(),
  grid_position: z.string().optional(),
  grid_size: z.string().optional(),
  width_percentage: z.number().int().min(0).max(100).optional(),
  height_desktop: z.number().int().min(0).optional(),
  height_mobile: z.number().int().min(0).optional(),
  padding: z.number().int().min(0).optional().default(0),
  margin_bottom: z.number().int().min(0).optional().default(20),
  border_radius: z.number().int().min(0).optional().default(0),
  visible_items_desktop: z.number().int().min(1).optional().default(4),
  visible_items_tablet: z.number().int().min(1).optional().default(3),
  visible_items_mobile: z.number().int().min(1).optional().default(1),
  is_active: z.boolean().default(true),
  display_order: z.number().int().optional().default(0),
});

type ElementFormData = z.infer<typeof elementSchema>;

interface SpecialSectionElementFormProps {
  element: Partial<SpecialSectionElement> | null;
  onSubmit: (data: SpecialSectionElementCreateInput | SpecialSectionElementUpdateInput) => void;
  onCancel: () => void;
}

const SpecialSectionElementForm: React.FC<SpecialSectionElementFormProps> = ({ element, onSubmit, onCancel }) => {
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ElementFormData>({
    resolver: zodResolver(elementSchema),
    defaultValues: element ? {
        element_type: (element.element_type as any) || 'banner_full',
        title: element.title || '',
        subtitle: element.subtitle || '',
        image_url: element.image_url || '',
        link_url: element.link_url || '',
        link_text: element.link_text || '',
        background_type: (['color', 'image', 'gradient', 'transparent'].includes(element.background_type as any) 
          ? element.background_type as any 
          : 'transparent'),
        background_color: element.background_color || '',
        background_image_url: element.background_image_url || '',
        background_gradient: element.background_gradient || '',
        text_color: element.text_color || '#000000',
        content_type: element.content_type as any,
        content_ids: Array.isArray(element.content_ids) ? element.content_ids as string[] : [],
        grid_position: element.grid_position || '',
        grid_size: element.grid_size || '',
        width_percentage: element.width_percentage || undefined,
        height_desktop: element.height_desktop || undefined,
        height_mobile: element.height_mobile || undefined,
        padding: element.padding || 0,
        margin_bottom: element.margin_bottom || 20,
        border_radius: element.border_radius || 0,
        visible_items_desktop: element.visible_items_desktop || 4,
        visible_items_tablet: element.visible_items_tablet || 3,
        visible_items_mobile: element.visible_items_mobile || 1,
        display_order: element.display_order || 0,
        is_active: element.is_active !== false,
    } : {
        element_type: 'banner_full',
        is_active: true,
        background_type: 'transparent',
        text_color: '#000000',
        padding: 0,
        margin_bottom: 20,
        border_radius: 0,
        visible_items_desktop: 4,
        visible_items_tablet: 3,
        visible_items_mobile: 1,
        display_order: 0,
        content_ids: [],
    },
  });

  const selectedElementType = watch('element_type');
  const backgroundType = watch('background_type');

  const handleFormSubmit = (data: ElementFormData) => {
    const processedData = {
      ...data,
      image_url: data.image_url === '' ? null : data.image_url,
      link_url: data.link_url === '' ? null : data.link_url,
      background_image_url: data.background_image_url === '' ? null : data.background_image_url,
      width_percentage: data.width_percentage === undefined ? null : data.width_percentage,
      height_desktop: data.height_desktop === undefined ? null : data.height_desktop,
      height_mobile: data.height_mobile === undefined ? null : data.height_mobile,
    };
    onSubmit(processedData as SpecialSectionElementCreateInput | SpecialSectionElementUpdateInput);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 bg-gray-850 p-6 rounded-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">{element ? 'Editar Elemento' : 'Adicionar Novo Elemento'}</h3>

      {/* Element Type Selection */}
      <div>
        <Label htmlFor="element_type">Tipo de Elemento</Label>
        <Controller
          name="element_type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {elementTypes.map(type => (
                  <SelectItem key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Common Fields */}
      <div>
        <Label htmlFor="title">Título (Opcional)</Label>
        <Input id="title" {...register('title')} className="bg-gray-700 border-gray-600 text-white" />
      </div>

      {/* Conditional Fields based on Element Type */}
      {(selectedElementType === 'banner_full' || selectedElementType === 'banner_medium' || selectedElementType === 'banner_small' || selectedElementType === 'banner_product_highlight') && (
        <>
          <div>
            <Label htmlFor="subtitle">Subtítulo/Descrição (Opcional)</Label>
            <Textarea id="subtitle" {...register('subtitle')} className="bg-gray-700 border-gray-600 text-white" />
          </div>
          <div>
            <Label htmlFor="image_url">URL da Imagem Principal</Label>
            <Input id="image_url" {...register('image_url')} className="bg-gray-700 border-gray-600 text-white" />
            {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url.message}</p>}
            <div className="mt-2 p-3 bg-blue-900/30 border border-blue-700 rounded">
              <p className="text-blue-300 text-sm font-medium">Tamanhos Recomendados:</p>
              <p className="text-blue-200 text-xs mt-1">
                {selectedElementType === 'banner_full' && '• Banner Completo: 1200x400px'}
                {selectedElementType === 'banner_medium' && '• Banner Médio: 800x300px'}
                {selectedElementType === 'banner_small' && '• Banner Pequeno: 400x200px'}
                {selectedElementType === 'banner_product_highlight' && '• Banner Destaque de Produto: 600x300px'}
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="link_url">URL do Link (Opcional)</Label>
            <Input id="link_url" {...register('link_url')} className="bg-gray-700 border-gray-600 text-white" />
            {errors.link_url && <p className="text-red-500 text-sm">{errors.link_url.message}</p>}
          </div>
           <div>
            <Label htmlFor="link_text">Texto do Botão/Link (Opcional)</Label>
            <Input id="link_text" {...register('link_text')} className="bg-gray-700 border-gray-600 text-white" />
          </div>
        </>
      )}

      {selectedElementType === 'product_carousel' && (
        <>
           <div>
             <Label htmlFor="content_type">Selecionar Produtos Por:</Label>
              <Controller
                name="content_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Método de seleção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tags">Tags (Categorias)</SelectItem>
                      <SelectItem value="manual">Seleção Manual</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
           </div>
           <div className='text-yellow-400 p-4 bg-yellow-900/30 rounded border border-yellow-700'>
             <p>TODO: Implementar seleção de Produtos/Tags aqui.</p>
             <p>Por enquanto, salve o elemento e edite os IDs manualmente no Supabase se necessário.</p>
           </div>
           <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="visible_items_desktop">Itens Visíveis (Desktop)</Label>
                <Input id="visible_items_desktop" type="number" {...register('visible_items_desktop', { valueAsNumber: true })} className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div>
                <Label htmlFor="visible_items_tablet">Itens Visíveis (Tablet)</Label>
                <Input id="visible_items_tablet" type="number" {...register('visible_items_tablet', { valueAsNumber: true })} className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div>
                <Label htmlFor="visible_items_mobile">Itens Visíveis (Mobile)</Label>
                <Input id="visible_items_mobile" type="number" {...register('visible_items_mobile', { valueAsNumber: true })} className="bg-gray-700 border-gray-600 text-white" />
              </div>
           </div>
        </>
      )}

      {selectedElementType === 'text_block' && (
         <div>
            <Label htmlFor="subtitle">Conteúdo do Texto (Use Markdown)</Label>
            <Textarea id="subtitle" {...register('subtitle')} rows={5} className="bg-gray-700 border-gray-600 text-white" />
          </div>
      )}

      {/* Common Settings */}
       <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="display_order">Ordem de Exibição (dentro da seção)</Label>
            <Input id="display_order" type="number" {...register('display_order', { valueAsNumber: true })} className="bg-gray-700 border-gray-600 text-white" />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch
                  id="is_active_element"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="is_active_element">Ativo</Label>
          </div>
       </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Salvar Elemento</Button>
      </div>
    </form>
  );
};

export default SpecialSectionElementForm;
