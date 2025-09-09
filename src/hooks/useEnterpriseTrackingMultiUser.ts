/**
 * ENTERPRISE TRACKING - VERSÃO MULTI-USUÁRIO
 * Sistema que rastreia TODOS os usuários (logados e anônimos) com IDs únicos
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseAnalyticsConfig } from '@/hooks/useEnterpriseAnalyticsConfig';

// Função para gerar ID único persistente
const generateUniqueUserId = (): string => {
  // Verificar se já existe um ID no localStorage
  let userId = localStorage.getItem('uti_user_id');
  
  if (!userId) {
    // Gerar novo ID único baseado em timestamp + random + browser fingerprint
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const fingerprint = btoa(navigator.userAgent + screen.width + screen.height).substr(0, 8);
    
    userId = `user_${timestamp}_${random}_${fingerprint}`;
    localStorage.setItem('uti_user_id', userId);
    
    console.log('🆔 [MULTI-USER] Generated new unique user ID:', userId);
  } else {
    console.log('🆔 [MULTI-USER] Using existing user ID:', userId);
  }
  
  return userId;
};

export const useEnterpriseTrackingMultiUser = () => {
  const { user } = useAuth();
  const { config } = useEnterpriseAnalyticsConfig();
  
  // ID único persistente para cada usuário (logado ou anônimo)
  const [uniqueUserId] = useState(() => generateUniqueUserId());
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isTracking, setIsTracking] = useState(true);
  
  const sequenceNumberRef = useRef(1);
  const sessionStartTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const pageStartTime = useRef(Date.now());
  const currentPageStepId = useRef<number | null>(null);
  const previousPageUrl = useRef<string>('');

  // FORÇAR inicialização da sessão para TODOS os usuários
  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('🚀 [MULTI-USER] Initializing session for user:', uniqueUserId);
        console.log('🚀 [MULTI-USER] Session ID:', sessionId);
        console.log('🚀 [MULTI-USER] Logged user:', user?.id || 'anonymous');
        
        // Criar entrada na tabela realtime_activity com ID único
        const { error: activityError } = await supabase
          .from('realtime_activity')
          .upsert({
            session_id: sessionId,
            user_id: uniqueUserId, // SEMPRE usar ID único, nunca null
            activity_status: 'active',
            current_page: window.location.href,
            last_heartbeat: new Date().toISOString(),
            time_on_site_seconds: 0,
            engagement_score: 0,
            device_info: {
              userAgent: navigator.userAgent,
              screen: { width: screen.width, height: screen.height },
              viewport: { width: window.innerWidth, height: window.innerHeight },
              logged_user_id: user?.id || null // Manter referência ao usuário logado se houver
            },
            location_info: {
              url: window.location.href,
              pathname: window.location.pathname,
              search: window.location.search
            }
          });

        if (activityError) {
          console.error('❌ [MULTI-USER] Error creating activity:', activityError);
        } else {
          console.log('✅ [MULTI-USER] Session initialized successfully for user:', uniqueUserId);
        }

        // Registrar primeira visualização de página
        await trackPageViewWithTime();
        
      } catch (error) {
        console.error('❌ [MULTI-USER] Error initializing session:', error);
      }
    };

    initializeSession();
  }, [sessionId, uniqueUserId, user?.id]);

  // Função para finalizar página anterior e calcular tempo gasto
  const finalizePreviousPage = useCallback(async () => {
    if (currentPageStepId.current && previousPageUrl.current) {
      try {
        const timeSpent = Math.floor((Date.now() - pageStartTime.current) / 1000);
        const now = new Date().toISOString();
        
        console.log(`⏱️ [MULTI-USER] User ${uniqueUserId}: Finalizing page ${previousPageUrl.current}, time: ${timeSpent}s`);

        // Atualizar o registro anterior com o tempo gasto
        const { error: updateError } = await supabase
          .from('user_journey_detailed')
          .update({
            step_end_time: now,
            time_spent_seconds: timeSpent
          })
          .eq('id', currentPageStepId.current);

        if (updateError) {
          console.error('❌ [MULTI-USER] Error updating previous page time:', updateError);
        } else {
          console.log(`✅ [MULTI-USER] User ${uniqueUserId}: Updated page time: ${timeSpent}s`);
        }
      } catch (error) {
        console.error('❌ [MULTI-USER] Error finalizing previous page:', error);
      }
    }
  }, [uniqueUserId]);

  // Função para rastrear visualização de página com tempo
  const trackPageViewWithTime = useCallback(async (url?: string) => {
    if (!isTracking || !config.enablePageTracking) return;

    try {
      // Finalizar página anterior se houver
      await finalizePreviousPage();

      const currentUrl = url || window.location.href;
      const now = new Date().toISOString();
      
      // Resetar timer da página
      pageStartTime.current = Date.now();
      
      console.log(`📄 [MULTI-USER] User ${uniqueUserId}: Tracking page view: ${currentUrl}`);

      // Inserir nova entrada na jornada detalhada
      const { data, error } = await supabase
        .from('user_journey_detailed')
        .insert({
          session_id: sessionId,
          user_id: uniqueUserId, // SEMPRE usar ID único
          step_number: sequenceNumberRef.current++,
          page_url: currentUrl,
          page_title: document.title,
          action_type: 'page_view',
          action_details: {
            referrer: document.referrer,
            timestamp: now,
            user_agent: navigator.userAgent,
            logged_user_id: user?.id || null
          },
          step_start_time: now,
          step_end_time: null, // Será preenchido quando sair da página
          time_spent_seconds: 0, // Será calculado quando sair
          cumulative_time_seconds: Math.floor((Date.now() - sessionStartTime.current) / 1000),
          funnel_stage: getFunnelStage(currentUrl),
          conversion_step: isConversionStep(currentUrl),
          engagement_score: 50 // Score inicial
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ [MULTI-USER] Error tracking page view:', error);
      } else {
        currentPageStepId.current = data.id;
        previousPageUrl.current = currentUrl;
        console.log(`✅ [MULTI-USER] User ${uniqueUserId}: Page view tracked with ID: ${data.id}`);
      }

      // Atualizar atividade em tempo real
      await updateRealtimeActivity();

    } catch (error) {
      console.error('❌ [MULTI-USER] Error in trackPageViewWithTime:', error);
    }
  }, [isTracking, config.enablePageTracking, sessionId, uniqueUserId, user?.id, finalizePreviousPage]);

  // Função para atualizar atividade em tempo real
  const updateRealtimeActivity = useCallback(async () => {
    try {
      const totalTimeOnSite = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      
      const { error } = await supabase
        .from('realtime_activity')
        .update({
          current_page: window.location.href,
          last_heartbeat: new Date().toISOString(),
          time_on_site_seconds: totalTimeOnSite,
          activity_status: 'active'
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('❌ [MULTI-USER] Error updating realtime activity:', error);
      } else {
        console.log(`💓 [MULTI-USER] User ${uniqueUserId}: Heartbeat updated, total time: ${totalTimeOnSite}s`);
      }
    } catch (error) {
      console.error('❌ [MULTI-USER] Error in updateRealtimeActivity:', error);
    }
  }, [sessionId, uniqueUserId]);

  // Função para rastrear visualização de produto
  const trackProductView = useCallback(async (productId: string, productData?: any) => {
    if (!isTracking || !config.enableProductTracking) return;

    try {
      console.log(`🛍️ [MULTI-USER] User ${uniqueUserId}: Tracking product view: ${productId}`);

      // Inserir na jornada detalhada
      const { error: journeyError } = await supabase
        .from('user_journey_detailed')
        .insert({
          session_id: sessionId,
          user_id: uniqueUserId,
          step_number: sequenceNumberRef.current++,
          page_url: window.location.href,
          page_title: document.title,
          action_type: 'product_view',
          action_details: {
            product_id: productId,
            product_data: productData,
            timestamp: new Date().toISOString(),
            logged_user_id: user?.id || null
          },
          step_start_time: new Date().toISOString(),
          funnel_stage: 'product_discovery',
          conversion_step: false,
          engagement_score: 70
        });

      // Inserir nas interações de página
      const { error: interactionError } = await supabase
        .from('page_interactions')
        .insert({
          session_id: sessionId,
          user_id: uniqueUserId,
          page_url: window.location.href,
          interaction_type: 'product_view',
          element_details: {
            product_id: productId,
            product_data: productData,
            logged_user_id: user?.id || null
          },
          timestamp_precise: new Date().toISOString()
        });

      if (journeyError || interactionError) {
        console.error('❌ [MULTI-USER] Error tracking product view:', { journeyError, interactionError });
      } else {
        console.log(`✅ [MULTI-USER] User ${uniqueUserId}: Product view tracked: ${productId}`);
      }
    } catch (error) {
      console.error('❌ [MULTI-USER] Error in trackProductView:', error);
    }
  }, [isTracking, config.enableProductTracking, sessionId, uniqueUserId, user?.id]);

  // Função para rastrear adição ao carrinho
  const trackAddToCart = useCallback(async (productId: string, quantity: number = 1, price?: number) => {
    if (!isTracking || !config.enableCartTracking) return;

    try {
      console.log(`🛒 [MULTI-USER] User ${uniqueUserId}: Tracking add to cart: ${productId} x${quantity}`);

      const { error } = await supabase
        .from('user_journey_detailed')
        .insert({
          session_id: sessionId,
          user_id: uniqueUserId,
          step_number: sequenceNumberRef.current++,
          page_url: window.location.href,
          page_title: document.title,
          action_type: 'add_to_cart',
          action_details: {
            product_id: productId,
            quantity: quantity,
            price: price,
            timestamp: new Date().toISOString(),
            logged_user_id: user?.id || null
          },
          step_start_time: new Date().toISOString(),
          funnel_stage: 'purchase_intent',
          conversion_step: true,
          engagement_score: 90
        });

      if (error) {
        console.error('❌ [MULTI-USER] Error tracking add to cart:', error);
      } else {
        console.log(`✅ [MULTI-USER] User ${uniqueUserId}: Add to cart tracked: ${productId}`);
      }
    } catch (error) {
      console.error('❌ [MULTI-USER] Error in trackAddToCart:', error);
    }
  }, [isTracking, config.enableCartTracking, sessionId, uniqueUserId, user?.id]);

  // Função para rastrear compra
  const trackPurchase = useCallback(async (orderData: any) => {
    if (!isTracking || !config.enablePurchaseTracking) return;

    try {
      console.log(`💳 [MULTI-USER] User ${uniqueUserId}: Tracking purchase:`, orderData);

      const { error } = await supabase
        .from('user_journey_detailed')
        .insert({
          session_id: sessionId,
          user_id: uniqueUserId,
          step_number: sequenceNumberRef.current++,
          page_url: window.location.href,
          page_title: document.title,
          action_type: 'purchase',
          action_details: {
            ...orderData,
            timestamp: new Date().toISOString(),
            logged_user_id: user?.id || null
          },
          step_start_time: new Date().toISOString(),
          funnel_stage: 'purchase',
          conversion_step: true,
          engagement_score: 100
        });

      if (error) {
        console.error('❌ [MULTI-USER] Error tracking purchase:', error);
      } else {
        console.log(`✅ [MULTI-USER] User ${uniqueUserId}: Purchase tracked`);
      }
    } catch (error) {
      console.error('❌ [MULTI-USER] Error in trackPurchase:', error);
    }
  }, [isTracking, config.enablePurchaseTracking, sessionId, uniqueUserId, user?.id]);

  // Heartbeat automático a cada 10 segundos
  useEffect(() => {
    if (!isTracking) return;

    const heartbeatInterval = setInterval(() => {
      updateRealtimeActivity();
    }, 10000);

    return () => clearInterval(heartbeatInterval);
  }, [isTracking, updateRealtimeActivity]);

  // Finalizar sessão ao sair da página
  useEffect(() => {
    const handleBeforeUnload = async () => {
      await finalizePreviousPage();
      
      // Marcar sessão como inativa
      await supabase
        .from('realtime_activity')
        .update({
          activity_status: 'inactive',
          last_heartbeat: new Date().toISOString()
        })
        .eq('session_id', sessionId);
        
      console.log(`👋 [MULTI-USER] User ${uniqueUserId}: Session ended`);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBeforeUnload();
      } else {
        updateRealtimeActivity();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, uniqueUserId, finalizePreviousPage, updateRealtimeActivity]);

  // Rastrear mudanças de página (SPA)
  useEffect(() => {
    trackPageViewWithTime();
  }, [window.location.pathname]);

  return {
    uniqueUserId,
    sessionId,
    isTracking,
    setIsTracking,
    trackPageView: trackPageViewWithTime,
    trackProductView,
    trackAddToCart,
    trackPurchase,
    updateRealtimeActivity
  };
};

// Funções auxiliares
const getFunnelStage = (url: string): string => {
  if (url.includes('/product/') || url.includes('/p/')) return 'product_discovery';
  if (url.includes('/cart') || url.includes('/carrinho')) return 'purchase_intent';
  if (url.includes('/checkout') || url.includes('/pagamento')) return 'purchase';
  if (url.includes('/playstation') || url.includes('/xbox') || url.includes('/nintendo')) return 'category_browse';
  return 'awareness';
};

const isConversionStep = (url: string): boolean => {
  return url.includes('/cart') || url.includes('/checkout') || url.includes('/purchase') || 
         url.includes('/carrinho') || url.includes('/pagamento') || url.includes('/compra');
};

