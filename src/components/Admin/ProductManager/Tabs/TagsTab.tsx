import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tag } from 'lucide-react';
import { ProductFormData } from '@/types/product-extended';
import { Tag as TagType } from '@/hooks/useTags';

interface TagsTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
  tags: TagType[];
}

const TagsTab: React.FC<TagsTabProps> = ({ formData, onChange, tags }) => {
  const handleProductDescriptionsChange = (field: string, value: string) => {
    const currentDescriptions = formData.product_descriptions || {};
    onChange('product_descriptions', {
      ...currentDescriptions,
      [field]: value
    });
  };

  const productDescriptions = formData.product_descriptions || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Tags e Categorias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tags Selecionadas</Label>
            <div className="mt-2 space-y-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.tagIds?.includes(tag.id) || false}
                    onCheckedChange={(checked) => {
                      const currentTags = formData.tagIds || [];
                      if (checked) {
                        onChange('tagIds', [...currentTags, tag.id]);
                      } else {
                        onChange('tagIds', currentTags.filter(id => id !== tag.id));
                      }
                    }}
                  />
                  <Label>{tag.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Descrições Múltiplas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="short_description">Descrição Curta</Label>
            <Textarea
              id="short_description"
              value={productDescriptions.short || ''}
              onChange={(e) => handleProductDescriptionsChange('short', e.target.value)}
              placeholder="Descrição breve para cards e listagens..."
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="detailed_description">Descrição Detalhada</Label>
            <Textarea
              id="detailed_description"
              value={productDescriptions.detailed || ''}
              onChange={(e) => handleProductDescriptionsChange('detailed', e.target.value)}
              placeholder="Descrição completa do produto..."
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="technical_description">Descrição Técnica</Label>
            <Textarea
              id="technical_description"
              value={productDescriptions.technical || ''}
              onChange={(e) => handleProductDescriptionsChange('technical', e.target.value)}
              placeholder="Informações técnicas detalhadas..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="marketing_description">Descrição Marketing</Label>
            <Textarea
              id="marketing_description"
              value={productDescriptions.marketing || ''}
              onChange={(e) => handleProductDescriptionsChange('marketing', e.target.value)}
              placeholder="Texto promocional e de vendas..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meta_title">Meta Title</Label>
            <Input
              id="meta_title"
              value={formData.meta_title}
              onChange={(e) => onChange('meta_title', e.target.value)}
              placeholder="Título para SEO (máx. 60 caracteres)"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.meta_title?.length || 0}/60 caracteres
            </p>
          </div>

          <div>
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => onChange('meta_description', e.target.value)}
              placeholder="Descrição para SEO (máx. 160 caracteres)"
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.meta_description?.length || 0}/160 caracteres
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TagsTab;

