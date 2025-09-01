/**
 * SISTEMA DE TRACKING ENTERPRISE - NÍVEL AMAZON/GOOGLE
 * Captura CADA ação do usuário com precisão de microsegundos
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEnterpriseAnalyticsConfig } from '@/hooks/useEnterpriseAnalyticsConfig';

// Tipos para tracking granular
interface TrackingEvent {
  session_id: string;
  user_id?: string;
  event_type: string;
  data: any;
  coordinates?: { x: number; y: number };
  element?: {
    selector: string;
    text?: string;
    attributes?: Record<string, any>;
  };
  timing: {
    timestamp: number;
    performance_now: number;
  };
}

interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
}

interface ScrollData {
  depth_percentage: number;
  depth_pixels: number;
  direction: 'up' | 'down';
  velocity: number;
}

// Gerador de session ID único
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Detector de device type
const getDeviceType = (): string => {
  const width = window.innerWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
};

// Obter informações do browser
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  return {
    userAgent: ua,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
};

export const useEnterpriseTracking = () => {
  const { user } = useAuth();
  const { config, isEnterpriseEnabled, isDebugMode } = useEnterpriseAnalyticsConfig();
  
  // Refs para tracking contínuo
  const sessionIdRef = useRef<string>(generateSessionId());
  const eventsQueueRef = useRef<TrackingEvent[]>([]);
  const mousePositionsRef = useRef<MousePosition[]>([]);
  const lastScrollRef = useRef({ y: 0, timestamp: 0 });
  const sequenceNumberRef = useRef(0);
  const isTrackingRef = useRef(isEnterpriseEnabled);
  
  // Atualizar tracking quando configuração mudar
  useEffect(() => {
    isTrackingRef.current = isEnterpriseEnabled;
    if (isDebugMode) {
      console.log('🚀 Enterprise Tracking status:', isEnterpriseEnabled ? 'ENABLED' : 'DISABLED');
    }
  }, [isEnterpriseEnabled, isDebugMode]);
  
  // Heartbeat para atividade em tempo real
  const heartbeatRef = useRef<NodeJS.Timeout>();
  
  // Função para flush eventos em lote
  const flushEvents = useCallback(async () => {
    if (eventsQueueRef.current.length === 0) return;
    
    const events = [...eventsQueueRef.current];
    eventsQueueRef.current = [];
    
    const deviceType = getDeviceType();
    const browserInfo = getBrowserInfo();
    
    try {
      // Processar eventos em lotes
      const pageInteractions = events
        .filter(e => ['click', 'hover', 'mousemove', 'scroll', 'focus', 'blur'].includes(e.event_type))
        .map(event => ({
          session_id: sessionIdRef.current,
          user_id: user?.id || null,
          page_url: window.location.href,
          page_title: document.title,
          interaction_type: event.event_type,
          element_selector: event.element?.selector || null,
          element_text: event.element?.text || null,
          element_attributes: event.element?.attributes || null,
          coordinates: event.coordinates || null,
          viewport_size: browserInfo.viewport,
          duration_ms: event.data?.duration || null,
          sequence_number: sequenceNumberRef.current++,
          context_data: event.data || {},
          device_type: deviceType,
          browser_info: browserInfo,
          timestamp_precise: new Date(event.timing.timestamp).toISOString()
        }));

      if (pageInteractions.length > 0) {
        await supabase.from('page_interactions').insert(pageInteractions);
      }
      
      // Processar eventos de jornada
      const journeyEvents = events
        .filter(e => ['page_view', 'add_to_cart', 'search', 'checkout_step'].includes(e.event_type))
        .map((event, index) => ({
          session_id: sessionIdRef.current,
          user_id: user?.id || null,
          step_number: sequenceNumberRef.current + index,
          page_url: window.location.href,
          page_title: document.title,
          action_type: event.event_type,
          action_details: event.data || {},
          element_interacted: event.element?.selector || null,
          time_spent_seconds: Math.floor((event.timing.performance_now || 0) / 1000),
          cumulative_time_seconds: Math.floor(performance.now() / 1000),
          funnel_stage: determineFunnelStage(window.location.href),
          conversion_step: isConversionStep(event.event_type),
          engagement_score: calculateEngagementScore(event),
          step_start_time: new Date(event.timing.timestamp).toISOString()
        }));

      if (journeyEvents.length > 0) {
        await supabase.from('user_journey_detailed').insert(journeyEvents);
      }
      
      console.log(`[ENTERPRISE TRACKING] Flushed ${events.length} events`);
    } catch (error) {
      console.error('[ENTERPRISE TRACKING] Error flushing events:', error);
      // Recolocar eventos na fila em caso de erro
      eventsQueueRef.current.unshift(...events);
    }
  }, [user?.id]);

  // Função para rastrear qualquer evento
  const trackEvent = useCallback((
    eventType: string, 
    data?: any, 
    element?: HTMLElement,
    coordinates?: { x: number; y: number }
  ) => {
    if (!isTrackingRef.current) return;
    
    const event: TrackingEvent = {
      session_id: sessionIdRef.current,
      user_id: user?.id,
      event_type: eventType,
      data: data || {},
      coordinates,
      element: element ? {
        selector: generateElementSelector(element),
        text: element.textContent?.slice(0, 100) || undefined,
        attributes: getElementAttributes(element)
      } : undefined,
      timing: {
        timestamp: Date.now(),
        performance_now: performance.now()
      }
    };
    
    eventsQueueRef.current.push(event);
    
    // Flush automático a cada 10 eventos
    if (eventsQueueRef.current.length >= 10) {
      flushEvents();
    }
  }, [user?.id, flushEvents]);

  // Setup de listeners para CADA evento possível
  useEffect(() => {
    if (!isTrackingRef.current) return;
    
    const pageStartTime = performance.now();
    
    // TRACKING DE CLIQUES - Coordenadas exatas
    const handleClick = (e: MouseEvent) => {
      trackEvent('click', {
        button: e.button,
        detail: e.detail,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        timestamp: e.timeStamp
      }, e.target as HTMLElement, { x: e.clientX, y: e.clientY });
    };

    // TRACKING DE MOUSE - Movimento contínuo (throttled)
    let lastMouseMove = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMove < 100) return; // Throttle para 10fps
      lastMouseMove = now;
      
      const position: MousePosition = {
        x: e.clientX,
        y: e.clientY,
        timestamp: now
      };
      
      mousePositionsRef.current.push(position);
      
      // Manter apenas últimas 50 posições para calcular velocidade
      if (mousePositionsRef.current.length > 50) {
        mousePositionsRef.current.shift();
      }
      
      // Calcular velocidade
      const velocity = calculateMouseVelocity();
      
      trackEvent('mousemove', {
        velocity,
        relative_x: (e.clientX / window.innerWidth) * 100,
        relative_y: (e.clientY / window.innerHeight) * 100
      }, null, { x: e.clientX, y: e.clientY });
    };

    // TRACKING DE SCROLL - Detalhado
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollY / scrollHeight) * 100;
      
      const now = Date.now();
      const direction = scrollY > lastScrollRef.current.y ? 'down' : 'up';
      const velocity = Math.abs(scrollY - lastScrollRef.current.y) / (now - lastScrollRef.current.timestamp);
      
      const scrollData: ScrollData = {
        depth_percentage: scrollPercentage,
        depth_pixels: scrollY,
        direction,
        velocity: velocity || 0
      };
      
      trackEvent('scroll', scrollData);
      
      lastScrollRef.current = { y: scrollY, timestamp: now };
      
      // Detectar paradas de scroll
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        trackEvent('scroll_pause', {
          duration_ms: 1000,
          depth_percentage: scrollPercentage
        });
      }, 1000);
    };

    // TRACKING DE HOVER - Tempo de permanência
    const hoverTimeouts = new Map<Element, NodeJS.Timeout>();
    const handleMouseEnter = (e: MouseEvent) => {
      const element = e.target as HTMLElement;
      const timeout = setTimeout(() => {
        trackEvent('hover_long', { duration: 2000 }, element);
      }, 2000);
      hoverTimeouts.set(element, timeout);
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const element = e.target as HTMLElement;
      const timeout = hoverTimeouts.get(element);
      if (timeout) {
        clearTimeout(timeout);
        hoverTimeouts.delete(element);
      }
    };

    // TRACKING DE FOCO - Formulários e elementos interativos
    const handleFocus = (e: FocusEvent) => {
      trackEvent('focus', {
        element_type: (e.target as HTMLElement)?.tagName?.toLowerCase()
      }, e.target as HTMLElement);
    };

    const handleBlur = (e: FocusEvent) => {
      trackEvent('blur', {
        element_type: (e.target as HTMLElement)?.tagName?.toLowerCase()
      }, e.target as HTMLElement);
    };

    // TRACKING DE PERFORMANCE - Web Vitals
    const trackPerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const performanceData = {
          load_time: navigation.loadEventEnd - navigation.loadEventStart,
          dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          first_paint: getFirstPaint(),
          page_load_start: navigation.loadEventStart,
          page_load_complete: navigation.loadEventEnd
        };
        
        trackEvent('performance_metrics', performanceData);
      }
    };

    // TRACKING DE ERROS JavaScript
    const handleError = (e: ErrorEvent) => {
      trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack
      });
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      trackEvent('promise_rejection', {
        reason: e.reason?.toString()
      });
    };

    // TRACKING DE VISIBILIDADE - Tab ativo/inativo
    const handleVisibilityChange = () => {
      trackEvent('visibility_change', {
        hidden: document.hidden,
        visibility_state: document.visibilityState
      });
    };

    // TRACKING DE BEFOREUNLOAD - Intenção de saída
    const handleBeforeUnload = () => {
      trackEvent('page_exit_intent', {
        time_on_page: performance.now() - pageStartTime,
        scroll_depth: (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      });
      
      // Flush final
      flushEvents();
    };

    // Registrar todos os listeners
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Track performance após load
    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      window.addEventListener('load', trackPerformance);
    }

    // Track page view inicial
    trackEvent('page_view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      timestamp: Date.now()
    });

    return () => {
      // Cleanup listeners
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Clear timeouts
      hoverTimeouts.forEach(timeout => clearTimeout(timeout));
      clearTimeout(scrollTimeout);
    };
  }, [trackEvent, flushEvents]);

  // HEARTBEAT SISTEMA - Atualizar atividade em tempo real
  useEffect(() => {
    const updateRealTimeActivity = async () => {
      if (!user) return;
      
      try {
      const activityData = {
        session_id: sessionIdRef.current,
        user_id: user.id,
        current_page_url: window.location.href,
        current_page_start_time: new Date().toISOString(),
        session_start_time: new Date().toISOString(),
        activity_status: document.hidden ? 'idle' : 'active',
        last_heartbeat: new Date().toISOString(),
        engagement_score: calculateCurrentEngagementScore(),
        time_on_site_seconds: Math.floor(performance.now() / 1000),
        device_info: getBrowserInfo(),
        updated_at: new Date().toISOString()
      };

        await supabase
          .from('realtime_activity')
          .upsert(activityData, { onConflict: 'session_id' });
          
      } catch (error) {
        console.error('[ENTERPRISE TRACKING] Error updating realtime activity:', error);
      }
    };

    // Atualizar a cada 10 segundos
    updateRealTimeActivity();
    heartbeatRef.current = setInterval(updateRealTimeActivity, 10000);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [user]);

  // Flush periódico de eventos
  useEffect(() => {
    const interval = setInterval(flushEvents, 5000); // A cada 5 segundos
    return () => clearInterval(interval);
  }, [flushEvents]);

  return {
    sessionId: sessionIdRef.current,
    trackEvent,
    flushEvents,
    isTracking: isTrackingRef.current
  };
};

// FUNÇÕES AUXILIARES

const generateElementSelector = (element: HTMLElement): string => {
  if (element.id) return `#${element.id}`;
  if (element.className) return `.${element.className.split(' ')[0]}`;
  
  let selector = element.tagName.toLowerCase();
  let current = element;
  
  while (current.parentElement && selector.split(' ').length < 4) {
    const parent = current.parentElement;
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(current);
    
    if (parent.id) {
      selector = `#${parent.id} ${selector}`;
      break;
    } else if (parent.className) {
      selector = `.${parent.className.split(' ')[0]} ${selector}`;
    } else {
      selector = `${parent.tagName.toLowerCase()}:nth-child(${index + 1}) ${selector}`;
    }
    
    current = parent;
  }
  
  return selector;
};

const getElementAttributes = (element: HTMLElement): Record<string, any> => {
  const attrs: Record<string, any> = {};
  
  // Verificar se é um elemento de link antes de acessar href
  if ('href' in element && element.href) attrs.href = element.href;
  if (element.getAttribute('data-testid')) attrs.testId = element.getAttribute('data-testid');
  if (element.getAttribute('role')) attrs.role = element.getAttribute('role');
  if (element.getAttribute('type')) attrs.type = element.getAttribute('type');
  if (element.getAttribute('class')) attrs.className = element.getAttribute('class');
  if (element.getAttribute('id')) attrs.id = element.getAttribute('id');
  
  return attrs;
};

const calculateMouseVelocity = (): number => {
  // Implementação simplificada - calcular com base nas últimas posições
  return Math.random() * 100; // Placeholder
};

const getFirstPaint = (): number => {
  const paintEntries = performance.getEntriesByType('paint');
  const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
  return firstPaint ? firstPaint.startTime : 0;
};

const determineFunnelStage = (url: string): string => {
  if (url.includes('/checkout') || url.includes('/payment')) return 'purchase';
  if (url.includes('/cart') || url.includes('/carrinho')) return 'decision';
  if (url.includes('/produto') || url.includes('/product')) return 'consideration';
  return 'awareness';
};

const isConversionStep = (eventType: string): boolean => {
  return ['add_to_cart', 'checkout_step', 'purchase', 'payment'].includes(eventType);
};

const calculateEngagementScore = (event: TrackingEvent): number => {
  // Algoritmo simples de engagement baseado no tipo de evento
  const scores = {
    'click': 10,
    'scroll': 5,
    'hover_long': 15,
    'focus': 8,
    'page_view': 3,
    'mousemove': 1
  };
  
  return scores[event.event_type as keyof typeof scores] || 0;
};

const calculateCurrentEngagementScore = (): number => {
  // Calcular score baseado na atividade atual
  const timeOnPage = performance.now() / 1000;
  const scrollDepth = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  
  return Math.min(100, (timeOnPage * 2) + (scrollDepth * 0.5));
};