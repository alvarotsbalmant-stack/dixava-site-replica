import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { Minus, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  className?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  product,
  quantity,
  onQuantityChange,
  className
}) => {
  const maxQuantity = product.stock || 99;
  const isOutOfStock = maxQuantity === 0;

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const getStockStatus = () => {
    if (isOutOfStock) return { color: 'text-red-600', text: 'Esgotado' };
    if (maxQuantity <= 5) return { color: 'text-orange-600', text: `Últimas ${maxQuantity} unidades` };
    if (maxQuantity <= 10) return { color: 'text-yellow-600', text: 'Estoque baixo' };
    return { color: 'text-green-600', text: 'Em estoque' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Status do Estoque */}
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-900">Estoque:</span>
        <span className={cn("text-sm font-medium", stockStatus.color)}>
          {stockStatus.text}
        </span>
      </div>

      {/* Seletor de Quantidade */}
      {!isOutOfStock && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">Quantidade:</span>
            
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecrease}
                disabled={quantity <= 1}
                className="h-10 w-10 p-0 hover:bg-gray-100 disabled:opacity-50"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="h-10 w-16 flex items-center justify-center border-x border-gray-300 bg-white">
                <span className="font-medium text-gray-900">{quantity}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleIncrease}
                disabled={quantity >= maxQuantity}
                className="h-10 w-10 p-0 hover:bg-gray-100 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Informações de Estoque */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>
              {maxQuantity > 50 ? (
                `+${maxQuantity} unidades disponíveis`
              ) : (
                `${maxQuantity} unidades disponíveis`
              )}
            </div>
            
            {quantity > 1 && (
              <div className="text-blue-600">
                💡 Comprando {quantity} unidades = R$ {(product.price * quantity).toFixed(2)}
              </div>
            )}
          </div>

          {/* Desconto por Quantidade */}
          {quantity >= 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm font-medium text-yellow-800 mb-1">
                🎉 Desconto por quantidade!
              </div>
              <div className="text-xs text-yellow-700">
                Comprando 3+ unidades: 5% de desconto adicional
              </div>
            </div>
          )}

          {/* Compra em Atacado */}
          {quantity >= 10 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="text-sm font-medium text-purple-800 mb-1">
                🏢 Compra em atacado
              </div>
              <div className="text-xs text-purple-700">
                Entre em contato para preços especiais
              </div>
              <button className="text-xs text-purple-600 hover:underline mt-1">
                Falar com vendedor
              </button>
            </div>
          )}
        </div>
      )}

      {/* Produto Esgotado */}
      {isOutOfStock && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm font-medium text-red-800 mb-2">
            😔 Produto temporariamente esgotado
          </div>
          <div className="space-y-2">
            <button className="w-full text-sm bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 transition-colors">
              Avisar quando chegar
            </button>
            <button className="w-full text-sm text-red-600 hover:underline">
              Ver produtos similares
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantitySelector;

