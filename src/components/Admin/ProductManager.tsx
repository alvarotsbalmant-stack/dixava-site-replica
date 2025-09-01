
import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Package, Zap, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProducts } from '@/hooks/useProducts';
import { useTags } from '@/hooks/useTags';
import ProductList from './ProductManager/ProductList';
import ProductForm from './ProductManager/ProductForm';
import { Product } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';
import { ProductDebugInfo } from './ProductManager/ProductDebugInfo';
import { ProductDataValidator } from './ProductDataValidator';

// DISABLED: Optimized version disabled to ensure ALL products are visible
// const ProductManagerOptimized = React.lazy(() => import('./ProductManager/ProductManagerOptimized'));

const ProductManager = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct, fetchSingleProduct } = useProducts();
  const { tags } = useTags();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // DISABLED: useOptimizedView removed to force standard view that shows ALL products

  // Auto-switching to optimized view DISABLED - always show all products
  useEffect(() => {
    console.log('[ProductManager] Auto-switching disabled - showing all products', products.length);
  }, [products.length]);

  // Detectar se deve abrir diretamente na edição via URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editProductId = urlParams.get('edit_product');
    
    if (editProductId && products.length > 0) {
      const productToEdit = products.find(p => p.id === editProductId);
      console.log('ProductManager: URL param edit_product found:', editProductId);
      console.log('ProductManager: Product to edit found:', productToEdit);
      console.log('ProductManager: Product specifications:', productToEdit?.specifications);
      console.log('ProductManager: Product meta_title:', productToEdit?.meta_title);
      console.log('ProductManager: Product meta_description:', productToEdit?.meta_description);
      console.log('ProductManager: Product slug:', productToEdit?.slug);
      
      if (productToEdit) {
        setEditingProduct(productToEdit);
        setShowForm(true);
        // Limpar o parâmetro da URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('edit_product');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [products]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || product.tags?.some(tag => tag.id === selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSubmit = async (productData: any) => {
    try {
      console.log('ProductManager: handleFormSubmit called');
      console.log('ProductManager: editingProduct:', editingProduct);
      console.log('ProductManager: productData received:', productData);
      console.log('ProductManager: productData.specifications:', productData.specifications);
      console.log('ProductManager: productData.meta_title:', productData.meta_title);
      console.log('ProductManager: productData.meta_description:', productData.meta_description);
      console.log('ProductManager: productData.slug:', productData.slug);
      
      if (editingProduct) {
        console.log('ProductManager: Updating product with ID:', editingProduct.id);
        await updateProduct(editingProduct.id, productData);
        
        // Verificar se foi salvo corretamente
        console.log('ProductManager: Product updated, verifying...');
        const updatedProduct = await fetchSingleProduct(editingProduct.id);
        console.log('ProductManager: Updated product from DB:', updatedProduct);
        console.log('ProductManager: Updated product specifications:', updatedProduct?.specifications);
        console.log('ProductManager: Updated product meta_title:', updatedProduct?.meta_title);
        console.log('ProductManager: Updated product meta_description:', updatedProduct?.meta_description);
        console.log('ProductManager: Updated product slug:', updatedProduct?.slug);
      } else {
        console.log('ProductManager: Creating new product');
        await addProduct(productData);
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  };

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        tags={tags}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  // Force standard view - optimized view disabled
  if (false) {
    return null; // Never render optimized view
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <ProductDebugInfo products={products} loading={loading} />
      
      {/* Validador de Dados */}
      <ProductDataValidator />
      
      {/* Performance Alert - Disabled, showing all products */}
      {products.length > 200 && (
        <Alert className="border-blue-500">
          <Package className="h-4 w-4" />
          <AlertDescription>
            <span>
              Exibindo TODOS os {products.length} produtos. 
              Optimizações desabilitadas para garantir visibilidade completa.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#2C2C44] border-[#343A40]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#007BFF] bg-opacity-20 rounded-lg">
                <Package className="h-6 w-6 text-[#007BFF]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total de Produtos</p>
                <p className="text-2xl font-bold text-white">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#2C2C44] border-[#343A40]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#28A745] bg-opacity-20 rounded-lg">
                <Filter className="h-6 w-6 text-[#28A745]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Produtos Filtrados</p>
                <p className="text-2xl font-bold text-white">{filteredProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2C2C44] border-[#343A40]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FFC107] bg-opacity-20 rounded-lg">
                <Search className="h-6 w-6 text-[#FFC107]" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Categorias</p>
                <p className="text-2xl font-bold text-white">{tags.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card principal */}
      <Card className="bg-[#2C2C44] border-[#343A40]">
        <CardHeader className="border-b border-[#343A40]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">Gerenciamento de Produtos</CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie o catálogo de produtos da loja ({products.length} produtos)
              </CardDescription>
            </div>
            <Button 
              onClick={handleCreateProduct} 
              className="bg-[#007BFF] hover:bg-[#0056B3] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#343A40] border-[#6C757D] text-white placeholder-gray-400 focus:border-[#007BFF]"
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 bg-[#343A40] border border-[#6C757D] rounded-md text-white focus:border-[#007BFF] focus:outline-none"
              >
                <option value="">Todas as categorias</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtros ativos */}
          {(searchTerm || selectedTag) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchTerm && (
                <Badge 
                  variant="secondary" 
                  className="bg-[#007BFF] bg-opacity-20 text-[#007BFF] border-[#007BFF]"
                >
                  Busca: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedTag && (
                <Badge 
                  variant="secondary" 
                  className="bg-[#28A745] bg-opacity-20 text-[#28A745] border-[#28A745]"
                >
                  Categoria: {tags.find(tag => tag.id === selectedTag)?.name}
                  <button
                    onClick={() => setSelectedTag('')}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Lista de Produtos */}
          <ProductList
            products={filteredProducts}
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManager;
