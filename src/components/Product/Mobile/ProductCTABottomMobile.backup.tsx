import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { formatPrice } from '@/utils/formatPrice';
import { ShoppingCart, MessageCircle, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCTABottomMobileProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCTABottomMobile: React.FC<ProductCTABottomMobileProps> = ({ 
  product, 
  onAddToCart 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleWhatsApp = () => {
    const message = `Olá! Quero comprar: ${product.name} - ${formatPrice(product.price)}`;
    const whatsappUrl = `https://wa.me/5527996882090?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* CTA Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        {/* Expanded Section */}
        {isExpanded && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-semibold text-gray-900">
                Quantidade
              </span>
              <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium text-gray-900">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg"
                  disabled={quantity >= 10}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                Total: {quantity} {quantity === 1 ? 'item' : 'itens'}
              </div>
              <div className="text-xl font-bold text-red-600">
                {formatPrice(product.price * quantity)}
              </div>
            </div>
          </div>
        )}

        {/* Main CTA Bar */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Product Summary */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-contain bg-gray-50 rounded-lg flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* WhatsApp Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsApp}
                className="border-green-500 text-green-600 hover:bg-green-50 p-2"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>

              {/* Add to Cart with Quantity */}
              <div className="flex items-center">
                {quantity > 1 && (
                  <div className="bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center -mr-2 z-10">
                    {quantity}
                  </div>
                )}
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.stock === 0 ? 'Esgotado' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          {isExpanded && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button
                onClick={handleAddToCart}
                className="bg-red-600 hover:bg-red-700 text-white h-12 font-semibold"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
              </Button>
              
              <Button
                onClick={() => {
                  handleAddToCart();
                  // Simular redirecionamento para checkout
                  window.location.href = '/checkout';
                }}
                variant="outline"
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 h-12 font-semibold"
                disabled={product.stock === 0}
              >
                Comprar Agora
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content overlap */}
      <div className={`${isExpanded ? 'h-32' : 'h-20'}`} />
    </>
  );
};

export default ProductCTABottomMobile;