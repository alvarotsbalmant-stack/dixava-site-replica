
import React from 'react';
import { Product } from '@/hooks/useProducts';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useUTIProPricing } from '@/hooks/useUTIProPricing';
import { formatPrice } from '@/utils/formatPrice';
import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductPricingProps {
  product: Product;
  selectedCondition: 'new' | 'pre-owned' | 'digital';
  onConditionChange: (condition: 'new' | 'pre-owned' | 'digital') => void;
}

const ProductPricing: React.FC<ProductPricingProps> = ({
  product,
  selectedCondition,
  onConditionChange,
}) => {
  const { hasActiveSubscription } = useSubscriptions();
  const isProMember = hasActiveSubscription();
  const utiProPricing = useUTIProPricing(product);

  const getBasePrice = () => {
    switch (selectedCondition) {
      case 'new':
        return product.new_price || product.price * 1.1;
      case 'digital':
        return product.digital_price || product.price * 1.05;
      default:
        return product.price;
    }
  };

  const basePrice = getBasePrice();
  const originalPrice = product.list_price;

  return (
    <div className="space-y-6">
      {/* Preços */}
      <div className="space-y-4">
        {/* Preço UTI PRO - só mostra se habilitado para o produto */}
        {utiProPricing.isEnabled && isProMember && utiProPricing.proPrice && (
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-800 uppercase tracking-wide">
                Seu Preço UTI PRO
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-yellow-800">
                {formatPrice(utiProPricing.proPrice)}
              </span>
              <Badge className="bg-green-500 text-white font-bold">
                -{utiProPricing.discountPercentage}% OFF
              </Badge>
            </div>
            <div className="text-sm text-yellow-700 mt-1">
              Você está economizando {formatPrice(utiProPricing.savings || 0)}
            </div>
          </div>
        )}

        {/* Preço Regular - sempre mostra */}
        {(!utiProPricing.isEnabled || !isProMember) && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {originalPrice && originalPrice > basePrice && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(basePrice)}
              </span>
              {originalPrice && originalPrice > basePrice && (
                <Badge variant="destructive" className="font-bold">
                  -{Math.round(((originalPrice - basePrice) / originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Oferta UTI PRO para não membros - só mostra se habilitado */}
        {utiProPricing.isEnabled && !isProMember && utiProPricing.proPrice && (
          <div className="bg-gradient-to-r from-purple-50 to-red-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-purple-800">Preço Membro UTI PRO</span>
                </div>
                <div className="text-xl font-bold text-purple-700">
                  {formatPrice(utiProPricing.proPrice)}
                </div>
                <div className="text-sm text-purple-600">
                  Economize {formatPrice(utiProPricing.savings || 0)} (-{utiProPricing.discountPercentage}%)
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white font-bold"
                onClick={() => window.open('/uti-pro', '_blank')}
              >
                Ser PRO
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPricing;
