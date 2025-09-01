/**
 * HOOK ENTERPRISE ANALYTICS - Sistema avançado de analytics
 * Utiliza dados granulares do novo sistema de tracking
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EnterpriseSessionData {
  session_id: string;
  user_id?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  device_type: string;
  browser: string;
  pages_visited: Array<{
    url: string;
    title: string;
    entered_at: string;
    exited_at?: string;
    time_on_page: number;
    scroll_percentage: number;
    clicks: number;
  }>;
  products_viewed: Array<{
    product_id: string;
    product_name: string;
    timestamp: string;
    view_duration: number;
  }>;
  cart_events: Array<{
    action: 'add' | 'remove';
    product_id: string;
    timestamp: string;
  }>;
  purchases: Array<{
    order_id: string;
    value: number;
    timestamp: string;
  }>;
  conversion_score: number;
  churn_risk: number;
}

export interface EnterpriseMetrics {
  real_time_users: number;
  conversion_rate_today: number;
  avg_session_duration: number;
  bounce_rate: number;
  cart_abandonment_rate: number;
  revenue_today: number;
  top_pages: Array<{
    url: string;
    title: string;
    views: number;
    avg_time: number;
    conversion_rate: number;
  }>;
  user_flows: Array<{
    path: string;
    frequency: number;
    conversion_rate: number;
    revenue: number;
  }>;
  friction_points: Array<{
    page: string;
    issue: string;
    severity: number;
    affected_sessions: number;
  }>;
}

export interface CustomerProfile {
  user_id: string;
  email?: string;
  first_seen: string;
  last_seen: string;
  total_sessions: number;
  total_time_spent: number;
  lifetime_value: number;
  behavior_segment: string;
  favorite_products: Array<{
    product_id: string;
    product_name: string;
    views: number;
    purchases: number;
  }>;
  journey_timeline: Array<{
    timestamp: string;
    action: string;
    details: any;
  }>;
  conversion_funnel: {
    awareness: number;
    consideration: number;
    decision: number;
    purchase: number;
  };
}

export const useEnterpriseAnalytics = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Métricas em tempo real
  const getRealTimeMetrics = useCallback(async (): Promise<EnterpriseMetrics | null> => {
    if (!isAdmin) return null;
    
    setLoading(true);
    setError(null);

    try {
      // Buscar alertas em tempo real
      const { data: realTimeData, error: rtError } = await supabase.rpc('get_real_time_alerts');
      if (rtError) throw rtError;

      // Buscar análise de fricção
      const { data: frictionData, error: frictionError } = await supabase.rpc('get_friction_points_analysis');
      if (frictionError) throw frictionError;

      // Buscar rotas de conversão
      const { data: routesData, error: routesError } = await supabase.rpc('get_conversion_routes_analysis');
      if (routesError) throw routesError;

      const realTimeDataParsed = typeof realTimeData === 'string' ? JSON.parse(realTimeData) : realTimeData;
      const metrics = realTimeDataParsed?.current_metrics || {};
      const frictionDataParsed = typeof frictionData === 'string' ? JSON.parse(frictionData) : frictionData;
      const routesDataParsed = Array.isArray(routesData) ? routesData : (typeof routesData === 'string' ? JSON.parse(routesData) : []);
      
      return {
        real_time_users: metrics.active_users || 0,
        conversion_rate_today: metrics.conversion_rate_24h || 0,
        avg_session_duration: 0, // Será calculado
        bounce_rate: 0, // Será calculado
        cart_abandonment_rate: 0, // Será calculado
        revenue_today: 0, // Será calculado
        top_pages: [], // Será preenchido
        user_flows: routesDataParsed || [],
        friction_points: frictionDataParsed?.friction_points || []
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar métricas em tempo real');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Perfil detalhado do cliente
  const getCustomerProfile = useCallback(async (sessionId: string): Promise<CustomerProfile | null> => {
    if (!isAdmin) return null;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_user_complete_journey', {
        p_session_id: sessionId,
        p_include_interactions: true
      });

      if (error) throw error;
      if (!data) return null;

      const dataParsed = typeof data === 'string' ? JSON.parse(data) : data;
      const session = dataParsed.session_summary || {};
      const journey = dataParsed.journey_steps || [];
      const interactions = dataParsed.interactions || [];

      // Buscar score de conversão preditivo
      const { data: conversionData } = await supabase.rpc('get_predictive_conversion_score', {
        p_session_id: sessionId
      });

      // Buscar histórico de sessões do usuário
      let userSessions = [];
      if (session.user_id) {
        const { data: sessionsData } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', session.user_id)
          .order('started_at', { ascending: false });
        userSessions = sessionsData || [];
      }

      // Processar produtos favoritos
      const productViews = new Map();
      const productPurchases = new Map();

      journey.forEach((step: any) => {
        if (step.action_type === 'product_view' && step.action_details?.product_id) {
          const productId = step.action_details.product_id;
          productViews.set(productId, (productViews.get(productId) || 0) + 1);
        }
        if (step.action_type === 'purchase' && step.action_details?.items) {
          step.action_details.items.forEach((item: any) => {
            const productId = item.product_id;
            productPurchases.set(productId, (productPurchases.get(productId) || 0) + item.quantity);
          });
        }
      });

      const favoriteProducts = Array.from(productViews.entries()).map(([productId, views]) => ({
        product_id: productId,
        product_name: 'Produto', // Buscar nome real se necessário
        views: views as number,
        purchases: productPurchases.get(productId) || 0
      }));

      // Timeline da jornada
      const timeline = journey.map((step: any) => ({
        timestamp: step.step_start_time,
        action: step.action_type,
        details: {
          page: step.page_title,
          url: step.page_url,
          time_spent: step.time_spent_seconds,
          ...step.action_details
        }
      }));

      // Funil de conversão
      const funnelStages = { awareness: 0, consideration: 0, decision: 0, purchase: 0 };
      journey.forEach((step: any) => {
        if (step.funnel_stage) {
          funnelStages[step.funnel_stage as keyof typeof funnelStages]++;
        }
      });

      return {
        user_id: session.user_id || sessionId,
        email: undefined, // Seria necessário buscar na tabela de profiles
        first_seen: session.started_at,
        last_seen: session.ended_at || session.started_at,
        total_sessions: userSessions.length,
        total_time_spent: userSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0),
        lifetime_value: userSessions.reduce((sum, s) => sum + (s.purchase_value || 0), 0),
        behavior_segment: 'Regular', // Implementar segmentação
        favorite_products: favoriteProducts,
        journey_timeline: timeline,
        conversion_funnel: funnelStages
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar perfil do cliente');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Análise comportamental avançada
  const getBehavioralSegmentation = useCallback(async (startDate: Date, endDate: Date) => {
    if (!isAdmin) return null;
    
    try {
      const { data, error } = await supabase.rpc('get_behavioral_segmentation', {
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0]
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar segmentação comportamental');
      return null;
    }
  }, [isAdmin]);

  // Análise de abandono por setor
  const getAbandonmentAnalysis = useCallback(async (startDate: Date, endDate: Date) => {
    if (!isAdmin) return null;
    
    try {
      const { data, error } = await supabase.rpc('get_abandonment_analysis_by_sector', {
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0]
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar análise de abandono');
      return null;
    }
  }, [isAdmin]);

  // Predição de churn
  const getChurnPrediction = useCallback(async (userId?: string, riskThreshold = 0.7) => {
    if (!isAdmin) return null;
    
    try {
      const { data, error } = await supabase.rpc('get_churn_prediction', {
        p_user_id: userId || null,
        p_risk_threshold: riskThreshold
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar predição de churn');
      return null;
    }
  }, [isAdmin]);

  // Heatmap de dados enterprise
  const getHeatmapData = useCallback(async (pageUrl: string, startDate: Date, endDate: Date, interactionType = 'click') => {
    if (!isAdmin) return null;
    
    try {
      const { data, error } = await supabase.rpc('get_heatmap_enterprise_data', {
        p_page_url: pageUrl,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0],
        p_interaction_type: interactionType
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados de heatmap');
      return null;
    }
  }, [isAdmin]);

  return {
    loading,
    error,
    setError,
    getRealTimeMetrics,
    getCustomerProfile,
    getBehavioralSegmentation,
    getAbandonmentAnalysis,
    getChurnPrediction,
    getHeatmapData
  };
};