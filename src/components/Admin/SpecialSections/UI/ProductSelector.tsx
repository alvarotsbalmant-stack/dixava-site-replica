import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, Package, Tag, Grid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducts } from '@/hooks/useProducts';
import { useTags } from '@/hooks/useTags';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  tags?: string[];
  category?: string;
}

interface ProductSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  selectionType: 'manual' | 'by_tag' | 'by_category';
  maxSelection?: number;
  className?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedIds = [],
  onChange,
  selectionType = 'manual',
  maxSelection = 50,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { products, loading: productsLoading } = useProducts();
  const { tags, loading: tagsLoading } = useTags();

  // Filtrar produtos baseado no tipo de seleção
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(product => {
        const productName = typeof product.name === 'string' ? product.name : '';
        return productName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filtros específicos por tipo
    switch (selectionType) {
      case 'by_tag':
        if (selectedTags.length > 0) {
          filtered = filtered.filter(product =>
            product.tags?.some(tag => selectedTags.includes(typeof tag === 'string' ? tag : tag.id))
          );
        }
        break;
      case 'by_category':
        if (selectedCategory) {
          filtered = filtered.filter(product =>
            product.category === selectedCategory
          );
        }
        break;
    }

    return filtered;
  }, [products, searchTerm, selectionType, selectedTags, selectedCategory]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    if (!products) return [];
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return uniqueCategories;
  }, [products]);

  // Handlers
  const handleProductToggle = useCallback((productId: string) => {
    const isSelected = selectedIds.includes(productId);
    
    if (isSelected) {
      onChange(selectedIds.filter(id => id !== productId));
    } else {
      if (selectedIds.length >= maxSelection) {
        return; // Não adicionar se já atingiu o máximo
      }
      onChange([...selectedIds, productId]);
    }
  }, [selectedIds, onChange, maxSelection]);

  const handleTagToggle = useCallback((tagId: string) => {
    const isSelected = selectedTags.includes(tagId);
    
    if (isSelected) {
      setSelectedTags(prev => prev.filter(id => id !== tagId));
    } else {
      setSelectedTags(prev => [...prev, tagId]);
    }
  }, [selectedTags]);

  const handleSelectAll = useCallback(() => {
    const availableIds = filteredProducts
      .slice(0, maxSelection)
      .map(p => p.id);
    onChange(availableIds);
  }, [filteredProducts, maxSelection, onChange]);

  const handleClearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  // Renderizar produto
  const renderProduct = useCallback((product: Product) => {
    const isSelected = selectedIds.includes(product.id);
    const canSelect = !isSelected && selectedIds.length < maxSelection;

    return (
      <Card
        key={product.id}
        className={`cursor-pointer transition-all ${
          isSelected
            ? 'ring-2 ring-blue-500 bg-blue-50'
            : canSelect
            ? 'hover:shadow-md'
            : 'opacity-50 cursor-not-allowed'
        }`}
        onClick={() => canSelect || isSelected ? handleProductToggle(product.id) : undefined}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              disabled={!canSelect && !isSelected}
              className="pointer-events-none"
            />
            
            {product.image_url && (
              <img
                src={product.image_url}
                alt={typeof product.name === 'string' ? product.name : 'Product'}
                className="w-12 h-12 object-cover rounded"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {typeof product.name === 'string' ? product.name : `Produto ${product.id}`}
              </h4>
              <p className="text-sm text-gray-600">
                R$ {product.price.toFixed(2)}
              </p>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {product.tags.slice(0, 2).map((tag, index) => {
                    const tagName = typeof tag === 'string' ? tag : (tag as any)?.name || (tag as any)?.id || 'Tag';
                    return (
                      <Badge key={`${tagName}-${index}`} variant="secondary" className="text-xs">
                        {tagName}
                      </Badge>
                    );
                  })}
                  {product.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [selectedIds, maxSelection, handleProductToggle]);

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com informações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="text-sm font-medium">
            {selectedIds.length} de {maxSelection} produtos selecionados
          </span>
        </div>
        
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredProducts.length === 0}
            >
              Selecionar Todos
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
            >
              Limpar Seleção
            </Button>
          </div>
        )}
      </div>

      {/* Filtros por tipo de seleção */}
      <Tabs value={selectionType} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual" className="gap-2">
            <Package className="h-4 w-4" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="by_tag" className="gap-2">
            <Tag className="h-4 w-4" />
            Por Tags
          </TabsTrigger>
          <TabsTrigger value="by_category" className="gap-2">
            <Grid className="h-4 w-4" />
            Por Categoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </TabsContent>

        <TabsContent value="by_tag" className="space-y-4">
          {/* Seleção de tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags Selecionadas:</label>
            <div className="flex flex-wrap gap-2">
              {tags?.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                  {selectedTags.includes(tag.id) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Busca adicional */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos nas tags selecionadas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </TabsContent>

        <TabsContent value="by_category" className="space-y-4">
          {/* Seleção de categoria */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria:</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(
                    selectedCategory === category ? '' : category
                  )}
                >
                  {category}
                  {selectedCategory === category && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Busca adicional */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos na categoria selecionada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Lista de produtos */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {searchTerm || selectedTags.length > 0 || selectedCategory
                ? 'Nenhum produto encontrado com os filtros aplicados'
                : 'Nenhum produto disponível'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filteredProducts.map(product => renderProduct(product as unknown as Product))}
          </div>
        )}
      </div>

      {/* Produtos selecionados */}
      {selectedIds.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Produtos Selecionados:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedIds.map(id => {
              const product = products?.find(p => p.id === id);
              if (!product) return null;
              
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="gap-1"
                >
                  {typeof product.name === 'string' ? product.name : `Product ${id}`}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleProductToggle(id)}
                  />
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

