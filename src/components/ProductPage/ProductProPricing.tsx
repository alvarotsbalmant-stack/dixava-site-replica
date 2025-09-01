
import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/useProducts';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useUTIProPricing } from '@/hooks/useUTIProPricing';
import { formatPrice } from '@/utils/formatPrice';
import { useNavigate } from 'react-router-dom';

interface ProductProPricingProps {
  product: Product;
  selectedCondition: 'new' | 'pre-owned' | 'digital';
  onConditionChange: (condition: 'new' | 'pre-owned' | 'digital') => void;
}

const ProductProPricing = ({ product, selectedCondition, onConditionChange }: ProductProPricingProps) => {
  const { hasActiveSubscription } = useSubscriptions();
  const navigate = useNavigate();
  const utiProPricing = useUTIProPricing(product);
  
  const isProMember = hasActiveSubscription();
  
  const getBasePrice = () => {
    switch (selectedCondition) {
      case 'new': return product.price + 1.71;
      case 'digital': return product.price + 6.65;
      default: return product.price;
    }
  };

  const basePrice = getBasePrice();
  const originalPrice = product.list_price;

  const conditionLabels = {
    'pre-owned': 'Usado',
    'new': 'Novo',
    'digital': 'Digital'
  };

  return (
    <div className="space-y-6">
      {/* Condition Selector */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Condição</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['pre-owned', 'new', 'digital'] as const).map((condition) => (
            <button
              key={condition}
              onClick={() => onConditionChange(condition)}
              className={`p-3 text-sm font-medium rounded-lg border transition-all ${
                selectedCondition === condition
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {conditionLabels[condition]}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Preço</h3>
        
        {/* UTI PRO Price - só mostra se habilitado e user é PRO member */}
        {utiProPricing.isEnabled && isProMember && utiProPricing.proPrice && (
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
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
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                -{utiProPricing.discountPercentage}% OFF
              </span>
            </div>
            <div className="text-sm text-yellow-700 mt-2">
              Você está economizando {formatPrice(utiProPricing.savings || 0)}
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              ou 12x de {formatPrice((utiProPricing.proPrice || 0) / 12)} sem juros
            </div>
          </div>
        )}

        {/* Regular Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${(utiProPricing.isEnabled && isProMember) ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {formatPrice(basePrice)}
            </span>
            {!(utiProPricing.isEnabled && isProMember) && originalPrice && originalPrice > basePrice && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          
          {!(utiProPricing.isEnabled && isProMember) && (
            <div className="text-gray-600">
              ou 12x de {formatPrice(basePrice / 12)} sem juros
            </div>
          )}
        </div>

        {/* UTI PRO teaser for non-members - só mostra se habilitado */}
        {utiProPricing.isEnabled && !isProMember && utiProPricing.proPrice && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-red-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-800">Preço Membro UTI PRO</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-purple-700">
                  {formatPrice(utiProPricing.proPrice)}
                </span>
                <div className="text-sm text-purple-600">
                  Economize {formatPrice(utiProPricing.savings || 0)} (-{utiProPricing.discountPercentage}%)
                </div>
              </div>
              <Button
                onClick={() => navigate('/uti-pro')}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
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

export default ProductProPricing;
