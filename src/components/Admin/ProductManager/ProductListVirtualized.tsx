import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Package, Eye } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { ProductTagDisplay } from './ProductTagDisplay';

interface ProductListVirtualizedProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  height?: number;
  itemHeight?: number;
}

interface ProductItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
  };
}

const ProductItem: React.FC<ProductItemProps> = ({ index, style, data }) => {
  const { products, onEdit, onDelete } = data;
  const product = products[index];

  if (!product) return null;

  return (
    <div style={style} className="px-4">
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              {product.image && (
                <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-primary font-bold text-lg">
                    R$ {product.price?.toFixed(2) || '0.00'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      Estoque:
                    </span>
                    <span className={`text-sm font-medium ${
                      (product.stock || 0) > 10 
                        ? 'text-green-600' 
                        : (product.stock || 0) > 0 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {product.stock || 0}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Tamanhos:</span>
                      <div className="flex gap-1 flex-wrap">
                        {product.sizes.slice(0, 5).map((size, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                          >
                            {size}
                          </span>
                        ))}
                        {product.sizes.length > 5 && (
                          <span className="text-xs text-muted-foreground">
                            +{product.sizes.length - 5} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Cores:</span>
                      <div className="flex gap-1 flex-wrap">
                        {product.colors.slice(0, 5).map((color, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                          >
                            {color}
                          </span>
                        ))}
                        {product.colors.length > 5 && (
                          <span className="text-xs text-muted-foreground">
                            +{product.colors.length - 5} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Categorias:</span>
                    <ProductTagDisplay tags={product.tags || []} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 ml-4 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/produto/${product.id}`, '_blank')}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              title="Ver página do produto"
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              className="hover:bg-secondary"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(product.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductListVirtualized: React.FC<ProductListVirtualizedProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
  height = 600,
  itemHeight = 180
}) => {
  const listRef = useRef<List>(null);

  const itemData = useMemo(() => ({
    products,
    onEdit,
    onDelete
  }), [products, onEdit, onDelete]);

  // Reset scroll position when products change significantly
  useEffect(() => {
    if (listRef.current && products.length > 0) {
      listRef.current.scrollToItem(0, 'start');
    }
  }, [products.length]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground">Comece criando seu primeiro produto ou ajuste os filtros</p>
      </div>
    );
  }

  // Use virtualization only for large lists
  if (products.length < 50) {
    return (
      <div className="space-y-4">
        {products.map((product, index) => (
          <ProductItem
            key={product.id}
            index={index}
            style={{}}
            data={itemData}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <List
        ref={listRef}
        height={height}
        width="100%"
        itemCount={products.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5}
        className="scrollbar-thin scrollbar-thumb-border scrollbar-track-background"
      >
        {ProductItem}
      </List>
    </div>
  );
};

export default ProductListVirtualized;