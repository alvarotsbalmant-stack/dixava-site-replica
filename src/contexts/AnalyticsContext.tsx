import React, { createContext, useContext, ReactNode } from 'react';

// Tipos simplificados de analytics
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

export interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (title?: string) => void;
  trackProductView: (productId: string, productName?: string, price?: number) => void;
  trackAddToCart: (productId: string, quantity: number, price: number, productData?: any) => void;
  sessionId: string;
}

// Context simplificado
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Provider simplificado
export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sessionId = React.useMemo(() => 
    Math.random().toString(36).substr(2, 9), []
  );

  const trackEvent = (event: AnalyticsEvent) => {
    console.log('Analytics Event:', event);
  };

  const trackPageView = (title?: string) => {
    console.log('Page View:', title || document.title);
  };

  const trackProductView = (productId: string, productName?: string, price?: number) => {
    console.log('Product View:', { productId, productName, price });
  };

  const trackAddToCart = (productId: string, quantity: number, price: number, productData?: any) => {
    console.log('Add to Cart:', { productId, quantity, price, productData });
  };

  const value: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackProductView,
    trackAddToCart,
    sessionId,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook simplificado
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};