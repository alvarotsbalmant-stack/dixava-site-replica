import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Package, AlertCircle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTags } from '@/hooks/useTags';
import { VirtualizedProductList } from './VirtualizedProductList';
import { PerformanceIndicator } from './PerformanceIndicator';
import { useOptimizedProductsConsolidated } from '@/hooks/useOptimizedProductsConsolidated';
import ProductForm from './ProductForm';
import { Product } from '@/hooks/useProducts/types';

interface ProductFilters {
  search: string;
  category: string;
  featured?: boolean;
  priceRange?: [number, number];
}

const ProductManagerOptimized = () => {
  const { tags } = useTags();
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    featured: undefined
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [virtualizedView, setVirtualizedView] = useState(true);

  // Use the consolidated optimized hook
  const {
    data: products,
    isLoading,
    error,
    isEmpty,
    totalCount,
    hasMore,
    loadMore,
    refresh,
    prefetchProduct
  } = useOptimizedProductsConsolidated(filters, {
    enableVirtualization: virtualizedView,
    pageSize: virtualizedView ? 50 : 100,
    prefetchNext: true
  });

  // Handle URL parameters for direct editing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editProductId = urlParams.get('edit_product');
    
    if (editProductId && products.length > 0) {
      const productToEdit = products.find(p => p.id === editProductId);
      console.log('[ProductManagerOptimized] URL param edit_product found:', editProductId);
      
      if (productToEdit) {
        setEditingProduct(productToEdit);
        setShowForm(true);
        // Clear URL parameter
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('edit_product');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [products]);

  // Debounced search to improve performance
  const debouncedSearch = useMemo(() => {
    const timeoutRef = { current: null as NodeJS.Timeout | null };
    
    return (searchTerm: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
      }, 300);
    };
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  }, [debouncedSearch]);

  const handleCategoryChange = useCallback((category: string) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  const handleFeaturedToggle = useCallback(() => {
    setFilters(prev => ({ 
      ...prev, 
      featured: prev.featured === undefined ? true : prev.featured ? false : undefined 
    }));
  }, []);

  const handleCreateProduct = useCallback(() => {
    setEditingProduct(null);
    setShowForm(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  }, []);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        // Here you would call your delete API
        console.log('Deleting product:', productId);
        refresh(); // Refresh the list after deletion
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      }
    }
  }, [refresh]);

  const handleFormSubmit = useCallback(async (productData: any) => {
    try {
      console.log('[ProductManagerOptimized] Form submit:', {
        editing: !!editingProduct,
        productData
      });
      
      if (editingProduct) {
        // Update product API call would go here
        console.log('Updating product:', editingProduct.id);
      } else {
        // Create product API call would go here
        console.log('Creating new product');
      }
      
      setShowForm(false);
      setEditingProduct(null);
      refresh(); // Refresh the list
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  }, [editingProduct, refresh]);

  const handleProductHover = useCallback((productId: string) => {
    prefetchProduct(productId);
  }, [prefetchProduct]);

  // Clear filter functions
  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '' }));
  }, []);

  const clearCategory = useCallback(() => {
    setFilters(prev => ({ ...prev, category: '' }));
  }, []);

  const clearFeatured = useCallback(() => {
    setFilters(prev => ({ ...prev, featured: undefined }));
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.featured !== undefined) count++;
    return count;
  }, [filters]);

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

  return (
    <div className="space-y-6">
      {/* Performance Alert for Large Datasets */}
      {totalCount > 500 && (
        <Alert className="border-warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Grande volume de produtos detectado ({totalCount} produtos). 
            Modo de virtualização {virtualizedView ? 'ativado' : 'desativado'} para otimizar performance.
          </AlertDescription>
        </Alert>
      )}

      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold text-foreground">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <Filter className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Exibindo</p>
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <Search className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Filtros Ativos</p>
                <p className="text-2xl font-bold text-foreground">{activeFiltersCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Indicator */}
        <PerformanceIndicator 
          productCount={products.length}
          isLoading={isLoading}
        />
      </div>

      {/* Main Card */}
      <Card className="bg-card border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-xl flex items-center gap-2">
                {virtualizedView && <Zap className="w-5 h-5 text-primary" />}
                Gerenciamento de Produtos Otimizado
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Gerencie o catálogo de produtos com performance otimizada
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVirtualizedView(!virtualizedView)}
                className="text-xs"
              >
                {virtualizedView ? 'Desativar' : 'Ativar'} Virtualização
              </Button>
              <Button onClick={handleCreateProduct} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                onChange={handleSearchChange}
                className="pl-10 bg-background border-input text-foreground placeholder-muted-foreground focus:border-primary"
              />
            </div>
            
            <div className="w-full sm:w-64">
              <select
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Todas as categorias</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.name}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant={filters.featured === true ? "default" : "outline"}
              onClick={handleFeaturedToggle}
              className="w-full sm:w-auto"
            >
              Destaques
            </Button>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.search && (
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary">
                  Busca: "{filters.search}"
                  <button onClick={clearSearch} className="ml-2 hover:text-primary-foreground">×</button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="bg-success/20 text-success border-success">
                  Categoria: {filters.category}
                  <button onClick={clearCategory} className="ml-2 hover:text-success-foreground">×</button>
                </Badge>
              )}
              {filters.featured !== undefined && (
                <Badge variant="secondary" className="bg-warning/20 text-warning border-warning">
                  {filters.featured ? 'Apenas destaques' : 'Sem destaques'}
                  <button onClick={clearFeatured} className="ml-2 hover:text-warning-foreground">×</button>
                </Badge>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="mb-6 border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar produtos: {error.message}
                <Button variant="outline" size="sm" onClick={refresh} className="ml-2">
                  Tentar novamente
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Product List */}
          {virtualizedView ? (
            <VirtualizedProductList
              products={products}
              loading={isLoading}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onProductHover={handleProductHover}
              height={600}
              itemHeight={120}
            />
          ) : (
            <div className="space-y-4">
              {/* Fallback to regular list if virtualization is disabled */}
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Carregando produtos...</p>
                </div>
              )}
              
              {!isLoading && isEmpty && (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-muted-foreground">
                      {activeFiltersCount > 0 
                        ? 'Nenhum produto corresponde aos filtros selecionados.'
                        : 'Nenhum produto cadastrado ainda.'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !isLoading && (
            <div className="text-center mt-6">
              <Button onClick={loadMore} variant="outline">
                Carregar mais produtos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagerOptimized;