import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Package, TrendingUp, AlertCircle, Eye } from 'lucide-react';
import { useProductsAdmin } from '@/hooks/useProductsEnhanced';
import { useTags } from '@/hooks/useTags';
import ProductList from './ProductManager/ProductListNew';
import ProductEditor from './ProductEditor/ProductEditor';
import { Product } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';

const ProductManager = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProductsAdmin();
  const { tags } = useTags();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || product.tags?.some(tag => tag.id === selectedTag);
    return matchesSearch && matchesTag;
  });

  // Estatísticas dos produtos
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.stock && p.stock > 0).length;
  const lowStockProducts = products.filter(p => p.stock && p.stock <= 5 && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => !p.stock || p.stock === 0).length;

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
      let savedProduct;
      if (editingProduct) {
        savedProduct = await updateProduct(editingProduct.id, productData);
      } else {
        savedProduct = await addProduct(productData);
        
        // If there are local specifications to save after product creation
        if (productData.localSpecifications && productData.localSpecifications.length > 0) {
          // Import supabase client to save specs
          const { supabase } = await import('@/integrations/supabase/client');
          
          for (const spec of productData.localSpecifications) {
            await supabase
              .from('product_specifications')
              .insert({
                product_id: savedProduct.id,
                category: spec.category,
                label: spec.label,
                value: spec.value,
                highlight: spec.highlight,
                order_index: spec.order_index
              });
          }
        }

        // If there are local FAQs to save after product creation
        if (productData.localFAQs && productData.localFAQs.length > 0) {
          const { supabase } = await import('@/integrations/supabase/client');
          
          for (const faq of productData.localFAQs) {
            await supabase
              .from('product_faqs')
              .insert({
                product_id: savedProduct.id,
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                active: faq.is_visible,
                order_index: faq.order,
                helpful_count: 0,
                tags: []
              });
          }
        }
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
      <ProductEditor
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

  return (
    <div className="space-y-8">
      {/* Header com estatísticas aprimoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Produtos</p>
                <p className="text-3xl font-bold">{totalProducts}</p>
                <p className="text-blue-100 text-xs mt-1">Catálogo completo</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Package className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Em Estoque</p>
                <p className="text-3xl font-bold">{activeProducts}</p>
                <p className="text-green-100 text-xs mt-1">Produtos disponíveis</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Estoque Baixo</p>
                <p className="text-3xl font-bold">{lowStockProducts}</p>
                <p className="text-yellow-100 text-xs mt-1">≤ 5 unidades</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <AlertCircle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Sem Estoque</p>
                <p className="text-3xl font-bold">{outOfStockProducts}</p>
                <p className="text-red-100 text-xs mt-1">Requer reposição</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Package className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card principal com design moderno */}
      <Card className="bg-white border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800 text-2xl font-bold flex items-center gap-3">
                <Package className="h-7 w-7 text-blue-600" />
                Gerenciamento de Produtos
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Gerencie o catálogo completo de produtos da loja UTI Gamer Shop
              </CardDescription>
            </div>
            <Button 
              onClick={handleCreateProduct} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Filtros e Busca com design aprimorado */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar produtos por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                />
              </div>
              
              <div className="w-full lg:w-80">
                <div className="relative">
                  <Filter className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-lg text-gray-800 focus:border-blue-500 focus:ring-blue-500 shadow-sm appearance-none"
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
            </div>

            {/* Filtros ativos com design melhorado */}
            {(searchTerm || selectedTag) && (
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Filtros ativos:</span>
                {searchTerm && (
                  <Badge 
                    variant="secondary" 
                    className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-colors"
                  >
                    <Search className="w-3 h-3 mr-1" />
                    "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 hover:text-blue-900 font-bold"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedTag && (
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors"
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    {tags.find(tag => tag.id === selectedTag)?.name}
                    <button
                      onClick={() => setSelectedTag('')}
                      className="ml-2 hover:text-green-900 font-bold"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Informações de resultados */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Eye className="w-4 h-4" />
              <span className="text-sm">
                Exibindo {filteredProducts.length} de {totalProducts} produtos
              </span>
            </div>
            
            {filteredProducts.length !== totalProducts && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag('');
                }}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Limpar filtros
              </Button>
            )}
          </div>

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

