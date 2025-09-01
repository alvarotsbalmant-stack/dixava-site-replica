/**
 * CONTEXTO ENTERPRISE TRACKING - VERSÃO MULTI-USUÁRIO
 * Rastreia TODOS os usuários (logados e anônimos) com IDs únicos
 */

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useEnterpriseTrackingMultiUser } from '@/hooks/useEnterpriseTrackingMultiUser';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

interface EnterpriseTrackingContextType {
  uniqueUserId: string;
  sessionId: string;
  trackEvent: (eventType: string, data?: any, element?: HTMLElement, coordinates?: { x: number; y: number }) => void;
  flushEvents: () => Promise<void>;
  isTracking: boolean;
  trackPageView: (url?: string, title?: string) => void;
  trackProductView: (productId: string, productData?: any) => void;
  trackAddToCart: (productId: string, quantity: number, price: number) => void;
  trackSearch: (query: string, filters?: any, results?: any) => void;
  trackPurchase: (orderData: any) => void;
  updateRealtimeActivity: () => void;
}

const EnterpriseTrackingContext = createContext<EnterpriseTrackingContextType | undefined>(undefined);

export const useEnterpriseTracking = () => {
  const context = useContext(EnterpriseTrackingContext);
  if (!context) {
    throw new Error('useEnterpriseTracking must be used within an EnterpriseTrackingProvider');
  }
  return context;
};

interface EnterpriseTrackingProviderProps {
  children: ReactNode;
}

export const EnterpriseTrackingProvider: React.FC<EnterpriseTrackingProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Sistema enterprise multi-usuário
  const {
    uniqueUserId,
    sessionId,
    isTracking,
    trackPageView: enterpriseTrackPageView,
    trackProductView: enterpriseTrackProductView,
    trackAddToCart: enterpriseTrackAddToCart,
    trackPurchase: enterpriseTrackPurchase,
    updateRealtimeActivity
  } = useEnterpriseTrackingMultiUser();

  // Sistema básico (mantido para compatibilidade)
  const {
    trackEvent: basicTrackEvent,
    flushEvents: basicFlushEvents,
    trackPageView: basicTrackPageView,
    trackProductView: basicTrackProductView,
    trackAddToCart: basicTrackAddToCart,
    trackSearch: basicTrackSearch
  } = useAnalyticsTracking();

  console.log('🔥 [MULTI-USER CONTEXT] Initialized for user:', uniqueUserId);
  console.log('🔥 [MULTI-USER CONTEXT] Session:', sessionId);
  console.log('🔥 [MULTI-USER CONTEXT] Logged user:', user?.id || 'anonymous');

  // Função híbrida para rastrear eventos
  const trackEvent = async (eventType: string, data?: any, element?: HTMLElement, coordinates?: { x: number; y: number }) => {
    try {
      console.log(`🎯 [MULTI-USER CONTEXT] User ${uniqueUserId}: Tracking event: ${eventType}`, data);
      
      // Executar ambos os sistemas
      await Promise.all([
        basicTrackEvent(eventType, data, element, coordinates),
        // Enterprise tracking específico baseado no tipo de evento
        eventType === 'page_view' && enterpriseTrackPageView(data?.url),
        eventType === 'product_view' && enterpriseTrackProductView(data?.productId, data),
        eventType === 'add_to_cart' && enterpriseTrackAddToCart(data?.productId, data?.quantity || 1, data?.price),
        eventType === 'purchase' && enterpriseTrackPurchase(data)
      ]);
      
      console.log(`✅ [MULTI-USER CONTEXT] User ${uniqueUserId}: Event tracked: ${eventType}`);
    } catch (error) {
      console.error(`❌ [MULTI-USER CONTEXT] User ${uniqueUserId}: Error tracking event:`, error);
    }
  };

  // Função híbrida para flush de eventos
  const flushEvents = async () => {
    try {
      await basicFlushEvents();
      await updateRealtimeActivity();
      console.log(`🔄 [MULTI-USER CONTEXT] User ${uniqueUserId}: Events flushed`);
    } catch (error) {
      console.error(`❌ [MULTI-USER CONTEXT] User ${uniqueUserId}: Error flushing events:`, error);
    }
  };

  // Função híbrida para rastrear visualização de página
  const trackPageView = async (url?: string, title?: string) => {
    try {
      const pageUrl = url || window.location.href;
      console.log(`📄 [MULTI-USER CONTEXT] User ${uniqueUserId}: Tracking page view: ${pageUrl}`);
      
      await Promise.all([
        basicTrackPageView(url, title),
        enterpriseTrackPageView(url)
      ]);
      
      console.log(`✅ [MULTI-USER CONTEXT] User ${uniqueUserId}: Page view tracked: ${pageUrl}`);
    } catch (error) {
      console.error(`❌ [MULTI-USER CONTEXT] User ${uniqueUserId}: Error tracking page view:`, error);
    }
  };

  // Função híbrida para rastrear visualização de produto
  const trackProductView = async (productId: string, productData?: any) => {
    try {
      console.log(`🛍️ [MULTI-USER CONTEXT] User ${uniqueUserId}: Tracking product view: ${productId}`);
      
      await Promise.all([
        basicTrackProductView(productId, productData),
        enterpriseTrackProductView(productId, productData)
      ]);
      
      console.log(`✅ [MULTI-USER CONTEXT] User ${uniqueUserId}: Product view tracked: ${productId}`);
    } catch (error) {
      console.error(`❌ [MULTI-USER CONTEXT] User ${uniqueUserId}: Error tracking product view:`, error);
    }
  };

  // Função híbrida para rastrear adição ao carrinho
  const trackAddToCart = async (productId: string, quantity: number, price: number) => {
    try {
      console.log(`🛒 [MULTI-USER CONTEXT] User ${uniqueUserId}: Tracking add to cart: ${productId} x${quantity}`);
      
      await Promise.all([
        basicTrackAddToCart(productId, quantity, price),
        enterpriseTrackAddToCart(productId, quantity, price)
      ]);
      
      console.log(`✅ [MULTI-USER CONTEXT] User ${uniqueUserId}: Add to cart tracked: ${productId}`);
    } catch (error) {
      console.error(`❌ [MULTI-USER CONTEXT] User ${uniqueUserId}: Error tracking add to cart:`, error);
    }
  };

  // Função para rastrear busca (apenas básico por enquanto)
  const trackSearch = async (query: string, filters?: any, results?: any) => {
    try {
      console.log(`🔍 [MULTI-USER CONTEXT] User ${uniqueUserId}: Tracking search: ${query}`);
      await basicTrackSearch(query, filters, results);
      console.log(`✅ [MULTI-USER CONTEXT] User ${uniqueUserId}: Search tracked: ${query}`);
    } catch (error) {
      console.error(`❌ [MULTI-USER CONTEXT] User ${uniqueUserId}: Error tracking search:`, error);
    }
  };

  // Função para rastrear compra
  const trackPurchase = async (orderData: any) => {
    try {
      console.log(`💳 [MULTI-USER CONTEXT] User ${uniqueUserId}: Tracking purchase:`, orderData);
      await enterpriseTrackPurchase(orderData);
      console.log(`✅ [MULTI-USER CONTEXT] User ${uniqueUserId}: Purchase tracked`);
    } catch (error) {
      console.error(`❌ [MULTI-USER CONTEXT] User ${uniqueUserId}: Error tracking purchase:`, error);
    }
  };

  // Rastrear mudanças de rota automaticamente
  useEffect(() => {
    console.log(`🗺️ [MULTI-USER CONTEXT] User ${uniqueUserId}: Route changed to: ${location.pathname}`);
    trackPageView();
  }, [location.pathname, uniqueUserId]);

  // Log de inicialização
  useEffect(() => {
    console.log(`🚀 [MULTI-USER CONTEXT] Provider initialized for user: ${uniqueUserId}`);
    console.log(`🚀 [MULTI-USER CONTEXT] Session: ${sessionId}`);
    console.log(`🚀 [MULTI-USER CONTEXT] Tracking enabled: ${isTracking}`);
    console.log(`🚀 [MULTI-USER CONTEXT] Logged user: ${user?.id || 'anonymous'}`);
  }, [uniqueUserId, sessionId, isTracking, user?.id]);

  const contextValue: EnterpriseTrackingContextType = {
    uniqueUserId,
    sessionId,
    trackEvent,
    flushEvents,
    isTracking,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackSearch,
    trackPurchase,
    updateRealtimeActivity
  };

  return (
    <EnterpriseTrackingContext.Provider value={contextValue}>
      {children}
    </EnterpriseTrackingContext.Provider>
  );
};

