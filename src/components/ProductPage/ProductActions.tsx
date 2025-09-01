
import React from 'react';
import { ShoppingCart, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import FavoriteButton from '@/components/FavoriteButton';

interface ProductActionsProps {
  product: Product;
  quantity?: number;
  selectedCondition?: 'new' | 'pre-owned' | 'digital';
  onAddToCart: () => void;
  onWhatsAppContact?: () => void;
  isLoading?: boolean;
}

const ProductActions: React.FC<ProductActionsProps> = ({ 
  product, 
  onAddToCart, 
  isLoading
}) => {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="space-y-3 pt-2">
      {/* Comprar Agora - Botão Verde Sólido (Padrão Mercado Livre) */}
      {!isOutOfStock && (
        <Button
          onClick={async () => {
            // Usar nova função para gerar código de verificação
            await import('@/utils/whatsapp').then(({ sendSingleProductToWhatsApp }) => {
              return sendSingleProductToWhatsApp(product, 1, null, () => {
                // Track analytics
              });
            });
          }}
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg h-12 transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
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
              Comprar Agora
            </>
          )}
        </Button>
      )}

      {/* Adicionar ao Carrinho - Botão Branco com Borda Vermelha (Padrão Mercado Livre) */}
      <div className="flex gap-2">
        <Button
          onClick={onAddToCart}
          size="lg"
          variant="outline"
          className={cn(
            "flex-1 font-semibold rounded-lg h-12 transition-colors duration-200",
            isOutOfStock
              ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
              : "bg-white border-2 border-red-600 text-red-600 hover:bg-red-50"
          )}
          disabled={isOutOfStock || isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adicionando...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
            </>
          )}
        </Button>

        <FavoriteButton productId={product.id} size="lg" />
      </div>
    </div>
  );
};

export default ProductActions;
