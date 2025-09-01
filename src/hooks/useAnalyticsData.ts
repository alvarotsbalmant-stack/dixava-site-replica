import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAnalyticsConfig } from '@/hooks/useAnalyticsConfig';
import { 
  getMockDashboardData, 
  getMockProductAnalytics, 
  getMockCustomerSegments, 
  getMockTrafficAnalytics 
} from '@/data/mockAnalyticsData';

export interface DashboardAnalytics {
  total_revenue: number;
  total_sessions: number;
  total_purchases: number;
  avg_conversion_rate: number;
  avg_order_value: number;
  cart_abandonment_rate: number;
  whatsapp_clicks: number;
  period_data: Array<{
    date: string;
    revenue: number;
    sessions: number;
    purchases: number;
    conversion_rate: number;
  }>;
}

export interface ProductAnalytics {
  product_id: string;
  product_name: string;
  total_views: number;
  total_add_to_cart: number;
  total_purchases: number;
  total_revenue: number;
  avg_conversion_rate: number;
  whatsapp_clicks: number;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  avg_order_value: number;
  total_revenue: number;
}

export interface TrafficAnalytics {
  source: string;
  sessions: number;
  conversions: number;
  conversion_rate: number;
  revenue: number;
}

interface AnalyticsFilters {
  startDate: Date;
  endDate: Date;
  compareWith?: {
    startDate: Date;
    endDate: Date;
  };
}

export const useAnalyticsData = () => {
  const { user, isAdmin } = useAuth();
  const { showMockData } = useAnalyticsConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [dashboardData, setDashboardData] = useState<DashboardAnalytics | null>(null);
  const [topProducts, setTopProducts] = useState<ProductAnalytics[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficAnalytics[]>([]);

  // Função para buscar analytics do dashboard
  const fetchDashboardAnalytics = useCallback(async (filters: AnalyticsFilters) => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);

    try {
      if (showMockData) {
        // Usar dados mock quando habilitado
        const mockData = getMockDashboardData();
        setDashboardData(mockData);
      } else {
        // Buscar dados reais do banco
        console.log('🔍 Fetching real dashboard data from:', filters.startDate.toISOString().split('T')[0], 'to', filters.endDate.toISOString().split('T')[0]);
        
        const { data, error } = await supabase.rpc('get_dashboard_analytics', {
          start_date: filters.startDate.toISOString().split('T')[0],
          end_date: filters.endDate.toISOString().split('T')[0]
        });

        if (error) {
          console.error('❌ Error fetching dashboard analytics:', error);
          throw error;
        }
        
        console.log('📊 Raw dashboard data received:', data);
        
        // A função retorna um array com uma linha
        const rawData = Array.isArray(data) ? data[0] : data;
        
        if (!rawData) {
          throw new Error('Nenhum dado retornado pela função de analytics');
        }

        // Processar period_data se necessário
        let processedPeriodData: Array<{
          date: string;
          revenue: number;
          sessions: number;
          purchases: number;
          conversion_rate: number;
        }> = [];

        if (rawData.period_data) {
          if (typeof rawData.period_data === 'string') {
            try {
              const parsed = JSON.parse(rawData.period_data);
              if (Array.isArray(parsed)) {
                processedPeriodData = parsed.map((item: any) => ({
                  date: String(item.date || ''),
                  revenue: Number(item.revenue) || 0,
                  sessions: Number(item.sessions) || 0,
                  purchases: Number(item.purchases) || 0,
                  conversion_rate: Number(item.conversion_rate) || 0
                }));
              }
            } catch (e) {
              console.error('Erro ao parsear period_data:', e);
              processedPeriodData = [];
            }
          } else if (Array.isArray(rawData.period_data)) {
            processedPeriodData = rawData.period_data.map((item: any) => ({
              date: String(item.date || ''),
              revenue: Number(item.revenue) || 0,
              sessions: Number(item.sessions) || 0,
              purchases: Number(item.purchases) || 0,
              conversion_rate: Number(item.conversion_rate) || 0
            }));
          }
        }

        const processedData: DashboardAnalytics = {
          total_revenue: Number(rawData.total_revenue) || 0,
          total_sessions: Number(rawData.total_sessions) || 0,
          total_purchases: Number(rawData.total_purchases) || 0,
          avg_conversion_rate: Number(rawData.avg_conversion_rate) || 0,
          avg_order_value: Number(rawData.avg_order_value) || 0,
          cart_abandonment_rate: Number(rawData.cart_abandonment_rate) || 0,
          whatsapp_clicks: Number(rawData.whatsapp_clicks) || 0,
          period_data: processedPeriodData
        };

        console.log('✅ Processed dashboard data:', processedData);
        setDashboardData(processedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showMockData]);

  // Função para buscar top produtos
  const fetchTopProducts = useCallback(async (filters: AnalyticsFilters, limit = 10) => {
    if (!isAdmin) return;

    try {
      if (showMockData) {
        // Usar dados mock quando habilitado
        const mockData = getMockProductAnalytics();
        setTopProducts(mockData.slice(0, limit));
      } else {
        // Buscar dados reais do banco
        console.log('🔍 Fetching top products analytics for limit:', limit);
        
        const { data, error } = await supabase.rpc('get_top_products_analytics', {
          start_date: filters.startDate.toISOString().split('T')[0],
          end_date: filters.endDate.toISOString().split('T')[0],
          limit_count: limit
        });

        if (error) {
          console.error('❌ Error fetching products analytics:', error);
          throw error;
        }
        
        console.log('📊 Raw products data received:', data);
        
        const processedProducts: ProductAnalytics[] = (data || []).map((item: any) => ({
          product_id: String(item.product_id),
          product_name: String(item.product_name || 'Produto sem nome'),
          total_views: Number(item.total_views) || 0,
          total_add_to_cart: Number(item.total_add_to_cart) || 0,
          total_purchases: Number(item.total_purchases) || 0,
          total_revenue: Number(item.total_revenue) || 0,
          avg_conversion_rate: Number(item.avg_conversion_rate) || 0,
          whatsapp_clicks: Number(item.whatsapp_clicks) || 0
        }));

        console.log('✅ Processed products data:', processedProducts);
        setTopProducts(processedProducts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados de produtos');
    }
  }, [isAdmin, showMockData]);

  // Função para buscar segmentação de clientes
  const fetchCustomerSegments = useCallback(async (filters: AnalyticsFilters) => {
    if (!isAdmin) return;

    try {
      if (showMockData) {
        // Usar dados mock quando habilitado
        const mockData = getMockCustomerSegments();
        setCustomerSegments(mockData);
      } else {
        // Buscar dados reais do banco
        const { data, error } = await supabase
          .from('customer_ltv')
          .select('segment, total_spent, total_purchases')
          .not('segment', 'is', null);

        if (error) throw error;

        // Processar dados de segmentação
        const segmentMap = new Map();
        let totalCustomers = 0;

        data?.forEach(customer => {
          const segment = customer.segment || 'unknown';
          if (!segmentMap.has(segment)) {
            segmentMap.set(segment, {
              count: 0,
              total_revenue: 0,
              total_orders: 0
            });
          }

          const segmentData = segmentMap.get(segment);
          segmentData.count++;
          segmentData.total_revenue += customer.total_spent || 0;
          segmentData.total_orders += customer.total_purchases || 0;
          totalCustomers++;
        });

        const segments: CustomerSegment[] = Array.from(segmentMap.entries()).map(([segment, data]) => ({
          segment,
          count: data.count,
          percentage: totalCustomers > 0 ? (data.count / totalCustomers) * 100 : 0,
          avg_order_value: data.total_orders > 0 ? data.total_revenue / data.total_orders : 0,
          total_revenue: data.total_revenue
        }));

        setCustomerSegments(segments);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar segmentação de clientes');
    }
  }, [isAdmin, showMockData]);

  // Função para buscar dados de tráfego
  const fetchTrafficAnalytics = useCallback(async (filters: AnalyticsFilters) => {
    if (!isAdmin) return;

    try {
      if (showMockData) {
        // Usar dados mock quando habilitado
        const mockData = getMockTrafficAnalytics();
        setTrafficData(mockData);
      } else {
        // Buscar dados reais do banco
        const { data, error } = await supabase
          .from('user_sessions')
          .select('traffic_source, converted, purchase_value')
          .gte('started_at', filters.startDate.toISOString())
          .lte('started_at', filters.endDate.toISOString());

        if (error) throw error;

        // Processar dados de tráfego
        const trafficMap = new Map();

        data?.forEach(session => {
          const source = session.traffic_source || 'unknown';
          if (!trafficMap.has(source)) {
            trafficMap.set(source, {
              sessions: 0,
              conversions: 0,
              revenue: 0
            });
          }

          const trafficData = trafficMap.get(source);
          trafficData.sessions++;
          if (session.converted) {
            trafficData.conversions++;
            trafficData.revenue += session.purchase_value || 0;
          }
        });

        const traffic: TrafficAnalytics[] = Array.from(trafficMap.entries()).map(([source, data]) => ({
          source,
          sessions: data.sessions,
          conversions: data.conversions,
          conversion_rate: data.sessions > 0 ? (data.conversions / data.sessions) * 100 : 0,
          revenue: data.revenue
        }));

        setTrafficData(traffic.sort((a, b) => b.sessions - a.sessions));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados de tráfego');
    }
  }, [isAdmin, showMockData]);

  // Função para buscar eventos de um período
  const fetchRawEvents = useCallback(async (filters: AnalyticsFilters, eventType?: string) => {
    if (!isAdmin) return [];

    try {
      let query = supabase
        .from('customer_events')
        .select('*')
        .gte('created_at', filters.startDate.toISOString())
        .lte('created_at', filters.endDate.toISOString())
        .order('created_at', { ascending: false });

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error } = await query.limit(1000);

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar eventos');
      return [];
    }
  }, [isAdmin]);

  // Função para buscar heatmap de horários
  const fetchTimeHeatmap = useCallback(async (filters: AnalyticsFilters) => {
    if (!isAdmin) return [];

    try {
      const { data, error } = await supabase
        .from('customer_events')
        .select('created_at, event_type')
        .gte('created_at', filters.startDate.toISOString())
        .lte('created_at', filters.endDate.toISOString());

      if (error) throw error;

      // Processar dados para heatmap (hora vs dia da semana)
      const heatmapData = Array.from({ length: 7 }, () => Array(24).fill(0));
      
      data?.forEach(event => {
        const date = new Date(event.created_at);
        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        heatmapData[dayOfWeek][hour]++;
      });

      return heatmapData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar heatmap');
      return [];
    }
  }, [isAdmin]);

  // Função para exportar dados
  const exportData = useCallback(async (filters: AnalyticsFilters, format: 'csv' | 'json') => {
    if (!isAdmin) return;

    try {
      // Buscar todos os dados necessários
      const events = await fetchRawEvents(filters);
      const dashboard = dashboardData;
      const products = topProducts;

      const exportData = {
        summary: dashboard,
        top_products: products,
        customer_segments: customerSegments,
        traffic_sources: trafficData,
        raw_events: events.slice(0, 500) // Limitar para não sobrecarregar
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${filters.startDate.toISOString().split('T')[0]}_${filters.endDate.toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Converter para CSV (implementação básica)
        const csvData = [
          ['Métrica', 'Valor'],
          ['Receita Total', dashboard?.total_revenue || 0],
          ['Total de Sessões', dashboard?.total_sessions || 0],
          ['Total de Compras', dashboard?.total_purchases || 0],
          ['Taxa de Conversão Média', dashboard?.avg_conversion_rate || 0],
          ['Ticket Médio', dashboard?.avg_order_value || 0]
        ];

        const csvContent = csvData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${filters.startDate.toISOString().split('T')[0]}_${filters.endDate.toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar dados');
    }
  }, [isAdmin, dashboardData, topProducts, customerSegments, trafficData, fetchRawEvents]);

  return {
    loading,
    error,
    dashboardData,
    topProducts,
    customerSegments,
    trafficData,
    fetchDashboardAnalytics,
    fetchTopProducts,
    fetchCustomerSegments,
    fetchTrafficAnalytics,
    fetchRawEvents,
    fetchTimeHeatmap,
    exportData,
    setError
  };
};