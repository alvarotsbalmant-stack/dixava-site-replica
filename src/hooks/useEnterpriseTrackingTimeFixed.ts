/**
 * ENTERPRISE TRACKING - VERSÃO COM TEMPO CORRIGIDO
 * Sistema que CALCULA E SALVA o tempo real gasto em cada página
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseAnalyticsConfig } from '@/hooks/useEnterpriseAnalyticsConfig';

export const useEnterpriseTrackingTimeFixed = () => {
  const { user } = useAuth();
  const { config } = useEnterpriseAnalyticsConfig();
  
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isTracking, setIsTracking] = useState(true);
  
  const sequenceNumberRef = useRef(1);
  const sessionStartTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const pageStartTime = useRef(Date.now());
  const currentPageStepId = useRef<number | null>(null);
  const previousPageUrl = useRef<string>('');

  // FORÇAR inicialização da sessão
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('🚀 [TIME FIXED] Initializing session:', sessionId);
        
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
          console.error('❌ [TIME FIXED] Error creating activity:', activityError);
        } else {
          console.log('✅ [TIME FIXED] Session initialized successfully');
        }

        // Registrar primeira visualização de página
        await trackPageViewWithTime();
        
      } catch (error) {
        console.error('❌ [TIME FIXED] Error initializing session:', error);
      }
    };

    initializeSession();
  }, [sessionId, user?.id]);

  // Função para finalizar página anterior e calcular tempo gasto
  const finalizePreviousPage = useCallback(async () => {
    if (currentPageStepId.current && previousPageUrl.current) {
      try {
        const timeSpent = Math.floor((Date.now() - pageStartTime.current) / 1000);
        const now = new Date().toISOString();
        
        console.log(`⏱️ [TIME FIXED] Finalizing previous page: ${previousPageUrl.current}, time spent: ${timeSpent}s`);

        // Atualizar o registro anterior com o tempo gasto
        const { error: updateError } = await supabase
          .from('user_journey_detailed')
          .update({
            time_spent_seconds: timeSpent,
            step_end_time: now
          })
          .eq('session_id', sessionId)
          .eq('step_number', currentPageStepId.current);

        if (updateError) {
          console.error('❌ [TIME FIXED] Error updating previous page time:', updateError);
        } else {
          console.log(`✅ [TIME FIXED] Updated previous page time: ${timeSpent}s`);
        }
      } catch (error) {
        console.error('❌ [TIME FIXED] Error in finalizePreviousPage:', error);
      }
    }
  }, [sessionId]);

  // TRACKING de page view com cálculo de tempo
  const trackPageViewWithTime = useCallback(async () => {
    try {
      // Finalizar página anterior se existir
      await finalizePreviousPage();

      const now = new Date().toISOString();
      const currentStepNumber = sequenceNumberRef.current++;
      
      // Resetar timer da página atual
      pageStartTime.current = Date.now();
      currentPageStepId.current = currentStepNumber;
      previousPageUrl.current = window.location.href;
      
      console.log('📄 [TIME FIXED] Tracking page view:', window.location.href);

      // Inserir novo registro (tempo será calculado quando sair da página)
      const { error: journeyError } = await supabase
        .from('user_journey_detailed')
        .insert({
          session_id: sessionId,
          user_id: user?.id || null,
          step_number: currentStepNumber,
          page_url: window.location.href,
          page_title: document.title,
          action_type: 'page_view',
          action_details: {
            referrer: document.referrer,
            timestamp: now,
            entry_time: now
          },
          time_spent_seconds: 0, // Será atualizado quando sair da página
          cumulative_time_seconds: Math.floor((Date.now() - sessionStartTime.current) / 1000),
          funnel_stage: determineFunnelStage(window.location.href),
          conversion_step: false,
          engagement_score: 50,
          step_start_time: now,
          step_end_time: null // Será preenchido quando sair da página
        });

      if (journeyError) {
        console.error('❌ [TIME FIXED] Error tracking page view:', journeyError);
      } else {
        console.log('✅ [TIME FIXED] Page view tracked successfully');
      }

      // Atualizar atividade em tempo real
      await updateRealtimeActivity();
      
    } catch (error) {
      console.error('❌ [TIME FIXED] Error in trackPageViewWithTime:', error);
    }
  }, [sessionId, user?.id, finalizePreviousPage]);

  // TRACKING de produto com tempo na página
  const trackProductViewWithTime = useCallback(async (productId: string, productData?: any) => {
    try {
      const now = new Date().toISOString();
      const timeOnCurrentPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
      
      console.log('🛍️ [TIME FIXED] Tracking product view:', productId, `(${timeOnCurrentPage}s on page)`);

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
            timestamp: now,
            time_on_page_when_viewed: timeOnCurrentPage
          },
          time_spent_seconds: timeOnCurrentPage, // Tempo gasto na página até ver o produto
          cumulative_time_seconds: Math.floor((Date.now() - sessionStartTime.current) / 1000),
          funnel_stage: 'product_discovery',
          conversion_step: true,
          engagement_score: 70,
          step_start_time: now,
          step_end_time: now
        });

      if (journeyError) {
        console.error('❌ [TIME FIXED] Error tracking product view:', journeyError);
      } else {
        console.log('✅ [TIME FIXED] Product view tracked successfully');
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
            product_data: productData,
            time_on_page: timeOnCurrentPage
          },
          device_type: getDeviceType(),
          timestamp_precise: now
        });

      if (interactionError) {
        console.error('❌ [TIME FIXED] Error tracking product interaction:', interactionError);
      }

      await updateRealtimeActivity();
      
    } catch (error) {
      console.error('❌ [TIME FIXED] Error in trackProductViewWithTime:', error);
    }
  }, [sessionId, user?.id]);

  // TRACKING de carrinho com tempo
  const trackAddToCartWithTime = useCallback(async (productId: string, quantity: number, price: number) => {
    try {
      const now = new Date().toISOString();
      const timeOnCurrentPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
      
      console.log('🛒 [TIME FIXED] Tracking add to cart:', productId, `(${timeOnCurrentPage}s on page)`);

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
            timestamp: now,
            time_on_page_when_added: timeOnCurrentPage
          },
          time_spent_seconds: timeOnCurrentPage,
          cumulative_time_seconds: Math.floor((Date.now() - sessionStartTime.current) / 1000),
          funnel_stage: 'consideration',
          conversion_step: true,
          engagement_score: 85,
          step_start_time: now,
          step_end_time: now
        });

      if (journeyError) {
        console.error('❌ [TIME FIXED] Error tracking add to cart:', journeyError);
      } else {
        console.log('✅ [TIME FIXED] Add to cart tracked successfully');
      }

      await updateRealtimeActivity();
      
    } catch (error) {
      console.error('❌ [TIME FIXED] Error in trackAddToCartWithTime:', error);
    }
  }, [sessionId, user?.id]);

  // Atualizar atividade em tempo real com tempo acumulado
  const updateRealtimeActivity = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      const totalTimeOnSite = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      lastActivityTime.current = Date.now();
      
      const { error } = await supabase
        .from('realtime_activity')
        .upsert({
          session_id: sessionId,
          user_id: user?.id || null,
          activity_status: 'active',
          current_page: window.location.href,
          last_heartbeat: now,
          time_on_site_seconds: totalTimeOnSite, // TEMPO REAL ACUMULADO
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
        console.error('❌ [TIME FIXED] Error updating realtime activity:', error);
      } else {
        console.log(`✅ [TIME FIXED] Updated realtime activity: ${totalTimeOnSite}s total`);
      }
    } catch (error) {
      console.error('❌ [TIME FIXED] Error in updateRealtimeActivity:', error);
    }
  }, [sessionId, user?.id]);

  // Heartbeat automático que atualiza tempo
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      updateRealtimeActivity();
    }, 10000); // A cada 10 segundos para ser mais preciso

    return () => clearInterval(heartbeatInterval);
  }, [updateRealtimeActivity]);

  // Finalizar página quando o componente é desmontado ou página muda
  useEffect(() => {
    const handleBeforeUnload = () => {
      finalizePreviousPage();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        finalizePreviousPage();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      finalizePreviousPage(); // Finalizar ao desmontar
    };
  }, [finalizePreviousPage]);

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
    console.log(`🎯 [TIME FIXED] Tracking event: ${eventType}`, data);
    
    switch (eventType) {
      case 'page_view':
        await trackPageViewWithTime();
        break;
      case 'product_view':
        if (data?.productId) {
          await trackProductViewWithTime(data.productId, data);
        }
        break;
      case 'add_to_cart':
        if (data?.productId) {
          await trackAddToCartWithTime(data.productId, data.quantity || 1, data.price || 0);
        }
        break;
      default:
        // Outros eventos
        await updateRealtimeActivity();
    }
  }, [trackPageViewWithTime, trackProductViewWithTime, trackAddToCartWithTime, updateRealtimeActivity]);

  return {
    sessionId,
    isTracking,
    trackEvent,
    trackPageView: trackPageViewWithTime,
    trackProductView: trackProductViewWithTime,
    trackAddToCart: trackAddToCartWithTime,
    updateRealtimeActivity,
    flushEvents: async () => {}, // Não usado nesta versão
    setIsTracking
  };
};

