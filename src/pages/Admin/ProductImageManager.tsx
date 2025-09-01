import React, { useState } from 'react';
import { useProductsEnhanced } from '@/hooks/useProductsEnhanced';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useProductImageManager } from '@/hooks/useProductImageManager';
import { useLocalImageChanges } from '@/hooks/useLocalImageChanges';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, Link, Trash2, Star, Plus, AlertTriangle, Save, RotateCcw } from 'lucide-react';
import ProductImageCard from '@/components/Admin/ProductImageManager/ProductImageCard';
import ImageDropZone from '@/components/Admin/ProductImageManager/ImageDropZone';
import BulkImageUpload from '@/components/Admin/ProductImageManager/BulkImageUpload';

const ProductImageManager: React.FC = () => {
  const { products, loading, refreshProducts } = useProductsEnhanced();
  const { uploadImage, downloadAndUploadFromUrl, deleteImage, uploading } = useImageUpload();
  const { updateProductImage, removeProductImage, loading: imageLoading } = useProductImageManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [processingProducts, setProcessingProducts] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Hook para gerenciar mudanças locais
  const {
    productsWithChanges,
    pendingChanges,
    addLocalChange,
    removeLocalChange,
    clearAllChanges,
    hasChanges,
    changedProductsCount
  } = useLocalImageChanges(products);

  console.log('ProductImageManager: Renderizando com', products.length, 'produtos');

  const filteredProducts = productsWithChanges.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProcessingProduct = (productId: string) => {
    setProcessingProducts(prev => new Set([...prev, productId]));
  };

  const removeProcessingProduct = (productId: string) => {
    setProcessingProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  // Adicionar imagem localmente (não envia para servidor ainda)
  const handleImageDrop = async (productId: string, imageUrl: string, isMainImage: boolean = false) => {
    if (!imageUrl || !imageUrl.trim()) {
      toast.error('URL da imagem é obrigatória');
      return;
    }

    if (!productId) {
      toast.error('ID do produto não encontrado');
      return;
    }

    try {
      console.log('Adicionando imagem localmente:', { productId, imageUrl, isMainImage });
      
      addLocalChange(productId, imageUrl.trim(), isMainImage);
      toast.success(`Imagem ${isMainImage ? 'principal' : 'secundária'} adicionada localmente!`);
      
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
      toast.error('Erro ao adicionar imagem. Tente novamente.');
    }
  };

  // Remover imagem localmente (não envia para servidor ainda)
  const handleRemoveImage = async (productId: string, imageUrl: string, isMainImage: boolean = false) => {
    if (!productId || !imageUrl) {
      toast.error('Dados inválidos para remoção');
      return;
    }

    try {
      console.log('Removendo imagem localmente:', { productId, imageUrl, isMainImage });
      
      removeLocalChange(productId, imageUrl, isMainImage);
      toast.success('Imagem removida localmente!');
      
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast.error('Erro ao remover imagem. Tente novamente.');
    }
  };

  const handleFileUpload = async (files: FileList | null, productId?: string, isMainImage: boolean = false) => {
    if (!files || files.length === 0) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }

    if (!productId) {
      toast.error('ID do produto não encontrado');
      return;
    }

    addProcessingProduct(productId);

    try {
      console.log('Fazendo upload de arquivo:', { productId, isMainImage, filesCount: files.length });
      
      const file = files[0];
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Apenas arquivos de imagem são permitidos');
        return;
      }

      // Validar tamanho do arquivo (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB permitido');
        return;
      }
      
      const uploadedUrl = await uploadImage(file, 'products');
      
      if (uploadedUrl) {
        await handleImageDrop(productId, uploadedUrl, isMainImage);
      } else {
        toast.error('Falha no upload da imagem');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro no upload da imagem');
    } finally {
      removeProcessingProduct(productId);
    }
  };

  const handleUrlAdd = async (productId: string, url: string, isMainImage: boolean = false) => {
    if (!url || !url.trim()) {
      toast.error('URL é obrigatória');
      return;
    }

    // Validar se é uma URL válida
    try {
      new URL(url.trim());
    } catch {
      toast.error('URL inválida');
      return;
    }

    addProcessingProduct(productId);

    try {
      console.log('Baixando e convertendo imagem da URL:', url);
      
      // Baixar, converter e fazer upload da imagem
      const uploadedUrl = await downloadAndUploadFromUrl(url.trim(), 'products');
      
      if (uploadedUrl) {
        // Usar a URL do nosso storage em vez da URL original
        await handleImageDrop(productId, uploadedUrl, isMainImage);
      } else {
        toast.error('Falha ao processar imagem da URL');
      }
    } catch (error) {
      console.error('Erro ao processar URL:', error);
      toast.error('Erro ao processar imagem da URL');
    } finally {
      removeProcessingProduct(productId);
    }
  };

  // Salvar todas as mudanças no servidor
  const handleSaveAllChanges = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      console.log('Salvando mudanças:', pendingChanges);

      // Agrupar mudanças por produto
      const changesByProduct = pendingChanges.reduce((acc, change) => {
        if (!acc[change.productId]) {
          acc[change.productId] = [];
        }
        acc[change.productId].push(change);
        return acc;
      }, {} as Record<string, typeof pendingChanges>);

      // Processar cada produto
      for (const [productId, changes] of Object.entries(changesByProduct)) {
        addProcessingProduct(productId);
        
        try {
          // Processar mudanças em ordem
          for (const change of changes) {
            if (change.type === 'add') {
              await updateProductImage(productId, change.imageUrl, change.isMainImage);
            } else if (change.type === 'remove') {
              // Deletar imagem do storage se for nossa
              await deleteImage(change.imageUrl);
              // Remover do produto
              await removeProductImage(productId, change.imageUrl, change.isMainImage);
            }
          }
          successCount++;
        } catch (error) {
          console.error(`Erro ao processar produto ${productId}:`, error);
          errorCount++;
        } finally {
          removeProcessingProduct(productId);
        }
      }

      // Atualizar dados do servidor
      await refreshProducts();
      
      // Limpar mudanças locais
      clearAllChanges();

      if (errorCount === 0) {
        toast.success(`Todas as ${successCount} alterações foram salvas com sucesso!`);
      } else {
        toast.warning(`${successCount} produtos salvos, ${errorCount} com erro. Verifique o console.`);
      }

    } catch (error) {
      console.error('Erro ao salvar mudanças:', error);
      toast.error('Erro ao salvar mudanças. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Imagens</h1>
            <p className="text-gray-600 mt-1">
              URLs são baixadas e convertidas para WebP automaticamente
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setShowBulkUpload(!showBulkUpload)}
              variant="outline"
              disabled={uploading || imageLoading || isSaving}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload em Lote
            </Button>
            
            {selectedProducts.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedProducts.length} selecionados
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                >
                  Limpar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Save Panel */}
        {hasChanges && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <div>
                    <span className="text-blue-800 font-medium">
                      {changedProductsCount} produto{changedProductsCount !== 1 ? 's' : ''} com alterações ({pendingChanges.length} mudanças)
                    </span>
                    <p className="text-blue-600 text-sm">
                      As alterações estão salvas localmente. Clique em "Salvar Tudo" para enviar ao servidor.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllChanges}
                    disabled={isSaving}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Desfazer Tudo
                  </Button>
                  
                  <Button
                    onClick={handleSaveAllChanges}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Tudo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar produtos por nome ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Info */}
        {(processingProducts.size > 0 || imageLoading || isSaving) && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">
                  {isSaving ? 'Salvando alterações...' : 'Processando imagens...'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Upload */}
        {showBulkUpload && (
          <BulkImageUpload
            selectedProducts={selectedProducts}
            products={productsWithChanges}
            onClose={() => setShowBulkUpload(false)}
            onImageUpload={handleImageDrop}
          />
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductImageCard
                key={product.id}
                product={product}
                onImageDrop={handleImageDrop}
                onRemoveImage={handleRemoveImage}
                onFileUpload={handleFileUpload}
                onUrlAdd={handleUrlAdd}
                isSelected={selectedProducts.includes(product.id)}
                onToggleSelection={() => toggleProductSelection(product.id)}
                uploading={uploading || processingProducts.has(product.id) || imageLoading}
                hasLocalChanges={product.localChanges?.hasChanges || false}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              {searchTerm ? (
                <>
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum produto encontrado
                  </h3>
                  <p className="text-gray-600">
                    Tente ajustar sua pesquisa ou verifique se há produtos cadastrados.
                  </p>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum produto cadastrado
                  </h3>
                  <p className="text-gray-600">
                    Cadastre produtos primeiro para gerenciar suas imagens.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductImageManager;
