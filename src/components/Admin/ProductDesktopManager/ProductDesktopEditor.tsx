import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useProductSpecifications } from '@/hooks/useProductSpecifications';
import { Save, RotateCcw, Settings, Package, FileText } from 'lucide-react';
import { toast } from 'sonner';
import SpecificationCategoryManager from './SpecificationCategoryManager';

interface ProductDesktopEditorProps {
  product: any;
  onSave: (productData: any) => void;
  onCancel: () => void;
}

const ProductDesktopEditor: React.FC<ProductDesktopEditorProps> = ({
  product,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    brand: product.brand || '',
    description: product.description || '',
    category: product.category || '',
    meta_title: product.meta_title || '',
    meta_description: product.meta_description || '',
    price: product.price || 0,
    stock: product.stock || 0,
  });

  const [isDirty, setIsDirty] = useState(false);
  const { categorizedSpecs, loading: specsLoading, refreshSpecifications } = useProductSpecifications(product.id, 'desktop', product);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(formData);
    setIsDirty(false);
  };

  const handleReset = () => {
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      description: product.description || '',
      category: product.category || '',
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      price: product.price || 0,
      stock: product.stock || 0,
    });
    setIsDirty(false);
  };

  return (
    <div className="h-full flex flex-col max-h-[85vh]">
      <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Informações Básicas
          </TabsTrigger>
          <TabsTrigger value="specifications" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Especificações Técnicas
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            SEO & Descrições
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome do Produto</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Digite o nome do produto"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca/Editora</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        placeholder="Ex: Ubisoft, Sony, Microsoft"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        placeholder="Ex: Games, Consoles, Acessórios"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descrição detalhada do produto"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Especificações Técnicas
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure as especificações que aparecerão na página de produto desktop
                  </p>
                </CardHeader>
                <CardContent>
                  <SpecificationCategoryManager 
                    productId={product.id}
                    categorizedSpecs={categorizedSpecs || []}
                    onSpecificationsChange={refreshSpecifications}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>SEO e Meta Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Título SEO</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      placeholder="Título otimizado para SEO"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.meta_title.length}/60 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Descrição SEO</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      placeholder="Descrição otimizada para mecanismos de busca"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.meta_description.length}/160 caracteres
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t p-4 bg-background flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDirty && (
                <Badge variant="secondary" className="text-xs">
                  Alterações não salvas
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!isDirty}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isDirty}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default ProductDesktopEditor;