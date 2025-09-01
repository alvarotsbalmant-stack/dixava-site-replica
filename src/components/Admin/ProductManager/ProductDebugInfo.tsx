import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/badge';

interface ProductDebugInfoProps {
  products: Product[];
  loading: boolean;
}

export const ProductDebugInfo: React.FC<ProductDebugInfoProps> = ({ products, loading }) => {
  const productTypes = products.reduce((acc, product) => {
    const type = product.product_type || 'simple';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const adminProducts = products.filter(p => p.product_type === 'master');
  const activeProducts = products.filter(p => p.is_active !== false);
  const featuredProducts = products.filter(p => p.is_featured);

  return (
    <Card className="bg-gray-900 border-gray-700 mb-4">
      <CardHeader>
        <CardTitle className="text-sm text-blue-400">Debug: Product Loading Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-gray-400">Total:</span>
            <span className="ml-1 text-white font-bold">{products.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Active:</span>
            <span className="ml-1 text-green-400 font-bold">{activeProducts.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Featured:</span>
            <span className="ml-1 text-yellow-400 font-bold">{featuredProducts.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Admin/Master:</span>
            <span className="ml-1 text-purple-400 font-bold">{adminProducts.length}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs text-gray-400">Product Types:</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(productTypes).map(([type, count]) => (
              <Badge 
                key={type} 
                variant="outline" 
                className="text-xs border-gray-600 text-gray-300"
              >
                {type}: {count}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-xs">
          <span className="text-gray-400">Status:</span>
          <span className={`ml-1 font-bold ${loading ? 'text-yellow-400' : 'text-green-400'}`}>
            {loading ? 'Loading...' : 'Loaded'}
          </span>
          <span className="ml-2 text-gray-500">
            {new Date().toLocaleTimeString()}
          </span>
        </div>

        {products.length > 0 && (
          <div className="text-xs">
            <span className="text-gray-400">Sample IDs:</span>
            <span className="ml-1 text-gray-300">
              {products.slice(0, 3).map(p => p.id.slice(0, 8)).join(', ')}...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};