/**
 * ENTERPRISE TRACKING - VERSÃO CORRIGIDA
 * Sistema de tracking avançado que FORÇA a coleta de dados
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseAnalyticsConfig } from '@/hooks/useEnterpriseAnalyticsConfig';

interface TrackingEvent {
  session_id: string;
  user_id?: string;
  event_type: string;
  data: any;
  coordinates?: { x: number; y: number };
  element?: {
    selector?: string;
    text?: string;
    attributes?: Record<string, string>;
  };
  timing: {
    timestamp: number;
    performance_now: number;
  };
}

export const useEnterpriseTrackingFixed = () => {
  const { user } = useAuth();
  const { config } = useEnterpriseAnalyticsConfig();
  
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isTracking, setIsTracking] = useState(true);
  
  const eventsQueueRef = useRef<TrackingEvent[]>([]);
  const sequenceNumberRef = useRef(1);
  const sessionStartTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const pageStartTime = useRef(Date.now());

  // FORÇAR inicialização da sessão
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('🚀 [ENTERPRISE FIXED] Initializing session:', sessionId);
        
        // Criar entrada na tabela realtime_activity
        const { error: activityError } = await supabase
          .from('realtime_activity')
          .upsert({
            session_id: sessionId,
            user_id: user?.id || null,
            activity_status: 'active',
            current_page: window.location.href,
            last_heartbeat: new Date().toISOString(),
            time_on_site_seconds: 0,
            engagement_score: 0,
            device_info: {
              userAgent: navigator.userAgent,
              screen: { width: screen.width, height: screen.height },
              viewport: { width: window.innerWidth, height: window.innerHeight }
            },
            location_info: {
              url: window.location.href,
              pathname: window.location.pathname,
              search: window.location.search
            }
          });

        if (activityError) {
          console.error('❌ [ENTERPRISE FIXED] Error creating activity:', activityError);
        } else {
          console.log('✅ [ENTERPRISE FIXED] Session initialized successfully');
        }

        // Registrar primeira visualização de página
        await trackPageViewForced();
        
      } catch (error) {
        console.error('❌ [ENTERPRISE FIXED] Error initializing session:', error);
      }
    };

    initializeSession();
  }, [sessionId, user?.id]);

  // FORÇAR tracking de page view
  const trackPageViewForced = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      pageStartTime.current = Date.now();
      
      console.log('📄 [ENTERPRISE FIXED] Tracking page view:', window.location.href);

      // Inserir diretamente na tabela user_journey_detailed
      const { error: journeyError } = await supabase
        .from('user_journey_detailed')
        .insert({
          session_id: sessionId,
          user_id: user?.id || null,
          step_number: sequenceNumberRef.current++,
          page_url: window.location.href,
          page_title: document.title,
          action_type: 'page_view',
          action_details: {
            referrer: document.referrer,
            timestamp: now
          },
          time_spent_seconds: 0,
          cumulative_time_seconds: Math.floor((Date.now() - sessionStartTime.current) / 1000),
          funnel_stage: determineFunnelStage(window.location.href),
          conversion_step: false,
          engagement_score: 50,
          step_start_time: now,
          step_end_time: null
        });

      if (journeyError) {
        console.error('❌ [ENTERPRISE FIXED] Error tracking page view:', journeyError);
      } else {
        console.log('✅ [ENTERPRISE FIXED] Page view tracked successfully');
      }

      // Atualizar atividade em tempo real
      await updateRealtimeActivity();
      
    } catch (error) {
      console.error('❌ [ENTERPRISE FIXED] Error in trackPageViewForced:', error);
    }
  }, [sessionId, user?.id]);

  // FORÇAR tracking de produto
  const trackProductViewForced = useCallback(async (productId: string, productData?: any) => {
    try {
      const now = new Date().toISOString();
      
      console.log('🛍️ [ENTERPRISE FIXED] Tracking product view:', productId);

      // Inserir na tabela user_journey_detailed
      const { error: journeyError } = await supabase
        .from('user_journey_detailed')
        .insert({
          session_id: sessionId,
          user_id: user?.id || null,
          step_number: sequenceNumberRef.current++,
          page_url: window.location.href,
          page_title: document.title,
          action_type: 'product_view',
          action_details: {
            product_id: productId,
            product_data: productData,
            timestamp: now
          },
          time_spent_seconds: Math.floor((Date.now() - pageStartTime.current) / 1000),
          cumulative_time_seconds: Math.floor((Date.now() - sessionStartTime.current) / 1000),
          funnel_stage: 'product_discovery',
          conversion_step: true,
          engagement_score: 70,
          step_start_time: now,
          step_end_time: null
        });

      if (journeyError) {
        console.error('❌ [ENTERPRISE FIXED] Error tracking product view:', journeyError);
      } else {
        console.log('✅ [ENTERPRISE FIXED] Product view tracked successfully');
      }

      // Inserir interação específica
      const { error: interactionError } = await supabase
        .from('page_interactions')
        .insert({
          session_id: sessionId,
          user_id: user?.id || null,
          page_url: window.location.href,
          page_title: document.title,
          interaction_type: 'product_view',
          element_selector: `[data-product-id="${productId}"]`,
          element_text: productData?.name || 'Produto',
          context_data: {
            product_id: productId,
            product_data: productData
          },
          device_type: getDeviceType(),
          timestamp_precise: now
        });

      if (interactionError) {
        console.error('❌ [ENTERPRISE FIXED] Error tracking product interaction:', interactionError);
      }

      await updateRealtimeActivity();
      
    } catch (error) {
      console.error('❌ [ENTERPRISE FIXED] Error in trackProductViewForced:', error);
    }
  }, [sessionId, user?.id]);

  // FORÇAR tracking de carrinho
  const trackAddToCartForced = useCallback(async (productId: string, quantity: number, price: number) => {
    try {
      const now = new Date().toISOString();
      
      console.log('🛒 [ENTERPRISE FIXED] Tracking add to cart:', productId);

      // Inserir na tabela user_journey_detailed
      const { error: journeyError } = await supabase
        .from('user_journey_detailed')
        .insert({
          session_id: sessionId,
          user_id: user?.id || null,
          step_number: sequenceNumberRef.current++,
          page_url: window.location.href,
          page_title: document.title,
          action_type: 'add_to_cart',
          action_details: {
            product_id: productId,
            quantity: quantity,
            price: price,
            total_value: quantity * price,
            timestamp: now
          },
          time_spent_seconds: Math.floor((Date.now() - pageStartTime.current) / 1000),
          cumulative_time_seconds: Math.floor((Date.now() - sessionStartTime.current) / 1000),
          funnel_stage: 'consideration',
          conversion_step: true,
          engagement_score: 85,
          step_start_time: now,
          step_end_time: null
        });

      if (journeyError) {
        console.error('❌ [ENTERPRISE FIXED] Error tracking add to cart:', journeyError);
      } else {
        console.log('✅ [ENTERPRISE FIXED] Add to cart tracked successfully');
      }

      await updateRealtimeActivity();
      
    } catch (error) {
      console.error('❌ [ENTERPRISE FIXED] Error in trackAddToCartForced:', error);
    }
  }, [sessionId, user?.id]);

  // Atualizar atividade em tempo real
  const updateRealtimeActivity = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      lastActivityTime.current = Date.now();
      
      const { error } = await supabase
        .from('realtime_activity')
        .upsert({
          session_id: sessionId,
          user_id: user?.id || null,
          activity_status: 'active',
          current_page: window.location.href,
          last_heartbeat: now,
          time_on_site_seconds: Math.floor((Date.now() - sessionStartTime.current) / 1000),
          engagement_score: calculateCurrentEngagementScore(),
          device_info: {
            userAgent: navigator.userAgent,
            screen: { width: screen.width, height: screen.height },
            viewport: { width: window.innerWidth, height: window.innerHeight }
          },
          location_info: {
            url: window.location.href,
            pathname: window.location.pathname,
            search: window.location.search
          }
        });

      if (error) {
        console.error('❌ [ENTERPRISE FIXED] Error updating realtime activity:', error);
      }
    } catch (error) {
      console.error('❌ [ENTERPRISE FIXED] Error in updateRealtimeActivity:', error);
    }
  }, [sessionId, user?.id]);

  // Heartbeat automático
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      updateRealtimeActivity();
    }, 30000); // A cada 30 segundos

    return () => clearInterval(heartbeatInterval);
  }, [updateRealtimeActivity]);

  // Funções auxiliares
  const determineFunnelStage = (url: string): string => {
    if (url.includes('/product/') || url.includes('/produto/')) return 'product_discovery';
    if (url.includes('/cart') || url.includes('/carrinho')) return 'consideration';
    if (url.includes('/checkout') || url.includes('/pagamento')) return 'purchase_intent';
    if (url.includes('/playstation') || url.includes('/xbox') || url.includes('/nintendo')) return 'category_browse';
    return 'awareness';
  };

  const getDeviceType = (): string => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const calculateCurrentEngagementScore = (): number => {
    const timeOnSite = (Date.now() - sessionStartTime.current) / 1000;
    const timeSinceLastActivity = (Date.now() - lastActivityTime.current) / 1000;
    
    let score = 50; // Base score
    
    // Tempo no site
    if (timeOnSite > 300) score += 20; // 5+ minutos
    else if (timeOnSite > 120) score += 10; // 2+ minutos
    
    // Atividade recente
    if (timeSinceLastActivity < 30) score += 15; // Ativo nos últimos 30s
    
    // Número de páginas
    if (sequenceNumberRef.current > 5) score += 15;
    else if (sequenceNumberRef.current > 2) score += 10;
    
    return Math.min(100, Math.max(0, score));
  };

  // Função genérica de tracking
  const trackEvent = useCallback(async (eventType: string, data?: any) => {
    console.log(`🎯 [ENTERPRISE FIXED] Tracking event: ${eventType}`, data);
    
    switch (eventType) {
      case 'page_view':
        await trackPageViewForced();
        break;
      case 'product_view':
        if (data?.productId) {
          await trackProductViewForced(data.productId, data);
        }
        break;
      case 'add_to_cart':
        if (data?.productId) {
          await trackAddToCartForced(data.productId, data.quantity || 1, data.price || 0);
        }
        break;
      default:
        // Outros eventos
        await updateRealtimeActivity();
    }
  }, [trackPageViewForced, trackProductViewForced, trackAddToCartForced, updateRealtimeActivity]);

  return {
    sessionId,
    isTracking,
    trackEvent,
    trackPageView: trackPageViewForced,
    trackProductView: trackProductViewForced,
    trackAddToCart: trackAddToCartForced,
    updateRealtimeActivity,
    flushEvents: async () => {}, // Não usado nesta versão
    setIsTracking
  };
};

