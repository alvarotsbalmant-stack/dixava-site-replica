import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Package, TrendingUp, AlertCircle, Eye, Users, Zap } from 'lucide-react';
import { useProductsPaginated } from '@/hooks/useProductsPaginated';
import { useTags } from '@/hooks/useTags';
import ProductListVirtualized from './ProductListVirtualized';
import ProductEditor from '../ProductEditor/ProductEditor';
import { Product } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';
import { useDebouncedCallback } from '@/hooks/useDebounce';

const ProductManagerOptimized = () => {
  const {
    products,
    totalProducts,
    displayedProducts,
    loading,
    showLoadAll,
    isShowingAll,
    filters,
    hasActiveFilters,
    setSearch,
    setTagFilter,
    loadAllProducts,
    clearFilters,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProductsPaginated();

  const { tags } = useTags();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Debounce search input to improve performance
  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  // Memoized statistics to avoid recalculation
  const statistics = useMemo(() => {
    const allProducts = products; // Use all displayed products for stats
    return {
      total: totalProducts,
      active: allProducts.filter(p => p.stock && p.stock > 0).length,
      lowStock: allProducts.filter(p => p.stock && p.stock <= 5 && p.stock > 0).length,
      outOfStock: allProducts.filter(p => !p.stock || p.stock === 0).length
    };
  }, [products, totalProducts]);

  const handleCreateProduct = useCallback(() => {
    setEditingProduct(null);
    setShowForm(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  }, []);

  const handleFormSubmit = useCallback(async (productData: any) => {
    try {
      let savedProduct;
      if (editingProduct) {
        savedProduct = await updateProduct(editingProduct.id, productData);
      } else {
        savedProduct = await addProduct(productData);
        
        // Handle specifications and FAQs as before
        if (productData.localSpecifications && productData.localSpecifications.length > 0) {
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
  }, [editingProduct, addProduct, updateProduct]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  }, [deleteProduct]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(e.target.value);
  }, [debouncedSetSearch]);

  const handleTagChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setTagFilter(e.target.value);
  }, [setTagFilter]);

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
      {/* Performance Indicator */}
      {displayedProducts > 100 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">
                Modo de Alto Desempenho Ativo - Exibindo {displayedProducts} produtos com virtualização
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Produtos</p>
                <p className="text-3xl font-bold">{statistics.total}</p>
                <p className="text-blue-100 text-xs mt-1">
                  {isShowingAll ? 'Todos exibidos' : `${displayedProducts} exibidos`}
                </p>
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
                <p className="text-3xl font-bold">{statistics.active}</p>
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
                <p className="text-3xl font-bold">{statistics.lowStock}</p>
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
                <p className="text-3xl font-bold">{statistics.outOfStock}</p>
                <p className="text-red-100 text-xs mt-1">Requer reposição</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Package className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="bg-background border shadow-lg">
        <CardHeader className="bg-muted/50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-2xl font-bold flex items-center gap-3">
                <Package className="h-7 w-7 text-primary" />
                Gerenciamento de Produtos
              </CardTitle>
              <CardDescription className="mt-2">
                Gerencie o catálogo completo de produtos com performance otimizada
              </CardDescription>
            </div>
            <Button 
              onClick={handleCreateProduct} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Produto
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Filters */}
          <div className="bg-muted/30 rounded-xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos por nome, descrição ou marca..."
                  defaultValue={filters.search}
                  onChange={handleSearchChange}
                  className="pl-12 h-12 bg-background border focus:border-primary focus:ring-primary shadow-sm"
                />
              </div>
              
              <div className="w-full lg:w-80">
                <div className="relative">
                  <Filter className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={filters.tagId}
                    onChange={handleTagChange}
                    className="w-full h-12 pl-12 pr-4 bg-background border rounded-lg focus:border-primary focus:ring-primary shadow-sm appearance-none"
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

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                <span className="text-sm font-medium text-muted-foreground">Filtros ativos:</span>
                {filters.search && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Search className="w-3 h-3 mr-1" />
                    "{filters.search}"
                  </Badge>
                )}
                {filters.tagId && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Filter className="w-3 h-3 mr-1" />
                    {tags.find(tag => tag.id === filters.tagId)?.name}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                Exibindo {displayedProducts} de {totalProducts} produtos
                {hasActiveFilters && (
                  <span className="text-primary font-medium ml-1">
                    (filtrado)
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex gap-3">
              {showLoadAll && (
                <Button
                  onClick={loadAllProducts}
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary hover:bg-primary/10"
                >
                  Carregar Todos ({totalProducts - displayedProducts} restantes)
                </Button>
              )}
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground border-border hover:bg-muted"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Product List */}
          <ProductListVirtualized
            products={products}
            loading={loading}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            height={Math.min(800, Math.max(400, products.length * 180))}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagerOptimized;