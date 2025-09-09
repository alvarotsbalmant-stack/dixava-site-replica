import React, { createContext, useContext, ReactNode } from 'react';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

interface AnalyticsContextType {
  uniqueUserId: string;
  sessionId: string;
  
  trackEvent: (eventType: string, data?: any) => void;
  trackPageView: (url?: string, title?: string) => void;
  trackProductView: (productId: string, productData?: any) => void;
  trackAddToCart: (productId: string, quantity: number, price: number) => void;
  trackRemoveFromCart: (productId: string) => void;
  trackPurchase: (orderId: string, total: number, items: any[]) => void;
  
  isTracking: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const {
    trackEvent: basicTrackEvent,
    trackPageView: basicTrackPageView,
    trackProductView: basicTrackProductView,
    trackAddToCart: basicTrackAddToCart,
    sessionId
  } = useAnalyticsTracking();

  // Generate unique user ID
  const uniqueUserId = sessionId;

  // Implementação simplificada
  const trackEvent = (eventType: string, data?: any) => {
    // Formato simplificado para o hook básico
    basicTrackEvent({
      event_type: eventType,
      ...data
    });
  };

  const trackPageView = (url?: string, title?: string) => {
    basicTrackPageView(title || document.title);
  };

  const trackProductView = (productId: string, productData?: any) => {
    basicTrackProductView(productId, productData);
  };

  const trackAddToCart = (productId: string, quantity: number, price: number) => {
    basicTrackAddToCart(productId, quantity, price);
  };

  const trackRemoveFromCart = (productId: string) => {
    trackEvent('remove_from_cart', { productId });
  };

  const trackPurchase = (orderId: string, total: number, items: any[]) => {
    trackEvent('purchase', { orderId, total, items });
  };

  const value: AnalyticsContextType = {
    uniqueUserId,
    sessionId,
    trackEvent,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackPurchase,
    isTracking: true
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};