import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import { Product } from '@/hooks/useProducts/types';
import { useProductPerformance } from '@/hooks/useProductPerformance';

interface VirtualizedProductListProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  height?: number;
  itemHeight?: number;
  onProductHover?: (productId: string) => void;
}

interface ProductItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onProductHover?: (productId: string) => void;
  };
}

const ProductItem: React.FC<ProductItemProps> = ({ index, style, data }) => {
  const { products, onEdit, onDelete, onProductHover } = data;
  const product = products[index];
  const performance = useProductPerformance();
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback(() => {
    if (onProductHover && product.id) {
      // Debounce hover events
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        onProductHover(product.id);
      }, 300);
    }
  }, [onProductHover, product.id]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (!product) {
    return (
      <div style={style} className="p-2">
        <Card className="bg-card/50 border-border animate-pulse">
          <CardContent className="p-4">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStockStatus = (stock: number | null) => {
    if (stock === null) return { label: 'N/A', color: 'bg-muted text-muted-foreground', icon: Package };
    if (stock === 0) return { label: 'Sem estoque', color: 'bg-destructive text-destructive-foreground', icon: Package };
    if (stock < 10) return { label: 'Estoque baixo', color: 'bg-warning text-warning-foreground', icon: Package };
    return { label: 'Em estoque', color: 'bg-success text-success-foreground', icon: Package };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <div style={style} className="p-2">
      <Card 
        className="bg-card border-border hover:bg-accent/50 transition-colors duration-200"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Product Image */}
            <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {product.description || 'Sem descrição'}
                  </p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      R$ {product.price?.toFixed(2) || '0.00'}
                    </Badge>
                    
                    <Badge className={`text-xs ${stockStatus.color}`}>
                      {stockStatus.label}
                    </Badge>

                    {product.is_featured && (
                      <Badge variant="secondary" className="text-xs">
                        Destaque
                      </Badge>
                    )}

                    {product.tags && product.tags.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {product.tags[0].name}
                        {product.tags.length > 1 && ` +${product.tags.length - 1}`}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/produto/${product.id}`, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const VirtualizedProductList: React.FC<VirtualizedProductListProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
  height = 600,
  itemHeight = 120,
  onProductHover
}) => {
  const performance = useProductPerformance();

  const itemData = useMemo(() => ({
    products,
    onEdit,
    onDelete,
    onProductHover
  }), [products, onEdit, onDelete, onProductHover]);

  const handleItemsRendered = useCallback(({ overscanStartIndex, overscanStopIndex, visibleStartIndex, visibleStopIndex }: any) => {
    console.log('[VirtualizedProductList] Rendered items:', {
      visible: `${visibleStartIndex}-${visibleStopIndex}`,
      overscan: `${overscanStartIndex}-${overscanStopIndex}`,
      total: products.length
    });
  }, [products.length]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="bg-card/50 border-border animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-muted rounded w-16"></div>
                    <div className="h-5 bg-muted rounded w-20"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-muted-foreground">
            Nenhum produto corresponde aos filtros selecionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <List
        height={height}
        width="100%"
        itemCount={products.length}
        itemSize={itemHeight}
        itemData={itemData}
        onItemsRendered={handleItemsRendered}
        overscanCount={5}
      >
        {ProductItem}
      </List>
    </div>
  );
};