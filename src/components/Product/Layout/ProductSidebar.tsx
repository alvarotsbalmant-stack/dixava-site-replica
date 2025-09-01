import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { SKUNavigation } from '@/hooks/useProducts/types';
import { ShoppingCart, Zap, Truck, Shield, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Importar componentes especializados
import DeliveryInfo from '../Sidebar/DeliveryInfo';
import QuantitySelector from '../Sidebar/QuantitySelector';
import ActionButtons from '../Sidebar/ActionButtons';
import UTICoinsInfo from '../Sidebar/UTICoinsInfo';
import TrustBadges from '../Sidebar/TrustBadges';
import DynamicDelivery from '../Sidebar/DynamicDelivery';

import { PurchaseConfirmationModal } from '@/components/Product/PurchaseConfirmationModal';

interface ProductSidebarProps {
  product: Product;
  skuNavigation?: SKUNavigation;
  onAddToCart: (product: Product) => void;
  className?: string;
}

const ProductSidebar: React.FC<ProductSidebarProps> = ({
  product,
  skuNavigation,
  onAddToCart,
  className
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const handleBuyNow = () => {
    // Abrir modal de confirmação de compra
    setIsModalOpen(true);
  };

  return (
    <div className={cn(
      "space-y-6 bg-white p-6 rounded-lg border border-gray-200",
      className
    )}>
      {/* ===== SEÇÃO PRIORITÁRIA NO TOPO ===== */}
      
      {/* ENTREGA DINÂMICA */}
      <DynamicDelivery productPrice={product.price} />

      {/* SELETOR DE QUANTIDADE */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Quantidade:
        </label>
        <QuantitySelector 
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
        />
      </div>

      {/* BOTÕES DE AÇÃO PRINCIPAIS - DESIGN ULTRA PROFISSIONAL */}
      <div className="space-y-4">
        {/* Comprar Agora - Botão Primário Ultra Profissional */}
        <Button 
          onClick={handleBuyNow}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-base rounded-lg h-12 border-0 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out tracking-wide"
          size="lg"
        >
          <Zap className="w-4 h-4 mr-2" />
          Comprar agora
        </Button>
        
        {/* Adicionar ao Carrinho - Botão Secundário Ultra Profissional */}
        <Button 
          onClick={handleAddToCart}
          variant="outline"
          className="w-full bg-white hover:bg-red-50 border border-gray-300 hover:border-red-400 text-gray-800 hover:text-red-700 font-medium text-base rounded-lg h-12 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out tracking-wide"
          size="lg"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Adicionar ao carrinho
        </Button>
      </div>

      {/* ===== SEÇÃO SECUNDÁRIA ABAIXO ===== */}

      {/* UTI COINS */}
      <UTICoinsInfo 
        product={product}
        quantity={quantity}
      />

      {/* GARANTIAS E SEGURANÇA */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Garantias UTI:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-4 h-4" />
            <span>7 dias para troca</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-4 h-4" />
            <span>Garantia do fabricante</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-4 h-4" />
            <span>Suporte especializado</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-4 h-4" />
            <span>Compra 100% segura</span>
          </div>
        </div>
      </div>

      {/* TRUST BADGES */}
      <TrustBadges />

      {/* MODAL DE CONFIRMAÇÃO DE COMPRA */}
      <PurchaseConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={{
          name: product.name,
          price: product.price,
          originalPrice: product.list_price,
          image: product.images?.[0] || '/placeholder.svg'
        }}
        quantity={quantity}
      />
    </div>
  );
};

export default ProductSidebar;

