/**
 * ENTERPRISE ANALYTICS DASHBOARD - Sistema avançado de analytics
 * Substitui o dashboard antigo com funcionalidades enterprise
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Eye,
  ShoppingCart,
  Clock,
  Target,
  BarChart3,
  User,
  Zap,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnterpriseAnalytics } from '@/hooks/useEnterpriseAnalytics';
import { RealTimeMetrics } from './Enterprise/RealTimeMetrics';
import { CustomerDetailsModal } from './Enterprise/CustomerDetailsModal';
import { BehavioralAnalysis } from './Enterprise/BehavioralAnalysis';
import { ConversionFunnel } from './Enterprise/ConversionFunnel';
import { UserFlowAnalysis } from './Enterprise/UserFlowAnalysis';
import { FrictionPointsAnalysis } from './Enterprise/FrictionPointsAnalysis';
import { ChurnPrediction } from './Enterprise/ChurnPrediction';
import { SessionsAnalysis } from './Enterprise/SessionsAnalysis';

export const EnterpriseAnalyticsDashboard = () => {
  const {
    loading,
    error,
    getRealTimeMetrics,
    getBehavioralSegmentation,
    getChurnPrediction,
    setError
  } = useEnterpriseAnalytics();

  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [behavioralData, setBehavioralData] = useState<any>(null);
  const [churnData, setChurnData] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadAllData();
    
    // Atualizar dados em tempo real a cada 30 segundos
    const interval = setInterval(loadRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    setRefreshing(true);
    setError(null);

    try {
      await Promise.all([
        loadRealTimeData(),
        loadBehavioralData(),
        loadChurnData()
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados enterprise:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const loadRealTimeData = async () => {
    const data = await getRealTimeMetrics();
    setRealTimeData(data);
  };

  const loadBehavioralData = async () => {
    const data = await getBehavioralSegmentation(dateRange.startDate, dateRange.endDate);
    setBehavioralData(data);
  };

  const loadChurnData = async () => {
    const data = await getChurnPrediction();
    setChurnData(data);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
              <p className="font-semibold">Erro ao carregar Enterprise Analytics</p>
              <p className="text-sm text-muted-foreground mt-2">{error}</p>
              <Button onClick={loadAllData} className="mt-4" variant="outline">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Enterprise Analytics
          </h1>
          <p className="text-muted-foreground">
            Sistema avançado de análise comportamental e preditiva
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={loadAllData}
            disabled={loading || refreshing}
            variant="outline"
            size="sm"
          >
            <Activity className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Online</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatNumber(realTimeData?.real_time_users || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ativos nos últimos 5 minutos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão Hoje</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(realTimeData?.conversion_rate_today || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((realTimeData?.avg_session_duration || 0) / 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Por sessão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos de Fricção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {realTimeData?.friction_points?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Detectados hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Abas Principais */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Sessões
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Tempo Real
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Comportamento
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Funil
          </TabsTrigger>
          <TabsTrigger value="flows" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Fluxos
          </TabsTrigger>
          <TabsTrigger value="friction" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Fricção
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Churn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <SessionsAnalysis 
            onViewDetails={setSelectedCustomer}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <RealTimeMetrics data={realTimeData} />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <BehavioralAnalysis 
            data={behavioralData} 
            onCustomerSelect={setSelectedCustomer}
          />
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <ConversionFunnel dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <UserFlowAnalysis 
            flows={realTimeData?.user_flows || []}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="friction" className="space-y-4">
          <FrictionPointsAnalysis 
            frictionPoints={realTimeData?.friction_points || []}
            dateRange={dateRange}
          />
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <ChurnPrediction data={churnData} />
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes do Cliente */}
      {selectedCustomer && (
        <CustomerDetailsModal
          sessionId={selectedCustomer}
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};