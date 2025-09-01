import React, { useState } from 'react';
import { ArrowUpDown, Eye, ShoppingCart, TrendingUp, MessageCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProductAnalytics } from '@/hooks/useAnalyticsData';

interface ProductAnalyticsTableProps {
  products: ProductAnalytics[];
  loading: boolean;
  onRefresh: () => void;
}

type SortField = 'total_views' | 'total_add_to_cart' | 'total_purchases' | 'total_revenue' | 'avg_conversion_rate' | 'whatsapp_clicks';
type SortDirection = 'asc' | 'desc';

export const ProductAnalyticsTable: React.FC<ProductAnalyticsTableProps> = ({
  products,
  loading,
  onRefresh
}) => {
  const [sortField, setSortField] = useState<SortField>('total_revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 hover:bg-transparent"
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </Button>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Produtos</CardTitle>
          <CardDescription>Performance detalhada por produto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Produtos</CardTitle>
          <CardDescription>Performance detalhada por produto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum produto encontrado no período selecionado</p>
            <Button onClick={onRefresh} className="mt-4" variant="outline">
              Atualizar Dados
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Produtos</CardTitle>
        <CardDescription>
          Performance detalhada dos {products.length} principais produtos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>
                  <SortButton field="total_views">
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizações
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="total_add_to_cart">
                    <Plus className="h-4 w-4 mr-1" />
                    Carrinho
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="total_purchases">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Compras
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="total_revenue">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Receita
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="avg_conversion_rate">
                    Conversão
                  </SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="whatsapp_clicks">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
                  </SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product, index) => (
                <TableRow key={product.product_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {product.product_name || `Produto ${index + 1}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {product.product_id.slice(0, 8)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(product.total_views)}</span>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(product.total_add_to_cart)}</span>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(product.total_purchases)}</span>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatCurrency(product.total_revenue)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={product.avg_conversion_rate > 5 ? "default" : "secondary"}
                    >
                      {formatPercentage(product.avg_conversion_rate)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatNumber(product.whatsapp_clicks)}</span>
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {products.length} produtos ordenados por {
            sortField === 'total_views' ? 'visualizações' :
            sortField === 'total_add_to_cart' ? 'adições ao carrinho' :
            sortField === 'total_purchases' ? 'compras' :
            sortField === 'total_revenue' ? 'receita' :
            sortField === 'avg_conversion_rate' ? 'conversão' :
            'cliques no WhatsApp'
          } ({sortDirection === 'desc' ? 'maior para menor' : 'menor para maior'})
        </div>
      </CardContent>
    </Card>
  );
};