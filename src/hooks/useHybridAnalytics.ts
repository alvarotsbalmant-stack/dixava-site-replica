/**
 * HOOK HÍBRIDO DE ANALYTICS
 * Combina sistema básico com enterprise de forma inteligente
 */

import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { useEnterpriseTracking } from '@/hooks/useEnterpriseTracking';
import { useEnterpriseAnalyticsConfig } from '@/hooks/useEnterpriseAnalyticsConfig';
import { useCallback } from 'react';

export const useHybridAnalytics = () => {
  const { config, isEnterpriseEnabled, isHybridMode } = useEnterpriseAnalyticsConfig();
  
  // Sistema básico (sempre ativo em modo híbrido)
  const basicTracking = useAnalyticsTracking();
  
  // Sistema enterprise (ativo conforme configuração)
  const enterpriseTracking = useEnterpriseTracking();

  // Função unificada para tracking de eventos
  const trackEvent = useCallback((eventType: string, data?: any, productId?: string) => {
    // Sistema básico sempre funciona (compatibilidade)
    if (isHybridMode || !isEnterpriseEnabled) {
      switch (eventType) {
        case 'page_view':
          basicTracking.trackPageView(data?.title);
          break;
        case 'product_view':
          if (productId) basicTracking.trackProductView(productId, data);
          break;
        case 'add_to_cart':
          if (productId) basicTracking.trackAddToCart(productId, data?.quantity || 1, data?.price || 0, data);
          break;
        case 'remove_from_cart':
          if (productId) basicTracking.trackRemoveFromCart(productId, data?.quantity || 1, data?.price || 0);
          break;
        case 'checkout_start':
          basicTracking.trackCheckoutStart(data?.cartItems || [], data?.totalValue || 0);
          break;
        case 'purchase':
          basicTracking.trackPurchase(data?.orderId || '', data?.items || [], data?.totalValue || 0, data?.paymentMethod);
          break;
        case 'whatsapp_click':
          basicTracking.trackWhatsAppClick(productId, data?.context);
          break;
        default:
          // Eventos customizados
          basicTracking.trackEvent({
            event_type: eventType,
            event_data: data,
            product_id: productId
          });
      }
    }

    // Sistema enterprise (se ativo)
    if (isEnterpriseEnabled && enterpriseTracking.trackEvent) {
      enterpriseTracking.trackEvent(eventType, data, undefined, undefined);
    }
  }, [basicTracking, enterpriseTracking, isEnterpriseEnabled, isHybridMode]);

  // Funções específicas mantendo compatibilidade
  const trackPageView = useCallback((title?: string) => {
    trackEvent('page_view', { title });
  }, [trackEvent]);

  const trackProductView = useCallback((productId: string, productData?: any) => {
    trackEvent('product_view', productData, productId);
  }, [trackEvent]);

  const trackAddToCart = useCallback((productId: string, quantity: number, price: number, productData?: any) => {
    trackEvent('add_to_cart', { quantity, price, ...productData }, productId);
  }, [trackEvent]);

  const trackRemoveFromCart = useCallback((productId: string, quantity: number, price: number) => {
    trackEvent('remove_from_cart', { quantity, price }, productId);
  }, [trackEvent]);

  const trackCheckoutStart = useCallback((cartItems: any[], totalValue: number) => {
    trackEvent('checkout_start', { cartItems, totalValue });
  }, [trackEvent]);

  const trackCheckoutAbandon = useCallback((step: string, timeInCheckout: number, cartItems: any[], totalValue: number) => {
    // Sistema básico
    if (isHybridMode || !isEnterpriseEnabled) {
      basicTracking.trackCheckoutAbandon(step, timeInCheckout, cartItems, totalValue);
    }
    // Sistema enterprise
    trackEvent('checkout_abandon', { step, timeInCheckout, cartItems, totalValue });
  }, [trackEvent, basicTracking, isHybridMode, isEnterpriseEnabled]);

  const trackPurchase = useCallback((orderId: string, items: any[], totalValue: number, paymentMethod?: string) => {
    trackEvent('purchase', { orderId, items, totalValue, paymentMethod });
  }, [trackEvent]);

  const trackWhatsAppClick = useCallback((productId?: string, context?: string) => {
    trackEvent('whatsapp_click', { context }, productId);
  }, [trackEvent]);

  // Informações do sistema
  const getSystemInfo = useCallback(() => {
    return {
      enterpriseEnabled: isEnterpriseEnabled,
      hybridMode: isHybridMode,
      basicSessionId: basicTracking.sessionId,
      enterpriseSessionId: enterpriseTracking.sessionId,
      config
    };
  }, [isEnterpriseEnabled, isHybridMode, basicTracking.sessionId, enterpriseTracking.sessionId, config]);

  return {
    // Funções de tracking unificadas
    trackEvent,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStart,
    trackCheckoutAbandon,
    trackPurchase,
    trackWhatsAppClick,
    
    // Informações do sistema
    getSystemInfo,
    
    // Acesso direto aos sistemas (se necessário)
    basicTracking,
    enterpriseTracking,
    
    // Status
    isEnterpriseEnabled,
    isHybridMode
  };
};

