
import React from 'react';
import { Product } from '@/hooks/useProducts';
import { formatPrice } from '@/utils/formatPrice';
import { ShoppingCart, MessageCircle, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendSingleProductToWhatsApp } from '@/utils/whatsapp';

interface ProductCTABottomProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCTABottom: React.FC<ProductCTABottomProps> = ({ product, onAddToCart }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsApp = async () => {
    // Usar nova função para gerar código de verificação
    await sendSingleProductToWhatsApp(product, 1, null, () => {
      // Track analytics
    });
  };

  return (
    <div className="bg-white border-t border-gray-200 sticky bottom-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Resumo do Produto */}
          <div className="flex items-center gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-contain bg-gray-50 rounded-lg"
            />
            <div>
              <h3 className="font-bold text-gray-900 truncate max-w-xs">
                {product.name}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={scrollToTop}
              className="hidden sm:flex"
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              Voltar ao Topo
            </Button>
            
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>

            <Button
              onClick={() => onAddToCart(product)}
              className="bg-red-600 hover:bg-red-700 text-white px-8"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCTABottom;
