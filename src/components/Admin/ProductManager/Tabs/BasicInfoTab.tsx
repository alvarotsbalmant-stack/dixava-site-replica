import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, Eye, Tag } from 'lucide-react';
import { ProductFormData } from '@/types/product-extended';

interface BasicInfoTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, onChange }) => {
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (value: string) => {
    onChange('name', value);
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      onChange('slug', generateSlug(value));
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Informações Principais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Xbox Series X - 1TB Digital Edition"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => onChange('slug', e.target.value)}
                placeholder="xbox-series-x-1tb"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL: /produto/{formData.slug || 'slug-do-produto'}
              </p>
            </div>

            <div>
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => onChange('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição Curta</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Descrição breve que aparece nos cards de produto..."
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preços */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Configuração de Preços
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Preço Principal *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="list_price">Preço de Lista</Label>
              <Input
                id="list_price"
                type="number"
                step="0.01"
                value={formData.list_price || ''}
                onChange={(e) => onChange('list_price', parseFloat(e.target.value) || null)}
                placeholder="0.00"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Preço riscado (De: R$)</p>
            </div>

            <div>
              <Label htmlFor="pro_price">Preço UTI PRO</Label>
              <Input
                id="pro_price"
                type="number"
                step="0.01"
                value={formData.pro_price || ''}
                onChange={(e) => onChange('pro_price', parseFloat(e.target.value) || null)}
                placeholder="0.00"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Preço especial para membros</p>
            </div>
          </div>

          {/* Preview de preços */}
          {formData.price > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview de Preços:</h4>
              <div className="flex flex-wrap gap-2">
                {formData.list_price && formData.list_price > formData.price && (
                  <Badge variant="outline" className="text-gray-500 line-through">
                    De: R$ {formData.list_price.toFixed(2)}
                  </Badge>
                )}
                <Badge className="bg-green-600 text-white">
                  R$ {formData.price.toFixed(2)}
                </Badge>
                {formData.pro_price && formData.pro_price < formData.price && (
                  <Badge className="bg-blue-600 text-white">
                    UTI PRO: R$ {formData.pro_price.toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge e Visibilidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Badge e Visibilidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="badge_text">Texto do Badge</Label>
              <Input
                id="badge_text"
                value={formData.badge_text}
                onChange={(e) => onChange('badge_text', e.target.value)}
                placeholder="Ex: NOVO, PROMOÇÃO, DESTAQUE"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="badge_color">Cor do Badge</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="badge_color"
                  type="color"
                  value={formData.badge_color}
                  onChange={(e) => onChange('badge_color', e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={formData.badge_color}
                  onChange={(e) => onChange('badge_color', e.target.value)}
                  placeholder="#22c55e"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="badge_visible"
              checked={formData.badge_visible}
              onCheckedChange={(checked) => onChange('badge_visible', checked)}
            />
            <Label htmlFor="badge_visible">Exibir badge no produto</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => onChange('is_featured', checked)}
            />
            <Label htmlFor="is_featured">Produto em destaque</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => onChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Produto ativo (visível no site)</Label>
          </div>

          {/* Preview do badge */}
          {formData.badge_text && formData.badge_visible && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview do Badge:</h4>
              <Badge 
                style={{ backgroundColor: formData.badge_color }}
                className="text-white"
              >
                {formData.badge_text}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Variações do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sizes">Tamanhos</Label>
              <Input
                id="sizes"
                value={formData.sizes?.join(', ') || ''}
                onChange={(e) => {
                  const sizes = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  onChange('sizes', sizes);
                }}
                placeholder="P, M, G, GG"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Separar por vírgula</p>
            </div>

            <div>
              <Label htmlFor="colors">Cores</Label>
              <Input
                id="colors"
                value={formData.colors?.join(', ') || ''}
                onChange={(e) => {
                  const colors = e.target.value.split(',').map(c => c.trim()).filter(Boolean);
                  onChange('colors', colors);
                }}
                placeholder="Preto, Branco, Azul"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Separar por vírgula</p>
            </div>
          </div>

          {/* Preview das variações */}
          {(formData.sizes?.length > 0 || formData.colors?.length > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview das Variações:</h4>
              <div className="space-y-2">
                {formData.sizes?.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Tamanhos: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.sizes.map((size, index) => (
                        <Badge key={index} variant="outline">{size}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {formData.colors?.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Cores: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.colors.map((color, index) => (
                        <Badge key={index} variant="outline">{color}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfoTab;

