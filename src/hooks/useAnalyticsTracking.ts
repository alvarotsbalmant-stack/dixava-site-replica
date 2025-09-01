import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EventData {
  [key: string]: any;
}

interface AnalyticsEvent {
  event_type: string;
  event_data?: EventData;
  product_id?: string;
  page_url?: string;
  referrer?: string;
}

// Função para gerar session ID único
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Função para detectar tipo de dispositivo
const getDeviceType = () => {
  const width = window.innerWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
};

// Função para obter dados de navegador
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detectar browser
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  // Detectar OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  return { browser, os };
};

// Função para obter fonte de tráfego
const getTrafficSource = () => {
  const referrer = document.referrer;
  const params = new URLSearchParams(window.location.search);
  
  // UTM parameters
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');

  if (utmSource) {
    return {
      traffic_source: utmSource,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign
    };
  }

  if (referrer) {
    if (referrer.includes('google')) return { traffic_source: 'google' };
    if (referrer.includes('facebook') || referrer.includes('instagram')) return { traffic_source: 'social' };
    if (referrer.includes('whatsapp') || referrer.includes('wa.me')) return { traffic_source: 'whatsapp' };
    return { traffic_source: 'referral' };
  }

  return { traffic_source: 'direct' };
};

export const useAnalyticsTracking = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string>(generateSessionId());
  const sessionStartRef = useRef<Date>(new Date());
  const pageStartTimeRef = useRef<Date>(new Date());
  const eventsQueueRef = useRef<AnalyticsEvent[]>([]);
  const isInitializedRef = useRef(false);

  // Função para enviar eventos em lote
  const flushEvents = useCallback(async () => {
    if (eventsQueueRef.current.length === 0) return;

    const events = [...eventsQueueRef.current];
    eventsQueueRef.current = [];

    const { browser, os } = getBrowserInfo();
    const deviceType = getDeviceType();

    const eventsToInsert = events.map(event => ({
      user_id: user?.id || null,
      session_id: sessionIdRef.current,
      event_type: event.event_type,
      event_data: event.event_data || {},
      product_id: event.product_id || null,
      page_url: event.page_url || window.location.href,
      referrer: event.referrer || document.referrer,
      user_agent: navigator.userAgent,
      device_type: deviceType,
      location_data: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      }
    }));

    try {
      await supabase.from('customer_events').insert(eventsToInsert);
    } catch (error) {
      console.error('Erro ao enviar eventos:', error);
      // Recolocar eventos na fila em caso de erro
      eventsQueueRef.current.unshift(...events);
    }
  }, [user?.id]);

  // Função para rastrear evento
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    eventsQueueRef.current.push({
      ...event,
      page_url: event.page_url || window.location.href,
      referrer: event.referrer || document.referrer
    });

    // Enviar eventos a cada 5 eventos ou a cada 10 segundos
    if (eventsQueueRef.current.length >= 5) {
      flushEvents();
    }
  }, [flushEvents]);

  // Inicializar sessão
  const initializeSession = useCallback(async () => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const { browser, os } = getBrowserInfo();
    const trafficData = getTrafficSource();
    
    try {
      await supabase.from('user_sessions').insert({
        session_id: sessionIdRef.current,
        user_id: user?.id || null,
        device_type: getDeviceType(),
        browser,
        os,
        location_data: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language
        },
        ...trafficData
      });

      // Rastrear page view inicial
      trackEvent({
        event_type: 'page_view',
        event_data: {
          title: document.title,
          is_initial_page: true
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar sessão:', error);
    }
  }, [user?.id, trackEvent]);

  // Finalizar sessão
  const endSession = useCallback(async () => {
    const duration = Math.floor((new Date().getTime() - sessionStartRef.current.getTime()) / 1000);
    
    try {
      await supabase
        .from('user_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: duration,
          events_count: eventsQueueRef.current.length
        })
        .eq('session_id', sessionIdRef.current);

      // Enviar eventos restantes
      await flushEvents();
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    }
  }, [flushEvents]);

  // Rastrear mudanças de página
  const trackPageView = useCallback((title?: string) => {
    trackEvent({
      event_type: 'page_view',
      event_data: {
        title: title || document.title,
        previous_page_time: Math.floor((new Date().getTime() - pageStartTimeRef.current.getTime()) / 1000)
      }
    });
    pageStartTimeRef.current = new Date();
  }, [trackEvent]);

  // Rastrear visualização de produto
  const trackProductView = useCallback((productId: string, productData?: any) => {
    trackEvent({
      event_type: 'product_view',
      product_id: productId,
      event_data: {
        ...productData,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Rastrear adição ao carrinho
  const trackAddToCart = useCallback((productId: string, quantity: number, price: number, productData?: any) => {
    const eventType = productData?.isNewItem === false ? 'cart_quantity_increase' : 'add_to_cart';
    
    trackEvent({
      event_type: eventType,
      product_id: productId,
      event_data: {
        quantity,
        price,
        value: price * quantity,
        is_new_item: productData?.isNewItem !== false,
        final_quantity: productData?.finalQuantity || quantity,
        ...productData
      }
    });
  }, [trackEvent]);

  // Rastrear remoção do carrinho
  const trackRemoveFromCart = useCallback((productId: string, quantity: number, price: number) => {
    trackEvent({
      event_type: 'remove_from_cart',
      product_id: productId,
      event_data: {
        quantity,
        price,
        value: price * quantity
      }
    });
  }, [trackEvent]);

  // Rastrear início do checkout
  const trackCheckoutStart = useCallback((cartItems: any[], totalValue: number) => {
    trackEvent({
      event_type: 'checkout_start',
      event_data: {
        cart_items: cartItems,
        total_value: totalValue,
        items_count: cartItems.length
      }
    });
  }, [trackEvent]);

  // Rastrear abandono do checkout
  const trackCheckoutAbandon = useCallback((step: string, timeInCheckout: number, cartItems: any[], totalValue: number) => {
    trackEvent({
      event_type: 'checkout_abandon',
      event_data: {
        checkout_step: step,
        time_in_checkout_seconds: timeInCheckout,
        cart_items: cartItems,
        total_value: totalValue
      }
    });

    // Inserir também na tabela de carrinho abandonado
    supabase.from('cart_abandonment').insert({
      session_id: sessionIdRef.current,
      user_id: user?.id || null,
      cart_items: cartItems,
      cart_value: totalValue,
      checkout_step: step,
      time_in_checkout_seconds: timeInCheckout
    });
  }, [trackEvent, user?.id]);

  // Rastrear compra
  const trackPurchase = useCallback((orderId: string, items: any[], totalValue: number, paymentMethod?: string) => {
    trackEvent({
      event_type: 'purchase',
      event_data: {
        order_id: orderId,
        items,
        value: totalValue,
        payment_method: paymentMethod,
        items_count: items.length
      }
    });

    // Marcar sessão como convertida
    supabase
      .from('user_sessions')
      .update({
        converted: true,
        purchase_value: totalValue
      })
      .eq('session_id', sessionIdRef.current);
  }, [trackEvent]);

  // Rastrear clique no WhatsApp
  const trackWhatsAppClick = useCallback((productId?: string, context?: string) => {
    trackEvent({
      event_type: 'whatsapp_click',
      product_id: productId,
      event_data: {
        context: context || 'product_page',
        timestamp: new Date().toISOString()
      }
    });
  }, [trackEvent]);

  // Inicializar tracking
  useEffect(() => {
    initializeSession();

    // Enviar eventos periodicamente
    const flushInterval = setInterval(flushEvents, 10000);

    // Listener para beforeunload (sair da página)
    const handleBeforeUnload = () => {
      endSession();
    };

    // Listener para mudanças de visibilidade
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushEvents();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(flushInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      endSession();
    };
  }, [initializeSession, endSession, flushEvents]);

  return {
    trackEvent,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackRemoveFromCart,
    trackCheckoutStart,
    trackCheckoutAbandon,
    trackPurchase,
    trackWhatsAppClick,
    sessionId: sessionIdRef.current
  };
};