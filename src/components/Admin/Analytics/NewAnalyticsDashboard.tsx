import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  ShoppingCart, 
  MessageCircle, 
  DollarSign,
  Gamepad2,
  BarChart3,
  Settings,
  Target,
  Bell,
  Eye,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
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
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { AnalyticsFilters } from './AnalyticsFilters';
import { AnalyticsConfigPanel } from './AnalyticsConfigPanel';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export const NewAnalyticsDashboard = () => {
  const {
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
    exportData,
    setError
  } = useAnalyticsData();

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      refreshData();
    }
  }, [dateRange]);

  const refreshData = async () => {
    if (!dateRange?.startDate || !dateRange?.endDate) {
      console.warn('Date range não definido, pulando refresh');
      return;
    }
    
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardAnalytics(dateRange.startDate, dateRange.endDate),
        fetchTopProducts(dateRange.startDate, dateRange.endDate),
        fetchCustomerSegments(dateRange.startDate, dateRange.endDate),
        fetchTrafficAnalytics(dateRange.startDate, dateRange.endDate)
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do analytics');
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    } catch (err) {
      console.warn('Erro ao formatar data:', dateStr);
      return dateStr;
    }
  };

  // Cores do tema gaming
  const colors = {
    primary: '#00ff88',
    secondary: '#00d4ff', 
    accent: '#ff6b35',
    purple: '#8b5cf6',
    yellow: '#fbbf24',
    red: '#ff4757'
  };

  const pieColors = [colors.primary, colors.secondary, colors.accent, colors.purple, colors.yellow, colors.red];

  // Processar dados do período para gráficos com verificações de segurança
  const periodData = React.useMemo(() => {
    if (!dashboardData?.period_data) return [];
    
    try {
      let data = dashboardData.period_data;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('Erro ao processar period_data:', err);
      return [];
    }
  }, [dashboardData?.period_data]);

  // Processar dados de tráfego com verificações de segurança
  const processedTrafficData = React.useMemo(() => {
    if (!trafficData || !Array.isArray(trafficData)) return [];
    
    return trafficData.map(item => ({
      source: item?.traffic_source || 'unknown',
      sessions: item?.sessions || 0,
      conversions: item?.conversions || 0,
      revenue: item?.revenue || 0,
      rate: (item?.sessions || 0) > 0 ? ((item?.conversions || 0) / (item?.sessions || 0) * 100) : 0
    }));
  }, [trafficData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Análise completa de performance da UTI Gamer Shop</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <AnalyticsFilters 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={() => {
              if (dateRange?.startDate && dateRange?.endDate) {
                exportData(dateRange.startDate, dateRange.endDate);
              }
            }}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-green-400/20 data-[state=active]:text-green-400">
            <BarChart3 className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-orange-400/20 data-[state=active]:text-orange-400">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="customers" className="data-[state=active]:bg-purple-400/20 data-[state=active]:text-purple-400">
            <Users className="w-4 h-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="traffic" className="data-[state=active]:bg-cyan-400/20 data-[state=active]:text-cyan-400">
            <Target className="w-4 h-4 mr-2" />
            Tráfego
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-slate-400/20 data-[state=active]:text-slate-400">
            <Settings className="w-4 h-4 mr-2" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Receita Card */}
            <Card className="bg-slate-800/80 border-green-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Receita Total</CardTitle>
                <div className="flex items-center space-x-1 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">+12.5%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {formatCurrency(dashboardData?.total_revenue || 0)}
                </div>
                <p className="text-sm text-gray-400">
                  Ticket médio: {formatCurrency(dashboardData?.avg_order_value || 0)}
                </p>
              </CardContent>
            </Card>

            {/* Sessões Card */}
            <Card className="bg-slate-800/80 border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Sessões</CardTitle>
                <div className="flex items-center space-x-1 text-red-400">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-xs font-medium">-8.2%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  {(dashboardData?.total_sessions || 0).toLocaleString('pt-BR')}
                </div>
                <p className="text-sm text-gray-400">
                  Conversão: {(dashboardData?.avg_conversion_rate || 0).toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            {/* Compras Card */}
            <Card className="bg-slate-800/80 border-orange-500/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Compras</CardTitle>
                <div className="flex items-center space-x-1 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">+25.0%</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-400 mb-2">
                  {dashboardData?.total_purchases || 0}
                </div>
                <p className="text-sm text-gray-400">
                  Abandono: {(dashboardData?.cart_abandonment_rate || 0).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            {/* WhatsApp Card */}
            <Card className="bg-slate-800/80 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {dashboardData?.whatsapp_clicks || 0}
                </div>
                <p className="text-sm text-gray-400">Cliques no período</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Receita */}
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  📈 Evolução da Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={periodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      stroke="#9CA3AF"
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      stroke="#9CA3AF"
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
                      labelFormatter={(label) => formatDate(label)}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={colors.primary}
                      fill={colors.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Sessões e Conversão */}
            <Card className="bg-slate-800/80 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                  👥 Sessões & Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={periodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      stroke="#9CA3AF"
                    />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip 
                      labelFormatter={(label) => formatDate(label)}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="sessions" 
                      stroke={colors.secondary}
                      strokeWidth={2}
                      name="Sessões"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="conversion_rate" 
                      stroke={colors.accent}
                      strokeWidth={2}
                      name="Conversão (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Compras */}
          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                🛒 Volume de Compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={periodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    stroke="#9CA3AF"
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    formatter={(value) => [value, 'Compras']}
                    labelFormatter={(label) => formatDate(label)}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="purchases" 
                    fill={colors.accent}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                🎮 Análise Detalhada de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 font-semibold text-gray-300">Produto</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-300">Views</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-300">Add to Cart</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-300">Compras</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-300">Receita</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-300">Conversão</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-300">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts?.map((product, index) => (
                      <tr key={product.product_id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-slate-500'}`}></div>
                            <div>
                              <p className="font-semibold text-white">{product.product_name}</p>
                              <p className="text-sm text-gray-400">ID: {product.product_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Eye className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400 font-semibold">{product.total_views}</span>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <ShoppingBag className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-400 font-semibold">{product.total_add_to_cart}</span>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <ShoppingCart className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-semibold">{product.total_purchases}</span>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <span className="text-green-400 font-bold">{formatCurrency(product.total_revenue)}</span>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            {product.avg_conversion_rate > 0.5 ? (
                              <ArrowUpRight className="w-4 h-4 text-green-400" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`font-semibold ${product.avg_conversion_rate > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                              {product.avg_conversion_rate.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <MessageCircle className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 font-semibold">{product.whatsapp_clicks}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico Pizza - Top Produtos por Receita */}
          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                🥧 Distribuição de Receita por Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={topProducts?.filter(p => p.total_revenue > 0) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ product_name, percent }) => `${product_name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="total_revenue"
                  >
                    {(topProducts?.filter(p => p.total_revenue > 0) || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                🚦 Fontes de Tráfego
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico Pizza - Sessões por Fonte */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Sessões por Fonte</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={processedTrafficData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ source, percent }) => `${source}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="sessions"
                      >
                        {processedTrafficData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Sessões']}
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabela de Métricas */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Métricas por Fonte</h3>
                  <div className="space-y-3">
                    {processedTrafficData.map((source, index) => (
                      <div key={source.source} className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white capitalize">{source.source}</h4>
                          <Badge variant={source.rate > 0.5 ? "default" : "destructive"}>
                            {source.rate.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Sessões</p>
                            <p className="text-white font-semibold">{source.sessions}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Conversões</p>
                            <p className="text-white font-semibold">{source.conversions}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Receita</p>
                            <p className="text-white font-semibold">{formatCurrency(source.revenue)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                👥 Segmentação de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-bold text-white mb-4">Em Desenvolvimento</h3>
                <p className="text-gray-400 mb-8">
                  Análise de lifetime value e comportamento de clientes será implementada quando a tabela customer_ltv for populada.
                </p>
                <div className="max-w-md mx-auto bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">📊 Segmentação Avançada</h4>
                  <p className="text-gray-400 text-sm mb-3">Análise de customer lifetime value e segmentação automática</p>
                  <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                    <div className="bg-orange-400 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  <p className="text-xs text-gray-400">60% - ETA: 15/09/2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="space-y-6">
          <Card className="bg-slate-800/80 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                💬 Analytics WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-white mb-4">WhatsApp Analytics</h3>
                <p className="text-gray-400 mb-8">
                  Métricas detalhadas do WhatsApp com tracking real de conversões.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">📊 Tracking Avançado</h4>
                    <p className="text-gray-400 text-sm mb-3">Rastreamento real de conversões via WhatsApp</p>
                    <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                    <p className="text-xs text-gray-400">30% - ETA: 30/09/2025</p>
                  </div>

                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">🤖 Bot Analytics</h4>
                    <p className="text-gray-400 text-sm mb-3">Métricas de performance do chatbot</p>
                    <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                      <div className="bg-purple-400 h-2 rounded-full" style={{width: '15%'}}></div>
                    </div>
                    <p className="text-xs text-gray-400">15% - ETA: 15/11/2025</p>
                  </div>

                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">📈 Funil WhatsApp</h4>
                    <p className="text-gray-400 text-sm mb-3">Análise completa do funil de conversão</p>
                    <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                      <div className="bg-cyan-400 h-2 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <p className="text-xs text-gray-400">45% - ETA: 15/10/2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-6">
          <AnalyticsConfigPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

