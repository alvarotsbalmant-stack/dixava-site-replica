import React from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

interface ProductTitleProps {
  product: Product;
  className?: string;
}

const ProductTitle: React.FC<ProductTitleProps> = ({ 
  product, 
  className 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 className="text-2xl font-bold text-gray-900 leading-tight">
        {product.name}
      </h1>
      
      {/* Informações adicionais do produto */}
      {product.brand && (
        <div className="text-sm text-gray-600">
          Marca: <span className="font-medium">{product.brand}</span>
        </div>
      )}
      
      {/* SKU/Código do produto */}
      <div className="text-xs text-gray-500">
        Código: {product.id.slice(0, 8)}
      </div>
    </div>
  );
};

export default ProductTitle;

