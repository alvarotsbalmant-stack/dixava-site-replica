import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import useSKUs from '@/hooks/useSKUs';
import useDynamicPlatforms from '@/hooks/useDynamicPlatforms';
import { useProductRefresh } from '@/hooks/useProductRefresh';
import { Product, ProductSKU, MasterProduct, Platform } from '@/hooks/useProducts/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Package, Eye, EyeOff } from 'lucide-react';

interface SKUManagerProps {
  masterProduct?: MasterProduct;
  onClose?: () => void;
}

const SKUManager: React.FC<SKUManagerProps> = ({ masterProduct, onClose }) => {
  const { toast } = useToast();
  const { 
    fetchSKUsForMaster, 
    createSKU, 
    updateSKU, 
    deleteSKU,
    loading 
  } = useSKUs();
  
  const { platformConfig, loading: platformsLoading } = useDynamicPlatforms();
  const { refreshAfterOperation } = useProductRefresh();

  const [skus, setSKUs] = useState<ProductSKU[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<ProductSKU | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Form state para criação/edição de SKU
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    platform: '',
    sku_code: '',
    description: '',
    image: '',
    is_active: true
  });

  // Carregar SKUs quando o componente montar
  useEffect(() => {
    if (masterProduct?.id) {
      loadSKUs();
    }
  }, [masterProduct?.id]);

  const loadSKUs = async () => {
    if (!masterProduct?.id) return;
    
    try {
      const skusData = await fetchSKUsForMaster(masterProduct.id);
      setSKUs(skusData);
    } catch (error) {
      console.error('Erro ao carregar SKUs:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      platform: '',
      sku_code: '',
      description: '',
      image: '',
      is_active: true
    });
  };

  const handleCreateSKU = async () => {
    if (!masterProduct?.id) return;

    try {
      const skuData: Partial<ProductSKU> = {
        parent_product_id: masterProduct.id,
        name: formData.name || `${masterProduct.name} - ${platformConfig[formData.platform]?.name}`,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sku_code: formData.sku_code,
        description: formData.description || masterProduct.description,
        image: formData.image || masterProduct.image,
        is_active: formData.is_active,
        variant_attributes: {
          platform: formData.platform
        },
        category_id: masterProduct.category_id,
        sort_order: skus.length
      };

      const newSKUId = await createSKU(skuData);
      if (newSKUId) {
        await loadSKUs();
        // Atualizar contexto global de produtos
        await refreshAfterOperation('criação de SKU');
        setShowCreateDialog(false);
        resetForm();
        
        toast({
          title: "SKU criado com sucesso!",
          description: `SKU para ${platformConfig[formData.platform]?.name} foi criado.`,
        });
      }
    } catch (error) {
      console.error('Erro ao criar SKU:', error);
      toast({
        title: "Erro ao criar SKU",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const handleEditSKU = async () => {
    if (!selectedSKU) return;

    try {
      const updates: Partial<ProductSKU> = {
        name: formData.name,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sku_code: formData.sku_code,
        description: formData.description,
        image: formData.image,
        is_active: formData.is_active,
        variant_attributes: {
          ...selectedSKU.variant_attributes,
          platform: formData.platform
        }
      };

      const success = await updateSKU(selectedSKU.id, updates);
      if (success) {
        await loadSKUs();
        // Atualizar contexto global de produtos
        await refreshAfterOperation('edição de SKU');
        setShowEditDialog(false);
        setSelectedSKU(null);
        resetForm();
        
        toast({
          title: "SKU atualizado com sucesso!",
          description: `${selectedSKU.name} foi atualizado.`,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar SKU:', error);
    }
  };

  const handleDeleteSKU = async (sku: ProductSKU) => {
    try {
      const success = await deleteSKU(sku.id);
      if (success) {
        // Recarregar a lista de SKUs após a exclusão
        await loadSKUs();
        // Atualizar contexto global de produtos
        await refreshAfterOperation('exclusão de SKU');
        
        toast({
          title: "SKU excluído com sucesso!",
          description: `${sku.name} foi removido.`,
        });
      } else {
        toast({
          title: "Erro ao excluir SKU",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao deletar SKU:', error);
      toast({
        title: "Erro ao excluir SKU",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (sku: ProductSKU) => {
    setSelectedSKU(sku);
    setFormData({
      name: sku.name,
      price: sku.price.toString(),
      stock: sku.stock?.toString() || '0',
      platform: sku.variant_attributes?.platform || '',
      sku_code: sku.sku_code || '',
      description: sku.description || '',
      image: sku.image || '',
      is_active: sku.is_active !== false
    });
    setShowEditDialog(true);
  };

  const getUsedPlatforms = () => {
    return skus.map(sku => sku.variant_attributes?.platform).filter(Boolean);
  };

  const getAvailablePlatforms = () => {
    const usedPlatforms = getUsedPlatforms();
    return Object.keys(platformConfig).filter(platform => 
      !usedPlatforms.includes(platform)
    );
  };

  if (!masterProduct) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Selecione um produto mestre para gerenciar SKUs</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gerenciar SKUs
          </h2>
          <p className="text-gray-600">
            Produto: {masterProduct.name}
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar SKU
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo SKU</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">Plataforma *</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePlatforms().map(platform => (
                        <SelectItem key={platform} value={platform}>
                          {platformConfig[platform]?.icon} {platformConfig[platform]?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sku_code">Código SKU</Label>
                  <Input
                    id="sku_code"
                    value={formData.sku_code}
                    onChange={(e) => setFormData({...formData, sku_code: e.target.value})}
                    placeholder="Ex: FH5-XBOX-001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nome do Produto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Deixe vazio para gerar automaticamente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock">Estoque</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Deixe vazio para herdar do produto mestre"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">URL da Imagem</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="Deixe vazio para herdar do produto mestre"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSKU} disabled={!formData.platform || !formData.price}>
                  Criar SKU
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de SKUs */}
      <div className="grid gap-4">
        {skus.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhum SKU criado ainda</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro SKU
              </Button>
            </CardContent>
          </Card>
        ) : (
          skus.map((sku) => {
            const platform = sku.variant_attributes?.platform;
            const platformInfo = platformConfig[platform || ''];
            
            return (
              <Card key={sku.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {platformInfo?.icon || '🎮'}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{sku.name}</h3>
                          {sku.is_active ? (
                            <Badge className="bg-green-500">
                              <Eye className="w-3 h-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Plataforma: {platformInfo?.name || platform}</p>
                          <p>Preço: R$ {sku.price.toFixed(2)}</p>
                          <p>Estoque: {sku.stock || 0} unidades</p>
                          {sku.sku_code && <p>Código: {sku.sku_code}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(sku)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o SKU "{sku.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSKU(sku)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar SKU</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-platform">Plataforma *</Label>
                <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(platformConfig).map(platform => (
                      <SelectItem key={platform} value={platform}>
                        {platformConfig[platform]?.icon} {platformConfig[platform]?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-sku_code">Código SKU</Label>
                <Input
                  id="edit-sku_code"
                  value={formData.sku_code}
                  onChange={(e) => setFormData({...formData, sku_code: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-name">Nome do Produto</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Preço *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-stock">Estoque</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit-image">URL da Imagem</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditSKU} disabled={!formData.platform || !formData.price}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SKUManager;

