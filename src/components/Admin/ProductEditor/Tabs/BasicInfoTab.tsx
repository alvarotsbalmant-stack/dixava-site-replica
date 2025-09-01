import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductEditorData } from '../ProductEditor';

interface BasicInfoTabProps {
  formData: ProductEditorData;
  onChange: (field: string, value: any) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Nome e informações básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onChange('name', e.target.value)}
                placeholder="Ex: PlayStation 5 Console"
              />
            </div>
            
            <div>
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                value={formData.brand || ''}
                onChange={(e) => onChange('brand', e.target.value)}
                placeholder="Ex: Sony"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Descrição detalhada do produto..."
              className="min-h-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => onChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consoles">Consoles</SelectItem>
                  <SelectItem value="games">Jogos</SelectItem>
                  <SelectItem value="acessorios">Acessórios</SelectItem>
                  <SelectItem value="perifericos">Periféricos</SelectItem>
                  <SelectItem value="headsets">Headsets</SelectItem>
                  <SelectItem value="controles">Controles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition">Condição</Label>
              <Select
                value={formData.condition || 'Novo'}
                onValueChange={(value) => onChange('condition', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Usado">Usado</SelectItem>
                  <SelectItem value="Recondicionado">Recondicionado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock || 0}
                onChange={(e) => onChange('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status e configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Status e Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active">Produto Ativo</Label>
              <p className="text-sm text-gray-500">O produto será visível na loja</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => onChange('is_active', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_featured">Produto em Destaque</Label>
              <p className="text-sm text-gray-500">Aparecerá em seções especiais</p>
            </div>
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => onChange('is_featured', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Badge customizável */}
      <Card>
        <CardHeader>
          <CardTitle>Badge do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="badge_visible">Exibir Badge</Label>
              <p className="text-sm text-gray-500">Mostrar badge personalizado no produto</p>
            </div>
            <Switch
              id="badge_visible"
              checked={formData.badge_visible}
              onCheckedChange={(checked) => onChange('badge_visible', checked)}
            />
          </div>

          {formData.badge_visible && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="badge_text">Texto do Badge</Label>
                <Input
                  id="badge_text"
                  value={formData.badge_text || ''}
                  onChange={(e) => onChange('badge_text', e.target.value)}
                  placeholder="Ex: NOVIDADE"
                />
              </div>
              
              <div>
                <Label htmlFor="badge_color">Cor do Badge</Label>
                <div className="flex gap-2">
                  <Input
                    id="badge_color"
                    type="color"
                    value={formData.badge_color || '#22c55e'}
                    onChange={(e) => onChange('badge_color', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.badge_color || '#22c55e'}
                    onChange={(e) => onChange('badge_color', e.target.value)}
                    placeholder="#22c55e"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.badge_visible && formData.badge_text && (
            <div className="mt-2">
              <Label>Preview:</Label>
              <div 
                className="inline-block px-2 py-1 text-xs font-semibold text-white rounded mt-1"
                style={{ backgroundColor: formData.badge_color || '#22c55e' }}
              >
                {formData.badge_text}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BasicInfoTab;