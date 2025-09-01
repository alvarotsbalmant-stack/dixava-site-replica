import React from 'react';
import { Product } from '@/hooks/useProducts';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useUTIProPricing } from '@/hooks/useUTIProPricing';
import { formatPrice } from '@/utils/formatPrice';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ProductPricingProps {
  product: Product;
  selectedCondition: 'new' | 'pre-owned' | 'digital';
  onConditionChange: (condition: 'new' | 'pre-owned' | 'digital') => void;
}

// **Radical Redesign based on GameStop reference and plan_transformacao_radical.md**
const ProductPricing: React.FC<ProductPricingProps> = ({
  product,
  selectedCondition,
  onConditionChange,
}) => {
  const { hasActiveSubscription } = useSubscriptions();
  const isProMember = hasActiveSubscription();
  const utiProPricing = useUTIProPricing(product);

  // --- Price Calculation --- 
  const prices = {
    'pre-owned': product.price,
    'new': product.new_price || product.price * 1.1,
    'digital': product.digital_price || product.price * 1.05,
  };
  const currentPrice = prices[selectedCondition];
  const listPrice = product.list_price;

  // --- Condition Options --- 
  // Determine available conditions based on product data (e.g., tags or specific fields)
  const availableConditions = [
    { key: 'pre-owned', label: 'Usado', price: prices['pre-owned'] },
    // Only show 'new' if new_price exists or product tag indicates 'novo'
    (prices['new'] && product.tags?.some(t => t.name.toLowerCase() === 'novo')) && 
      { key: 'new', label: 'Novo', price: prices['new'] },
    // Only show 'digital' if digital_price exists or product tag indicates 'digital'
    (prices['digital'] && product.tags?.some(t => t.name.toLowerCase() === 'digital')) && 
      { key: 'digital', label: 'Digital', price: prices['digital'] },
  ].filter(Boolean) as { key: 'new' | 'pre-owned' | 'digital'; label: string; price: number }[];

  // Sort conditions by price (optional, but logical)
  availableConditions.sort((a, b) => a.price - b.price);

  return (
    <div className="space-y-4">
      {/* Price Display */}
      <div className="flex flex-col items-start">
        <span className="text-3xl font-bold text-foreground">
          {formatPrice(currentPrice)}
        </span>
        {listPrice && listPrice > currentPrice && (
          <span className="text-sm text-muted-foreground line-through ml-1">
            {formatPrice(listPrice)}
          </span>
        )}
        {/* Pro Price Info - só mostra se habilitado */}
        {utiProPricing.isEnabled && utiProPricing.proPrice && (
          <div className="mt-1 flex items-center gap-1.5 text-uti-pro">
            <Crown className="h-4 w-4" />
            <span className="text-base font-semibold">
              {formatPrice(utiProPricing.proPrice)}
            </span>
            <span className="text-sm font-medium">para membros UTI PRO</span>
          </div>
        )}
      </div>

      {/* Seção de condição removida conforme solicitado pelo usuário */}
    </div>
  );
};

export default ProductPricing;

