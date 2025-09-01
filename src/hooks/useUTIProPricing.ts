import { useMemo } from 'react';
import { Product } from '@/hooks/useProducts/types';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export interface UTIProPricing {
  isEnabled: boolean;
  proPrice: number | null;
  savings: number | null;
  discountPercentage: number | null;
}

export const useUTIProPricing = (product: Product): UTIProPricing => {
  const { hasActiveSubscription } = useSubscriptions();
  const { utiProSettings, loading } = useSiteSettings();
  const isUserPro = hasActiveSubscription();

  return useMemo(() => {
    // Se ainda está carregando, não mostrar nada do UTI PRO
    if (loading) {
      return {
        isEnabled: false,
        proPrice: null,
        savings: null,
        discountPercentage: null,
      };
    }

    // Verifica se o UTI PRO está globalmente habilitado
    if (!utiProSettings.enabled) {
      return {
        isEnabled: false,
        proPrice: null,
        savings: null,
        discountPercentage: null,
      };
    }

    // Só mostra preço PRO se foi configurado no admin (tem pro_price)
    if (!product.pro_price || product.pro_price <= 0) {
      return {
        isEnabled: false,
        proPrice: null,
        savings: null,
        discountPercentage: null,
      };
    }

    const proPrice = product.pro_price;
    const savings = product.price - proPrice;
    const discountPercentage = Math.round(((product.price - proPrice) / product.price) * 100);

    return {
      isEnabled: true,
      proPrice: Math.max(0, proPrice),
      savings: Math.max(0, savings),
      discountPercentage: Math.max(0, discountPercentage),
    };
  }, [product, utiProSettings.enabled, loading]);
};