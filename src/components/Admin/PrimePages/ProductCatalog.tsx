import React, { useState, useMemo } from 'react';
import { Search, Filter, Check, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';

interface ProductCatalogProps {
  selectedProducts: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ 
  selectedProducts, 
  onSelectionChange 
}) => {
  const { products, loading } = useProducts();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtros e busca
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Busca por nome
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por categoria
    if (filterCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, filterCategory, sortBy]);

  // Categorias únicas
  const categories = useMemo(() => {
    const cats = products
      .map(p => p.category)
      .filter(Boolean)
      .filter((cat, index, arr) => arr.indexOf(cat) === index);
    return cats;
  }, [products]);

  const handleToggleProduct = (productId: string) => {
    const newSelection = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = filteredProducts.map(p => p.id);
    const hasAllSelected = allIds.every(id => selectedProducts.includes(id));
    
    if (hasAllSelected) {
      // Deselecionar todos os filtrados
      const newSelection = selectedProducts.filter(id => !allIds.includes(id));
      onSelectionChange(newSelection);
    } else {
      // Selecionar todos os filtrados
      const newSelection = [...new Set([...selectedProducts, ...allIds])];
      onSelectionChange(newSelection);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Carregando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category || ''}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="price_asc">Menor Preço</SelectItem>
            <SelectItem value="price_desc">Maior Preço</SelectItem>
            <SelectItem value="newest">Mais Recentes</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border rounded">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Estatísticas e Controles */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-muted-foreground">
            {filteredProducts.length} produtos encontrados
          </span>
          {selectedProducts.length > 0 && (
            <Badge variant="secondary">
              {selectedProducts.length} selecionados
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          disabled={filteredProducts.length === 0}
        >
          {filteredProducts.every(p => selectedProducts.includes(p.id)) ? 'Desmarcar Todos' : 'Selecionar Todos'}
        </Button>
      </div>

      {/* Lista de Produtos */}
      <div className="max-h-96 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            {filteredProducts.map((product) => {
              const isSelected = selectedProducts.includes(product.id);
              
              return (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleToggleProduct(product.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}} // Handled by card click
                        className="mt-1"
                      />
                      
                      {viewMode === 'grid' ? (
                        <div className="flex-1 min-w-0">
                          <div className="w-full h-16 bg-muted rounded mb-2 flex items-center justify-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">Sem imagem</span>
                            )}
                          </div>
                          <h4 className="text-xs font-medium line-clamp-2 mb-1">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {product.price ? `R$ ${product.price.toFixed(2)}` : 'Preço não informado'}
                          </p>
                          {product.category && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0 flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{product.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {product.price ? `R$ ${product.price.toFixed(2)}` : 'Preço não informado'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {product.category && (
                                <Badge variant="outline" className="text-xs">
                                  {product.category}
                                </Badge>
                              )}
                              {product.stock !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  Estoque: {product.stock}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;