import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ProductSelector } from '@/components/Admin/SpecialSections/UI/ProductSelector';
import { Save, Package, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleProductSectionFormProps {
  section?: any;
  onSave: (sectionData: any) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export const SimpleProductSectionForm: React.FC<SimpleProductSectionFormProps> = ({
  section,
  onSave,
  onCancel,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: '',
    section_key: '',
    view_all_link: '',
    selectedProducts: [],
    is_active: true
  });

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    if (section && mode === 'edit') {
      setFormData({
        title: section.section_config?.title || section.section_config?.name || '',
        section_key: section.section_key || '',
        view_all_link: section.section_config?.view_all_link || '',
        selectedProducts: section.section_config?.selectedProducts || [],
        is_active: section.is_visible !== false
      });
      setSelectedProductIds(section.section_config?.selectedProducts || []);
    }
  }, [section, mode]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductSelectionChange = (productIds: string[]) => {
    setSelectedProductIds(productIds);
    handleInputChange('selectedProducts', productIds);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('Por favor, insira um título para a seção');
      return;
    }

    if (selectedProductIds.length === 0) {
      toast.error('Selecione pelo menos um produto para a seção');
      return;
    }

    const sectionData = {
      ...formData,
      section_key: formData.section_key || `products_${Date.now()}`,
      selectedProducts: selectedProductIds
    };

    onSave(sectionData);
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            {mode === 'create' ? 'Criar Seção de Produtos' : 'Editar Seção de Produtos'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Seção *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Produtos em Destaque"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="section_key">Chave da Seção</Label>
            <Input
              id="section_key"
              value={formData.section_key}
              onChange={(e) => handleInputChange('section_key', e.target.value)}
              placeholder="Ex: produtos_destaque"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="view_all_link">Link "Ver Todos" (Opcional)</Label>
            <Input
              id="view_all_link"
              value={formData.view_all_link}
              onChange={(e) => handleInputChange('view_all_link', e.target.value)}
              placeholder="Ex: /categoria/promocoes"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label>Seção ativa</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Produtos Selecionados ({selectedProductIds.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductSelector
            selectedIds={selectedProductIds}
            onChange={handleProductSelectionChange}
            selectionType="manual"
            maxSelection={12}
          />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit}>
          <Save className="w-4 h-4 mr-2" />
          {mode === 'create' ? 'Criar Seção' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
};