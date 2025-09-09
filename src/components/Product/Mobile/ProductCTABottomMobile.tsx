import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { formatPrice } from '@/utils/formatPrice';
import { ShoppingCart, MessageCircle, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendSingleProductToWhatsApp } from '@/utils/whatsapp';

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

  const handleWhatsApp = async () => {
    // Usar nova função para gerar código de verificação
    await sendSingleProductToWhatsApp(product, 1, null, () => {
      // Track analytics
    });
  };

  // Nova função para "Comprar agora" - mesma lógica do desktop
  const handleBuyNow = async () => {
    // Usar nova função para gerar código de verificação - MESMA LÓGICA DO DESKTOP
    await sendSingleProductToWhatsApp(product, quantity, null, () => {
      // Track analytics
    });
  };

  const handleAddToCart = () => {
    // Chamar onAddToCart apenas uma vez, não em loop
    // O sistema já deve lidar com a quantidade internamente
    onAddToCart(product);
    setIsExpanded(false);
  };

  return (
    <>
      {/* Backdrop - Melhor Transição */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* CTA Bottom - Design Melhorado */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl">
        {/* Expanded Section - Melhor Layout */}
        {isExpanded && (
          <div className="bg-gray-50 border-b border-gray-200 animate-in slide-in-from-bottom duration-300">
            <div className="p-6 space-y-6">
              {/* Header com Close */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Finalizar Compra
                </h3>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Summary - Melhor Design */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-contain bg-gray-50 rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                      {product.name}
                    </h4>
                    <div className="text-lg font-bold text-red-600">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Selector - Melhor Design */}
              <div className="space-y-3">
                <label className="text-lg font-semibold text-gray-900">
                  Quantidade
                </label>
                <div className="flex items-center justify-center">
                  <div className="flex items-center border-2 border-gray-300 rounded-xl bg-white shadow-sm">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-14 h-14 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-xl transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="w-20 text-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {quantity}
                      </span>
                    </div>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-14 h-14 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-xl transition-colors"
                      disabled={quantity >= 10}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600">
                  Máximo: 10 unidades por compra
                </div>
              </div>

              {/* Total - Destaque Melhorado */}
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="text-center space-y-2">
                  <div className="text-sm text-gray-600">
                    Total: {quantity} {quantity === 1 ? 'item' : 'itens'}
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    {formatPrice(product.price * quantity)}
                  </div>
                  {quantity > 1 && (
                    <div className="text-sm text-gray-600">
                      {formatPrice(product.price)} × {quantity}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Melhor Espaçamento */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleAddToCart}
                  className="h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Adicionar
                </Button>
                
                <Button
                  onClick={handleBuyNow}
                  className="h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                  disabled={product.stock === 0}
                >
                  ⚡ Comprar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main CTA Bar - Design Melhorado */}
        <div className="p-4 bg-white">
          <div className="flex items-center gap-4">
            {/* Product Summary - Mais Compacto */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-contain bg-gray-50 rounded-lg flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate leading-tight">
                    {product.name}
                  </div>
                  <div className="text-lg font-bold text-red-600 mt-0.5">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Melhor Design */}
            <div className="flex items-center gap-3">
              {/* WhatsApp Button - Melhor Design */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleWhatsApp}
                className="w-12 h-12 p-0 border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>

              {/* Main CTA Button - Melhor Design */}
              <div className="relative">
                {quantity > 1 && (
                  <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-lg">
                    {quantity}
                  </div>
                )}
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 h-12 rounded-xl font-bold shadow-lg transition-all duration-200 hover:shadow-xl"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock === 0 ? 'Esgotado' : 'Comprar'}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Info - Melhor Espaçamento */}
          {!isExpanded && (
            <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Em estoque</span>
              </div>
              <div className="text-xs text-gray-600">
                Frete grátis acima de R$ 150
              </div>
              <div className="text-xs text-gray-600">
                Entrega 2-5 dias
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer - Altura Dinâmica */}
      <div className={`${isExpanded ? 'h-96' : 'h-24'} transition-all duration-300`} />
    </>
  );
};

export default ProductCTABottomMobile;

