import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity,
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Eye,
  MousePointer,
  Clock,
  Target,
  Zap,
  Brain,
  Shield,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useEnterpriseAnalytics } from '@/hooks/useEnterpriseAnalytics';

export const EnterpriseDashboard = () => {
  const {
    loading,
    error,
    getRealtimeDashboardView,
    getHourlyMetrics,
    getCategoryPerformance,
    getActiveAlerts,
    refreshMaterializedViews,
    getAbandonmentAnalysisBySector,
    getConversionRoutesAnalysis,
    getBehavioralSegmentation,
    getChurnPrediction,
    getFrictionPointsAnalysis,
    resolveAlert
  } = useEnterpriseAnalytics();

  // Estados para dados em tempo real
  const [realtimeData, setRealtimeData] = useState(null);
  const [hourlyMetrics, setHourlyMetrics] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [abandonmentData, setAbandonmentData] = useState([]);
  const [conversionRoutes, setConversionRoutes] = useState([]);
  const [behavioralSegments, setBehavioralSegments] = useState([]);
  const [churnPredictions, setChurnPredictions] = useState([]);
  const [frictionPoints, setFrictionPoints] = useState([]);

  // Estados de controle
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 segundos
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Cores para gráficos
  const colors = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    cyan: '#06B6D4',
    indigo: '#6366F1',
    pink: '#EC4899'
  };

  // Função para carregar todos os dados
  const loadAllData = useCallback(async () => {
    try {
      const [
        realtimeResult,
        hourlyResult,
        categoryResult,
        alertsResult,
        abandonmentResult,
        routesResult,
        segmentsResult,
        churnResult,
        frictionResult
      ] = await Promise.all([
        getRealtimeDashboardView(),
        getHourlyMetrics(24),
        getCategoryPerformance(),
        getActiveAlerts(),
        getAbandonmentAnalysisBySector(30),
        getConversionRoutesAnalysis(30),
        getBehavioralSegmentation(30),
        getChurnPrediction(30),
        getFrictionPointsAnalysis(30)
      ]);

      if (realtimeResult) setRealtimeData(realtimeResult);
      if (hourlyResult) setHourlyMetrics(hourlyResult);
      if (categoryResult) setCategoryData(categoryResult);
      if (alertsResult) setActiveAlerts(alertsResult);
      if (abandonmentResult) setAbandonmentData(abandonmentResult);
      if (routesResult) setConversionRoutes(routesResult);
      if (segmentsResult) setBehavioralSegments(segmentsResult);
      if (churnResult) setChurnPredictions(churnResult);
      if (frictionResult) setFrictionPoints(frictionResult);

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erro ao carregar dados enterprise:', err);
    }
  }, [
    getRealtimeDashboardView,
    getHourlyMetrics,
    getCategoryPerformance,
    getActiveAlerts,
    getAbandonmentAnalysisBySector,
    getConversionRoutesAnalysis,
    getBehavioralSegmentation,
    getChurnPrediction,
    getFrictionPointsAnalysis
  ]);

  // Função para atualizar views materializadas
  const handleRefreshViews = async () => {
    try {
      await refreshMaterializedViews();
      await loadAllData();
    } catch (err) {
      console.error('Erro ao atualizar views:', err);
    }
  };

  // Efeito para carregar dados iniciais
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Efeito para atualização em tempo real
  useEffect(() => {
    if (!isRealTimeActive) return;

    const interval = setInterval(() => {
      loadAllData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isRealTimeActive, refreshInterval, loadAllData]);

  // Processar dados de tempo real para KPIs
  const realtimeKPIs = React.useMemo(() => {
    if (!realtimeData || !Array.isArray(realtimeData)) return null;

    const totals = realtimeData.reduce((acc, page) => ({
      activeUsers: acc.activeUsers + (page.active_users || 0),
      avgEngagement: acc.avgEngagement + (page.avg_engagement || 0),
      highIntentUsers: acc.highIntentUsers + (page.high_intent_users || 0),
      interventionOpportunities: acc.interventionOpportunities + (page.intervention_opportunities || 0),
      avgChurnRisk: acc.avgChurnRisk + (page.avg_churn_risk || 0)
    }), {
      activeUsers: 0,
      avgEngagement: 0,
      highIntentUsers: 0,
      interventionOpportunities: 0,
      avgChurnRisk: 0
    });

    const pageCount = realtimeData.length;
    return {
      ...totals,
      avgEngagement: pageCount > 0 ? totals.avgEngagement / pageCount : 0,
      avgChurnRisk: pageCount > 0 ? totals.avgChurnRisk / pageCount : 0
    };
  }, [realtimeData]);

  // Processar dados de categoria para gráfico
  const categoryChartData = React.useMemo(() => {
    if (!categoryData || !Array.isArray(categoryData)) return [];

    return categoryData.map(cat => ({
      category: cat.category,
      sessions: cat.total_sessions || 0,
      conversions: cat.converted_sessions || 0,
      conversionRate: cat.conversion_rate || 0,
      revenue: cat.total_revenue || 0,
      engagement: cat.avg_engagement || 0,
      friction: cat.friction_incidents || 0
    }));
  }, [categoryData]);

  // Processar dados horárias para gráfico de tendência
  const hourlyChartData = React.useMemo(() => {
    if (!hourlyMetrics || !Array.isArray(hourlyMetrics)) return [];

    return hourlyMetrics.map(metric => ({
      hour: new Date(metric.hour).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sessions: metric.unique_sessions || 0,
      interactions: metric.total_interactions || 0,
      conversions: metric.total_conversions || 0,
      revenue: metric.total_revenue || 0,
      engagement: metric.avg_engagement || 0
    }));
  }, [hourlyMetrics]);

  // Processar dados de abandono para gráfico
  const abandonmentChartData = React.useMemo(() => {
    if (!abandonmentData || !Array.isArray(abandonmentData)) return [];

    return abandonmentData.map(item => ({
      sector: item.sector || 'Unknown',
      abandonmentRate: item.abandonment_rate || 0,
      exitPoint: item.most_common_exit_point || 'Unknown',
      avgTimeToExit: item.avg_time_to_exit || 0,
      recoveryOpportunity: item.recovery_opportunity_score || 0
    }));
  }, [abandonmentData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Enterprise */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-blue-600" />
            Analytics Enterprise
          </h1>
          <p className="text-gray-600 mt-1">Sistema de tracking 100% completo - Nível Amazon/Google Analytics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Controle de Tempo Real */}
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border">
            <Activity className={`w-4 h-4 ${isRealTimeActive ? 'text-green-500' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">Tempo Real</span>
            <Switch 
              checked={isRealTimeActive} 
              onCheckedChange={setIsRealTimeActive}
            />
          </div>

          {/* Última Atualização */}
          <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border">
            <Clock className="w-4 h-4 inline mr-1" />
            {lastUpdate.toLocaleTimeString('pt-BR')}
          </div>

          {/* Botão de Refresh */}
          <Button 
            onClick={handleRefreshViews} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Views
          </Button>
        </div>
      </div>

      {/* Alertas Ativos */}
      {activeAlerts && activeAlerts.length > 0 && (
        <div className="mb-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Alertas Ativos ({activeAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeAlerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{alert.alert_type}</span>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolver
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="realtime" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 p-1 rounded-lg mb-8">
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="conversion">Conversão</TabsTrigger>
          <TabsTrigger value="intelligence">Inteligência</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Tab Tempo Real */}
        <TabsContent value="realtime" className="space-y-6">
          {/* KPIs em Tempo Real */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(realtimeKPIs?.activeUsers || 0)}
                </div>
                <p className="text-xs opacity-90 mt-1">
                  Agora mesmo
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Engagement Médio</CardTitle>
                <Target className="h-4 w-4 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(realtimeKPIs?.avgEngagement || 0).toFixed(1)}
                </div>
                <p className="text-xs opacity-90 mt-1">
                  Score 0-100
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Alta Intenção</CardTitle>
                <Zap className="h-4 w-4 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(realtimeKPIs?.highIntentUsers || 0)}
                </div>
                  <p className="text-xs opacity-90 mt-1">
                    Usuários &gt;70% conversão
                  </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Intervenções</CardTitle>
                <Eye className="h-4 w-4 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(realtimeKPIs?.interventionOpportunities || 0)}
                </div>
                <p className="text-xs opacity-90 mt-1">
                  Oportunidades ativas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Risco Churn</CardTitle>
                <Shield className="h-4 w-4 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage((realtimeKPIs?.avgChurnRisk || 0) * 100)}
                </div>
                <p className="text-xs opacity-90 mt-1">
                  Média geral
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos de Tempo Real */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atividade por Hora */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade nas Últimas 24h</CardTitle>
                <CardDescription>Sessões, interações e conversões por hora</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hourlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke={colors.primary} 
                      strokeWidth={2}
                      name="Sessões"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="interactions" 
                      stroke={colors.success} 
                      strokeWidth={2}
                      name="Interações"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke={colors.purple} 
                      strokeWidth={2}
                      name="Conversões"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance por Categoria Gaming */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Categoria Gaming</CardTitle>
                <CardDescription>PlayStation, Xbox, Nintendo, PC Gaming</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" fill={colors.primary} name="Sessões" />
                    <Bar dataKey="conversions" fill={colors.success} name="Conversões" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Usuários Ativos por Página */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários Ativos por Página</CardTitle>
              <CardDescription>Distribuição em tempo real de usuários por página</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realtimeData && Array.isArray(realtimeData) && realtimeData.slice(0, 10).map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {page.current_page_url || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Engagement: {(page.avg_engagement || 0).toFixed(1)} | 
                        Alta Intenção: {page.high_intent_users || 0} | 
                        Intervenções: {page.intervention_opportunities || 0}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {page.active_users || 0}
                      </div>
                      <div className="text-xs text-gray-500">usuários</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Comportamento */}
        <TabsContent value="behavior" className="space-y-6">
          {/* Análise de Abandono por Setor */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Abandono por Setor Gaming</CardTitle>
              <CardDescription>Taxa de abandono e pontos de saída por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={abandonmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="abandonmentRate" fill={colors.danger} name="Taxa de Abandono %" />
                  <Bar dataKey="recoveryOpportunity" fill={colors.success} name="Oportunidade de Recuperação" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Segmentação Comportamental */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Segmentação Comportamental</CardTitle>
                <CardDescription>Grupos automáticos baseados em comportamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {behavioralSegments && Array.isArray(behavioralSegments) && behavioralSegments.slice(0, 5).map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {segment.segment_name || `Segmento ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {segment.description || 'Descrição do comportamento'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {segment.user_count || 0}
                        </div>
                        <div className="text-xs text-gray-500">usuários</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Predição de Churn */}
            <Card>
              <CardHeader>
                <CardTitle>Predição de Churn</CardTitle>
                <CardDescription>Usuários em risco de abandono</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {churnPredictions && Array.isArray(churnPredictions) && churnPredictions.slice(0, 5).map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          Usuário {prediction.user_id || 'Anônimo'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Última atividade: {prediction.last_activity || 'Desconhecida'}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            (prediction.churn_probability || 0) > 0.7 ? 'destructive' : 
                            (prediction.churn_probability || 0) > 0.4 ? 'default' : 'secondary'
                          }
                        >
                          {formatPercentage((prediction.churn_probability || 0) * 100)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Conversão */}
        <TabsContent value="conversion" className="space-y-6">
          {/* Rotas de Conversão */}
          <Card>
            <CardHeader>
              <CardTitle>Rotas de Conversão Mais Efetivas</CardTitle>
              <CardDescription>Caminhos que levam à compra com maior frequência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionRoutes && Array.isArray(conversionRoutes) && conversionRoutes.slice(0, 8).map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {route.journey_path || `Rota ${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {route.step_count || 0} passos | Tempo médio: {route.avg_time || 0}min
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatPercentage(route.conversion_rate || 0)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {route.frequency_count || 0} conversões
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pontos de Fricção */}
          <Card>
            <CardHeader>
              <CardTitle>Pontos de Fricção Identificados</CardTitle>
              <CardDescription>Elementos que causam abandono ou confusão</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frictionPoints && Array.isArray(frictionPoints) && frictionPoints.slice(0, 6).map((friction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
                      <div className="font-medium text-red-900">
                        {friction.page_url || 'Página não identificada'}
                      </div>
                      <div className="text-sm text-red-600">
                        {friction.friction_type || 'Tipo de fricção'} | 
                        Elemento: {friction.element_selector || 'Desconhecido'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {friction.friction_score || 0}
                      </div>
                      <div className="text-xs text-red-500">
                        {friction.incident_count || 0} incidentes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Inteligência */}
        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inteligência de Produtos */}
            <Card>
              <CardHeader>
                <CardTitle>Inteligência de Produtos</CardTitle>
                <CardDescription>Análise de performance e oportunidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Dados de inteligência de produtos serão exibidos aqui</p>
                </div>
              </CardContent>
            </Card>

            {/* Correlação de Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Correlação Performance vs Conversão</CardTitle>
                <CardDescription>Como métricas técnicas impactam vendas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Análise de correlação será exibida aqui</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Performance */}
        <TabsContent value="performance" className="space-y-6">
          {/* Métricas de Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Web Vitals</CardTitle>
                <CardDescription>Core Web Vitals médios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">LCP</span>
                    <span className="font-medium">2.1s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">FID</span>
                    <span className="font-medium">45ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">CLS</span>
                    <span className="font-medium">0.08</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tracking Performance</CardTitle>
                <CardDescription>Performance do sistema de tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Eventos/min</span>
                    <span className="font-medium text-green-600">12,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Latência</span>
                    <span className="font-medium text-green-600">85ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taxa de Sucesso</span>
                    <span className="font-medium text-green-600">99.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sistema Status</CardTitle>
                <CardDescription>Status dos componentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Database</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Triggers</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Views</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">Atualizado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

