import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { ShoppingCart, Zap, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FavoriteButton from '@/components/FavoriteButton';
import { sendSingleProductToWhatsApp } from '@/utils/whatsapp';

interface ActionButtonsProps {
  product: Product;
  quantity: number;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  className?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  product,
  quantity,
  onAddToCart,
  onBuyNow,
  className
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'cart' | 'buy' | null>(null);

  const isOutOfStock = product.stock === 0;
  const totalPrice = product.price * quantity;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    setIsLoading(true);
    setLoadingAction('cart');
    
    try {
      await onAddToCart(product);
      // Feedback visual de sucesso
      setTimeout(() => {
        setIsLoading(false);
        setLoadingAction(null);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    
    setIsLoading(true);
    setLoadingAction('buy');
    
    try {
      if (onBuyNow) {
        await onBuyNow(product);
      } else {
        await onAddToCart(product);
        // Redirecionar para checkout
        window.location.href = '/checkout';
      }
    } catch (error) {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleWhatsAppContact = async () => {
    // Usar nova função para gerar código de verificação
    await sendSingleProductToWhatsApp(product, quantity, null, () => {
      // Track analytics
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Botão Comprar Agora - DESTAQUE PRINCIPAL */}
      <Button
        onClick={handleBuyNow}
        size="lg"
        disabled={isOutOfStock || isLoading}
        className={cn(
          "w-full font-bold text-lg h-12 rounded-lg shadow-lg transition-all duration-300",
          isOutOfStock
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl active:scale-[0.98]"
        )}
      >
        {isLoading && loadingAction === 'buy' ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processando...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            {isOutOfStock ? 'Esgotado' : 'Comprar agora'}
          </>
        )}
      </Button>

      {/* Botão Adicionar ao Carrinho */}
      <Button
        onClick={handleAddToCart}
        variant="outline"
        size="lg"
        disabled={isOutOfStock || isLoading}
        className={cn(
          "w-full font-semibold h-12 rounded-lg transition-all duration-300",
          isOutOfStock
            ? "border-gray-300 text-gray-500 cursor-not-allowed"
            : "border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 active:scale-[0.98]"
        )}
      >
        {isLoading && loadingAction === 'cart' ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adicionando...
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Adicionar ao carrinho
          </>
        )}
      </Button>

      {/* Botões Secundários */}
      <div className="flex gap-2">
        {/* Favoritos */}
        <div className="flex-1">
          <FavoriteButton 
            productId={product.id} 
            size="lg"
            className="w-full h-10"
          />
        </div>

        {/* WhatsApp */}
        <Button
          variant="outline"
          size="lg"
          onClick={handleWhatsAppContact}
          className="flex-1 h-10 border-green-500 text-green-600 hover:bg-green-50"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
      </div>

      {/* Informações do Total */}
      {quantity > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800 space-y-1">
            <div className="flex justify-between font-medium">
              <span>{quantity} unidades</span>
              <span>R$ {totalPrice.toFixed(2)}</span>
            </div>
            <div className="text-xs text-blue-600">
              Preço unitário: R$ {product.price.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Call-to-Action Adicional */}
      {!isOutOfStock && (
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-600">
            🔒 Compra 100% segura e protegida
          </div>
          <div className="text-xs text-gray-500">
            Processamento imediato • Entrega garantida
          </div>
        </div>
      )}

      {/* Produto Esgotado - Ações Alternativas */}
      {isOutOfStock && (
        <div className="space-y-2">
          <Button
            variant="outline"
            size="lg"
            className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            🔔 Avisar quando chegar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-blue-600 hover:bg-blue-50"
          >
            Ver produtos similares
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;

