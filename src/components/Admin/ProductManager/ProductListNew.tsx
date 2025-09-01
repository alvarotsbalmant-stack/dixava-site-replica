import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Package, Star, AlertTriangle, CheckCircle, Eye, ShoppingCart } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { ProductTagDisplay } from './ProductTagDisplay';
import { Badge } from '@/components/ui/badge';

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
      <div className="text-center py-16">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
        <p className="text-gray-500 text-lg">Carregando produtos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Nenhum produto encontrado</h3>
        <p className="text-gray-500 mb-6">Comece criando seu primeiro produto ou ajuste os filtros de busca</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Atualizar lista
        </Button>
      </div>
    );
  }

  const getStockStatus = (stock: number | undefined) => {
    if (!stock || stock === 0) {
      return { 
        label: 'Sem estoque', 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: AlertTriangle 
      };
    }
    if (stock <= 5) {
      return { 
        label: 'Estoque baixo', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: AlertTriangle 
      };
    }
    return { 
      label: 'Em estoque', 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle 
    };
  };

  return (
    <div className="grid gap-6">
      {products.map((product) => {
        const stockStatus = getStockStatus(product.stock);
        const StatusIcon = stockStatus.icon;
        
        return (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg"
          >
            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* Imagem do produto */}
                <div className="flex-shrink-0">
                  {product.image ? (
                    <div className="relative group">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Informações do produto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Status do estoque */}
                    <Badge className={`${stockStatus.color} border flex items-center gap-1 ml-4`}>
                      <StatusIcon className="w-3 h-3" />
                      {stockStatus.label}
                    </Badge>
                  </div>
                  
                  {/* Preço e estoque */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Estoque: {product.stock || 0} unidades
                      </span>
                    </div>
                  </div>
                  
                  {/* Variações e categorias */}
                  <div className="space-y-3">
                    {/* Tamanhos */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 min-w-[80px]">Tamanhos:</span>
                        <div className="flex gap-2 flex-wrap">
                          {product.sizes.map((size, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full border"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Cores */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 min-w-[80px]">Cores:</span>
                        <div className="flex gap-2 flex-wrap">
                          {product.colors.map((color, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Categorias */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 min-w-[80px]">Categorias:</span>
                      <ProductTagDisplay tags={product.tags || []} />
                    </div>
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex flex-col gap-3 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(product.id)}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;

