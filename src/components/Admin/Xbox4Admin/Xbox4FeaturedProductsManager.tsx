import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, XCircle, Package, Settings, Tag, Hash, Save, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLayoutItemConfig, ProductOverride } from '@/types/xbox4Admin';
import { useProducts } from '@/hooks/useProducts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Xbox4FeaturedProductsManagerProps {
  initialConfig: PageLayoutItemConfig | null;
  onSave: (config: PageLayoutItemConfig) => void;
  sectionTitle?: string;
  defaultTags?: string[];
}

const Xbox4FeaturedProductsManager: React.FC<Xbox4FeaturedProductsManagerProps> = ({ 
  initialConfig, 
  onSave, 
  sectionTitle = "Produtos em Destaque",
  defaultTags = ['xbox', 'console'] 
}) => {
  const { products } = useProducts();
  
  // Simple state for the new structure
  const [selectedProducts, setSelectedProducts] = useState<ProductOverride[]>([]);
  const [tagIds, setTagIds] = useState<string[]>(defaultTags);
  const [limit, setLimit] = useState(4);
  const [saving, setSaving] = useState(false);
  
  // Form state for adding new products
  const [newProductId, setNewProductId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Filter Xbox products for the dropdown
  const xboxProducts = products.filter(product => 
    product.name.toLowerCase().includes('xbox') || 
    product.tags?.some(tag => tag.name.toLowerCase().includes('xbox'))
  );

  // Load initial config if available
  useEffect(() => {
    if (initialConfig) {
      // Load products from the new simple structure
      if (initialConfig.products && Array.isArray(initialConfig.products)) {
        setSelectedProducts(initialConfig.products);
      }
      
      // Load filter settings
      if (initialConfig.filter) {
        if (initialConfig.filter.tagIds) {
          setTagIds(initialConfig.filter.tagIds);
        }
        if (initialConfig.filter.limit) {
          setLimit(initialConfig.filter.limit);
        }
      }
    }
  }, [initialConfig]);

  const addProduct = () => {
    if (!newProductId) return;
    
    const product = products.find(p => p.id === newProductId);
    if (!product) return;
    
    const newProduct: ProductOverride = {
      productId: newProductId,
      title: customTitle || undefined,
      imageUrl: customImageUrl || undefined
    };
    
    setSelectedProducts([...selectedProducts, newProduct]);
    setNewProductId('');
    setCustomTitle('');
    setCustomImageUrl('');
  };

  const removeProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: keyof ProductOverride, value: string) => {
    const updatedProducts = selectedProducts.map((product, i) =>
      i === index ? { ...product, [field]: value || undefined } : product
    );
    setSelectedProducts(updatedProducts);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Create the configuration object with the new simple structure
    const config: PageLayoutItemConfig = {
      filter: {
        tagIds: tagIds,
        limit: limit
      },
      products: selectedProducts
    };

    try {
      // Call the parent's onSave function
      await onSave(config);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-[#343A40] border-[#495057]">
      <CardHeader className="border-b border-[#495057] pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <Package className="w-5 h-5 text-[#107C10]" />
          Gerenciar {sectionTitle}
        </CardTitle>
        
        <Alert className="mt-3 bg-[#1A1A2E] border-[#343A40] text-gray-300">
          <AlertCircle className="h-4 w-4 text-[#107C10]" />
          <AlertDescription>
            Configure produtos específicos para a seção <strong>{sectionTitle}</strong> da página /xbox4, incluindo títulos e imagens personalizadas.
          </AlertDescription>
        </Alert>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Configurações Gerais */}
        <Card className="bg-[#2C2C44] border-[#343A40]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Settings className="w-4 h-4 text-[#007BFF]" />
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags (fallback)
                </Label>
                <Input 
                  value={tagIds.join(', ')} 
                  onChange={(e) => setTagIds(e.target.value.split(',').map(t => t.trim()))}
                  className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500" 
                  placeholder="xbox, console"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {tagIds.map((tag, index) => (
                    <Badge key={index} className="bg-[#107C10] text-white text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Limite de produtos
                </Label>
                <Input 
                  type="number" 
                  value={limit} 
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="bg-[#1A1A2E] border-[#343A40] text-white"
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Produtos Específicos */}
        <Card className="bg-[#2C2C44] border-[#343A40]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Package className="w-4 h-4 text-[#28A745]" />
              Produtos Específicos ({selectedProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum produto específico adicionado</p>
                <p className="text-sm">Use o formulário abaixo para adicionar produtos</p>
              </div>
            ) : (
              selectedProducts.map((product, index) => {
                const productData = products.find(p => p.id === product.productId);
                return (
                  <Card key={index} className="bg-[#343A40] border-[#495057] relative">
                    <CardContent className="p-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-[#DC3545] hover:text-[#C82333] hover:bg-[#DC3545]/10"
                        onClick={() => removeProduct(index)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      
                      <div className="space-y-3 pr-8">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#28A745]" />
                          <span className="text-white font-medium">
                            {productData?.name || 'Produto não encontrado'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-gray-300 text-sm">Título Personalizado</Label>
                            <Input
                              value={product.title || ''}
                              onChange={(e) => handleProductChange(index, 'title', e.target.value)}
                              placeholder="Deixe vazio para usar o título original"
                              className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-gray-300 text-sm">URL da Imagem Personalizada</Label>
                            <Input
                              value={product.imageUrl || ''}
                              onChange={(e) => handleProductChange(index, 'imageUrl', e.target.value)}
                              placeholder="Deixe vazio para usar a imagem original"
                              className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Adicionar Produto */}
        <Card className="bg-[#2C2C44] border-[#343A40]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <PlusCircle className="w-4 h-4 text-[#007BFF]" />
              Adicionar Produto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Selecionar Produto</Label>
              <Select value={newProductId} onValueChange={setNewProductId}>
                <SelectTrigger className="bg-[#1A1A2E] border-[#343A40] text-white">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent className="bg-[#2C2C44] border-[#343A40]">
                  {xboxProducts.map(product => (
                    <SelectItem key={product.id} value={product.id} className="text-white hover:bg-[#343A40]">
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Título Personalizado</Label>
                <Input 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Opcional - deixe em branco para usar o título original"
                  className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">URL da Imagem</Label>
                <Input 
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Opcional - deixe em branco para usar a imagem original"
                  className="bg-[#1A1A2E] border-[#343A40] text-white placeholder:text-gray-500"
                />
              </div>
            </div>
            
            <Button 
              onClick={addProduct} 
              disabled={!newProductId}
              className="w-full bg-[#007BFF] hover:bg-[#0056B3] text-white"
            >
              <PlusCircle className="h-4 w-4 mr-2" /> 
              Adicionar Produto
            </Button>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full bg-[#28A745] hover:bg-[#1E7E34] text-white py-3"
        >
          {saving ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Xbox4FeaturedProductsManager;

