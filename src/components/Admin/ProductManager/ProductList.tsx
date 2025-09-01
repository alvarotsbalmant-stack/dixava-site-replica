
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Package, Eye } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { ProductTagDisplay } from './ProductTagDisplay';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando produtos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Nenhum produto encontrado</h3>
        <p className="text-gray-400">Comece criando seu primeiro produto</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-gray-700 rounded-lg p-6 border border-gray-600"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                  />
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-red-400 font-bold text-lg">
                      R$ {product.price.toFixed(2)}
                    </span>
                    
                    <span className="text-gray-400 text-sm">
                      Estoque: {product.stock || 0}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Tamanhos:</span>
                        <div className="flex gap-1">
                          {product.sizes.map((size, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Cores:</span>
                        <div className="flex gap-1">
                          {product.colors.map((color, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Categorias:</span>
                      <ProductTagDisplay tags={product.tags || []} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/produto/${product.id}`, '_blank')}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                title="Ver página premium do produto"
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                className="border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(product.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
