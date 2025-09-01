import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Package, 
  Trash2, 
  DollarSign, 
  Archive, 
  AlertTriangle,
  Search,
  Save,
  Eye,
  EyeOff 
} from 'lucide-react';
import { useProductsAdmin } from '@/hooks/useProductsEnhanced';
import { Product } from '@/hooks/useProducts';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/formatPrice';

const ProductEasyManager = () => {
  const { products, loading, deleteProduct, updateProduct, batchOperations } = useProductsAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProducts, setEditingProducts] = useState<{ [key: string]: { price: number; stock: number; pro_price?: number } }>({});
  const [confirmText, setConfirmText] = useState('');
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductEdit = (productId: string, field: 'price' | 'stock' | 'pro_price', value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditingProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: numValue
      }
    }));
  };

  const saveProductChanges = async (product: Product) => {
    const changes = editingProducts[product.id];
    if (!changes) return;

    try {
      await updateProduct(product.id, {
        price: changes.price || product.price,
        stock: changes.stock !== undefined ? changes.stock : product.stock,
        pro_price: changes.pro_price !== undefined ? changes.pro_price : product.pro_price
      });

      // Remove from editing state
      setEditingProducts(prev => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });

      toast.success(`Produto "${product.name}" atualizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  const saveAllChanges = async () => {
    if (Object.keys(editingProducts).length === 0) {
      toast.info('Nenhuma alteração para salvar');
      return;
    }

    setIsSavingChanges(true);
    
    try {
      const updates = Object.entries(editingProducts).map(([productId, changes]) => ({
        id: productId,
        data: {
          price: changes.price,
          stock: changes.stock,
          pro_price: changes.pro_price
        }
      }));

      await batchOperations.updateMultiple(updates);
      setEditingProducts({});
      toast.success(`${updates.length} produtos atualizados com sucesso!`);
    } catch (error) {
      console.error('Erro ao salvar alterações em lote:', error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSavingChanges(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      toast.success(`Produto "${product.name}" removido com sucesso!`);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const handleDeleteAllProducts = async () => {
    if (confirmText !== 'CONFIRMAR') {
      toast.error('Digite "CONFIRMAR" para continuar');
      return;
    }

    setIsDeleting(true);
    
    try {
      const productIds = products.map(p => p.id);
      await batchOperations.deleteMultiple(productIds);
      
      setShowDeleteAllDialog(false);
      setConfirmText('');
      toast.success(`Todos os ${productIds.length} produtos foram removidos!`);
    } catch (error) {
      console.error('Erro ao excluir todos os produtos:', error);
      toast.error('Erro ao excluir produtos');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasChanges = Object.keys(editingProducts).length > 0;
  const activeProducts = products.filter(p => p.stock && p.stock > 0).length;
  const lowStockProducts = products.filter(p => p.stock && p.stock <= 5 && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => !p.stock || p.stock === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Produtos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Em Estoque</p>
                <p className="text-2xl font-bold">{activeProducts}</p>
              </div>
              <Eye className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Estoque Baixo</p>
                <p className="text-2xl font-bold">{lowStockProducts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Sem Estoque</p>
                <p className="text-2xl font-bold">{outOfStockProducts}</p>
              </div>
              <EyeOff className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Principal */}
      <Card className="bg-white border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800 text-2xl font-bold flex items-center gap-3">
                <Package className="h-7 w-7 text-blue-600" />
                Gerenciamento Fácil de Produtos
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Gerencie preços, estoque e exclusões facilmente numa página só
              </CardDescription>
            </div>
            
            <div className="flex gap-3">
              {/* Botão Salvar Alterações */}
              <Button
                onClick={saveAllChanges}
                disabled={!hasChanges || isSavingChanges}
                className={`transition-all duration-200 ${
                  hasChanges 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSavingChanges ? 'Salvando...' : `Salvar ${Object.keys(editingProducts).length} Alterações`}
              </Button>

              {/* Botão Excluir Todos */}
              <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Todos
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-5 h-5" />
                      Confirmar Exclusão de Todos os Produtos
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      <p className="text-gray-700">
                        <strong>ATENÇÃO:</strong> Esta ação irá remover permanentemente <strong>TODOS os {products.length} produtos</strong> cadastrados no sistema.
                      </p>
                      <p className="text-red-600 font-medium">
                        Esta ação NÃO pode ser desfeita!
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-text" className="text-gray-700 font-medium">
                          Para confirmar, digite <strong>CONFIRMAR</strong> abaixo:
                        </Label>
                        <Input
                          id="confirm-text"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="Digite CONFIRMAR"
                          className="border-red-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmText('')}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllProducts}
                      disabled={confirmText !== 'CONFIRMAR' || isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? 'Excluindo...' : 'Excluir Todos os Produtos'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Barra de Busca */}
          <div className="relative mb-6">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar produtos por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Lista de Produtos */}
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhum produto encontrado</p>
                <p className="text-sm">Tente ajustar sua busca ou adicione novos produtos</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const editing = editingProducts[product.id];
                const hasProductChanges = !!editing;
                
                return (
                  <Card key={product.id} className={`border transition-all duration-200 ${
                    hasProductChanges ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Imagem e Nome */}
                        <div className="lg:col-span-4 flex items-center gap-3">
                          <img
                            src={product.image || '/placeholder.svg'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={product.stock && product.stock > 0 ? 'default' : 'destructive'} className="text-xs">
                                {product.stock && product.stock > 0 ? `${product.stock} em estoque` : 'Sem estoque'}
                              </Badge>
                              {product.uti_pro_enabled && (
                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                  UTI PRO
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Preço Atual */}
                        <div className="lg:col-span-2">
                          <Label className="text-xs text-gray-500 mb-1 block">Preço</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                            <Input
                              type="number"
                              step="0.01"
                              defaultValue={product.price}
                              onChange={(e) => handleProductEdit(product.id, 'price', e.target.value)}
                              className="pl-6 h-8 text-sm"
                            />
                          </div>
                        </div>

                        {/* Preço PRO */}
                        <div className="lg:col-span-2">
                          <Label className="text-xs text-gray-500 mb-1 block">Preço PRO</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                            <Input
                              type="number"
                              step="0.01"
                              defaultValue={product.pro_price || ''}
                              onChange={(e) => handleProductEdit(product.id, 'pro_price', e.target.value)}
                              className="pl-6 h-8 text-sm"
                              placeholder="Sem preço PRO"
                            />
                          </div>
                        </div>

                        {/* Estoque */}
                        <div className="lg:col-span-2">
                          <Label className="text-xs text-gray-500 mb-1 block">Estoque</Label>
                          <Input
                            type="number"
                            min="0"
                            defaultValue={product.stock || 0}
                            onChange={(e) => handleProductEdit(product.id, 'stock', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>

                        {/* Ações */}
                        <div className="lg:col-span-2 flex justify-end gap-2">
                          {hasProductChanges && (
                            <Button
                              onClick={() => saveProductChanges(product)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 h-8 px-3"
                            >
                              <Save className="w-3 h-3" />
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="h-8 px-3"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o produto <strong>"{product.name}"</strong>? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir Produto
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductEasyManager;