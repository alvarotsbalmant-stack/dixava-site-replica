import React, { useState, useEffect } from 'react';
import { X, Search, Filter, Eye, Grid, List, Shuffle, Zap, TrendingUp, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useProducts } from '@/hooks/useProducts';
import { ProductCatalog } from './ProductCatalog';

interface ProductSectionCreatorProps {
  onSave: (sectionData: any) => void;
  onClose: () => void;
}

export const ProductSectionCreator: React.FC<ProductSectionCreatorProps> = ({ onSave, onClose }) => {
  const { products, loading } = useProducts();
  
  // Estados da seção
  const [sectionName, setSectionName] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [sectionMode, setSectionMode] = useState<'automatic' | 'manual'>('automatic');
  
  // Estados para critérios automáticos
  const [automaticCriteria, setAutomaticCriteria] = useState({
    categories: [] as string[],
    tags: [] as string[],
    minPrice: '',
    maxPrice: '',
    minRating: '',
    inStock: false,
    isNew: false,
    isFeatured: false,
    sortBy: 'newest',
    limit: 12
  });

  // Estados para seleção manual
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Estados de layout
  const [layoutConfig, setLayoutConfig] = useState({
    columns: 4,
    showPrice: true,
    showRating: true,
    showBadges: true,
    showAddToCart: true,
    spacing: 'normal',
    template: 'grid'
  });

  // Preview dos produtos
  const [previewProducts, setPreviewProducts] = useState<any[]>([]);

  // Atualizar preview quando critérios mudarem
  useEffect(() => {
    updatePreview();
  }, [automaticCriteria, selectedProducts, sectionMode, products]);

  const updatePreview = () => {
    if (sectionMode === 'automatic') {
      // Filtrar produtos com base nos critérios automáticos
      let filtered = [...products];

      // Filtrar por categorias
      if (automaticCriteria.categories.length > 0) {
        filtered = filtered.filter(p => 
          automaticCriteria.categories.some(cat => p.category?.toLowerCase().includes(cat.toLowerCase()))
        );
      }

      // Filtrar por tags
      if (automaticCriteria.tags.length > 0) {
        filtered = filtered.filter(p => 
          p.tags?.some(tag => automaticCriteria.tags.includes(tag.name))
        );
      }

      // Filtrar por preço
      if (automaticCriteria.minPrice) {
        const minPrice = parseFloat(automaticCriteria.minPrice);
        filtered = filtered.filter(p => (p.price || 0) >= minPrice);
      }
      if (automaticCriteria.maxPrice) {
        const maxPrice = parseFloat(automaticCriteria.maxPrice);
        filtered = filtered.filter(p => (p.price || 0) <= maxPrice);
      }

      // Filtrar por rating
      if (automaticCriteria.minRating) {
        const minRating = parseFloat(automaticCriteria.minRating);
        filtered = filtered.filter(p => (p.rating_average || 0) >= minRating);
      }

      // Filtrar por estoque
      if (automaticCriteria.inStock) {
        filtered = filtered.filter(p => (p.stock || 0) > 0);
      }

      // Filtrar por destaque
      if (automaticCriteria.isFeatured) {
        filtered = filtered.filter(p => p.is_featured);
      }

      // Ordenar
      switch (automaticCriteria.sortBy) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          break;
        case 'price_asc':
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price_desc':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'rating':
          filtered.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0));
          break;
        case 'popular':
          filtered.sort((a, b) => (b.rating_count || 0) - (a.rating_count || 0));
          break;
        default:
          break;
      }

      // Limitar quantidade
      filtered = filtered.slice(0, automaticCriteria.limit);
      setPreviewProducts(filtered);
    } else {
      // Modo manual - mostrar produtos selecionados
      const selected = products.filter(p => selectedProducts.includes(p.id));
      setPreviewProducts(selected);
    }
  };

  const handleSave = () => {
    if (!sectionName.trim()) {
      return;
    }

    const sectionData = {
      name: sectionName,
      description: sectionDescription,
      mode: sectionMode,
      criteria: sectionMode === 'automatic' ? automaticCriteria : null,
      selectedProducts: sectionMode === 'manual' ? selectedProducts : null,
      layout: layoutConfig,
      previewCount: previewProducts.length
    };

    onSave(sectionData);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Criar Seção de Produtos</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configurações */}
          <div className="lg:col-span-2 space-y-6">
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
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="Ex: Produtos em Destaque"
                  />
                </div>
                <div>
                  <Label htmlFor="sectionDescription">Descrição</Label>
                  <Textarea
                    id="sectionDescription"
                    value={sectionDescription}
                    onChange={(e) => setSectionDescription(e.target.value)}
                    placeholder="Descrição opcional da seção"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Modo de Seleção */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">CRITÉRIOS DE PRODUTOS</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={sectionMode} onValueChange={(value: any) => setSectionMode(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="automatic" className="flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Automático</span>
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="flex items-center space-x-2">
                      <Filter className="w-4 h-4" />
                      <span>Manual</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="automatic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Ordenação</Label>
                        <Select 
                          value={automaticCriteria.sortBy} 
                          onValueChange={(value) => setAutomaticCriteria(prev => ({ ...prev, sortBy: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Mais Recentes</SelectItem>
                            <SelectItem value="price_asc">Menor Preço</SelectItem>
                            <SelectItem value="price_desc">Maior Preço</SelectItem>
                            <SelectItem value="rating">Melhor Avaliados</SelectItem>
                            <SelectItem value="popular">Mais Populares</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Limite de Produtos</Label>
                        <Select 
                          value={automaticCriteria.limit.toString()} 
                          onValueChange={(value) => setAutomaticCriteria(prev => ({ ...prev, limit: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4">4 produtos</SelectItem>
                            <SelectItem value="8">8 produtos</SelectItem>
                            <SelectItem value="12">12 produtos</SelectItem>
                            <SelectItem value="16">16 produtos</SelectItem>
                            <SelectItem value="20">20 produtos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Preço Mínimo</Label>
                        <Input
                          type="number"
                          value={automaticCriteria.minPrice}
                          onChange={(e) => setAutomaticCriteria(prev => ({ ...prev, minPrice: e.target.value }))}
                          placeholder="R$ 0,00"
                        />
                      </div>
                      <div>
                        <Label>Preço Máximo</Label>
                        <Input
                          type="number"
                          value={automaticCriteria.maxPrice}
                          onChange={(e) => setAutomaticCriteria(prev => ({ ...prev, maxPrice: e.target.value }))}
                          placeholder="R$ 999,00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={automaticCriteria.inStock}
                          onCheckedChange={(checked) => setAutomaticCriteria(prev => ({ ...prev, inStock: checked }))}
                        />
                        <Label>Apenas produtos em estoque</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={automaticCriteria.isFeatured}
                          onCheckedChange={(checked) => setAutomaticCriteria(prev => ({ ...prev, isFeatured: checked }))}
                        />
                        <Label>Apenas produtos em destaque</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="manual">
                    <ProductCatalog
                      selectedProducts={selectedProducts}
                      onSelectionChange={setSelectedProducts}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Layout e Apresentação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">LAYOUT E APRESENTAÇÃO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Colunas</Label>
                    <Select 
                      value={layoutConfig.columns.toString()} 
                      onValueChange={(value) => setLayoutConfig(prev => ({ ...prev, columns: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 colunas</SelectItem>
                        <SelectItem value="3">3 colunas</SelectItem>
                        <SelectItem value="4">4 colunas</SelectItem>
                        <SelectItem value="6">6 colunas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Template</Label>
                    <Select 
                      value={layoutConfig.template} 
                      onValueChange={(value) => setLayoutConfig(prev => ({ ...prev, template: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="list">Lista</SelectItem>
                        <SelectItem value="carousel">Carrossel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Elementos a Exibir</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={layoutConfig.showPrice}
                        onCheckedChange={(checked) => setLayoutConfig(prev => ({ ...prev, showPrice: checked }))}
                      />
                      <Label>Preço</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={layoutConfig.showRating}
                        onCheckedChange={(checked) => setLayoutConfig(prev => ({ ...prev, showRating: checked }))}
                      />
                      <Label>Avaliações</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={layoutConfig.showBadges}
                        onCheckedChange={(checked) => setLayoutConfig(prev => ({ ...prev, showBadges: checked }))}
                      />
                      <Label>Badges</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={layoutConfig.showAddToCart}
                        onCheckedChange={(checked) => setLayoutConfig(prev => ({ ...prev, showAddToCart: checked }))}
                      />
                      <Label>Botão Comprar</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-0">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>PREVIEW EM TEMPO REAL</span>
                  <Badge variant="outline">
                    {previewProducts.length} produtos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
                  </div>
                ) : previewProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ajuste os critérios para ver produtos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {previewProducts.slice(0, 6).map((product, index) => (
                      <div key={product.id} className="flex items-center space-x-2 p-2 border rounded">
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.price ? `R$ ${product.price.toFixed(2)}` : 'Preço não informado'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {previewProducts.length > 6 && (
                      <div className="text-center py-2">
                        <p className="text-xs text-muted-foreground">
                          +{previewProducts.length - 6} produtos...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!sectionName.trim()}>
            <Eye className="w-4 h-4 mr-2" />
            Criar Seção ({previewProducts.length} produtos)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSectionCreator;