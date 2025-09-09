import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
  Info,
  TrendingDown,
  TrendingUp,
  Users,
  ShoppingCart,
  Clock,
  X,
  Eye,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnterpriseAnalytics } from '@/hooks/useEnterpriseAnalytics';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: any;
  created_at: string;
  resolved: boolean;
  resolved_at?: string;
  user_id?: string;
  session_id?: string;
  page_url?: string;
}

interface AlertRule {
  type: string;
  condition: string;
  threshold: number;
  enabled: boolean;
}

export const RealTimeAlerts = () => {
  const { 
    getActiveAlerts, 
    getRealTimeAlerts, 
    resolveAlert,
    getRealtimeDashboardView,
    getChurnPrediction 
  } = useEnterpriseAnalytics();
  
  const { toast } = useToast();
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    { type: 'high_churn_risk', condition: 'churn_probability > 0.8', threshold: 0.8, enabled: true },
    { type: 'conversion_drop', condition: 'conversion_rate < 2%', threshold: 2, enabled: true },
    { type: 'high_abandonment', condition: 'abandonment_rate > 70%', threshold: 70, enabled: true },
    { type: 'low_engagement', condition: 'avg_engagement < 30', threshold: 30, enabled: true },
    { type: 'traffic_spike', condition: 'active_users > 100', threshold: 100, enabled: true },
    { type: 'performance_issue', condition: 'page_load_time > 3s', threshold: 3000, enabled: true }
  ]);
  
  const [realtimeData, setRealtimeData] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastCheck, setLastCheck] = useState(new Date());

  // Função para buscar alertas ativos
  const fetchActiveAlerts = useCallback(async () => {
    try {
      const alertsData = await getActiveAlerts();
      if (alertsData) {
        setAlerts(alertsData);
      }
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    }
  }, [getActiveAlerts]);

  // Função para buscar dados em tempo real e detectar anomalias
  const checkForAnomalies = useCallback(async () => {
    try {
      const [dashboardData, churnData] = await Promise.all([
        getRealtimeDashboardView(),
        getChurnPrediction(1) // Último dia
      ]);

      if (dashboardData) {
        setRealtimeData(dashboardData);
        
        // Verificar regras de alerta
        const newAlerts = [];
        
        // Calcular métricas agregadas
        const totalActiveUsers = dashboardData.reduce((sum, page) => sum + (page.active_users || 0), 0);
        const avgEngagement = dashboardData.reduce((sum, page) => sum + (page.avg_engagement || 0), 0) / dashboardData.length;
        const totalHighIntentUsers = dashboardData.reduce((sum, page) => sum + (page.high_intent_users || 0), 0);
        const avgChurnRisk = dashboardData.reduce((sum, page) => sum + (page.avg_churn_risk || 0), 0) / dashboardData.length;

        // Verificar spike de tráfego
        if (alertRules.find(r => r.type === 'traffic_spike' && r.enabled) && totalActiveUsers > 100) {
          newAlerts.push({
            type: 'traffic_spike',
            severity: 'medium' as const,
            message: `Spike de tráfego detectado: ${totalActiveUsers} usuários ativos`,
            details: { active_users: totalActiveUsers, threshold: 100 }
          });
        }

        // Verificar baixo engagement
        if (alertRules.find(r => r.type === 'low_engagement' && r.enabled) && avgEngagement < 30) {
          newAlerts.push({
            type: 'low_engagement',
            severity: 'high' as const,
            message: `Engagement baixo detectado: ${avgEngagement.toFixed(1)} (< 30)`,
            details: { avg_engagement: avgEngagement, threshold: 30 }
          });
        }

        // Verificar alto risco de churn
        if (alertRules.find(r => r.type === 'high_churn_risk' && r.enabled) && avgChurnRisk > 0.7) {
          newAlerts.push({
            type: 'high_churn_risk',
            severity: 'critical' as const,
            message: `Alto risco de churn detectado: ${(avgChurnRisk * 100).toFixed(1)}%`,
            details: { churn_risk: avgChurnRisk, threshold: 0.7 }
          });
        }

        // Verificar usuários com alta intenção (oportunidade)
        if (totalHighIntentUsers > 5) {
          newAlerts.push({
            type: 'high_intent_opportunity',
            severity: 'low' as const,
            message: `${totalHighIntentUsers} usuários com alta intenção de compra detectados`,
            details: { high_intent_users: totalHighIntentUsers }
          });
        }

        // Exibir notificações para novos alertas
        newAlerts.forEach(alert => {
          toast({
            title: getAlertTitle(alert.type),
            description: alert.message,
            variant: alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'default',
          });
        });
      }

      setLastCheck(new Date());
    } catch (error) {
      console.error('Erro ao verificar anomalias:', error);
    }
  }, [getRealtimeDashboardView, getChurnPrediction, alertRules, toast]);

  // Função para obter título do alerta
  const getAlertTitle = (type: string) => {
    const titles = {
      'traffic_spike': 'Spike de Tráfego',
      'low_engagement': 'Engagement Baixo',
      'high_churn_risk': 'Alto Risco de Churn',
      'conversion_drop': 'Queda na Conversão',
      'high_abandonment': 'Alto Abandono',
      'performance_issue': 'Problema de Performance',
      'high_intent_opportunity': 'Oportunidade de Conversão'
    };
    return titles[type] || 'Alerta';
  };

  // Função para obter ícone do alerta
  const getAlertIcon = (type: string, severity: string) => {
    const iconProps = { className: "w-4 h-4" };
    
    if (severity === 'critical') return <XCircle {...iconProps} className="w-4 h-4 text-red-500" />;
    if (severity === 'high') return <AlertTriangle {...iconProps} className="w-4 h-4 text-orange-500" />;
    if (severity === 'medium') return <Info {...iconProps} className="w-4 h-4 text-blue-500" />;
    if (severity === 'low') return <CheckCircle {...iconProps} className="w-4 h-4 text-green-500" />;
    
    switch (type) {
      case 'traffic_spike': return <TrendingUp {...iconProps} />;
      case 'low_engagement': return <TrendingDown {...iconProps} />;
      case 'high_churn_risk': return <Users {...iconProps} />;
      case 'conversion_drop': return <ShoppingCart {...iconProps} />;
      case 'high_intent_opportunity': return <Zap {...iconProps} />;
      default: return <Bell {...iconProps} />;
    }
  };

  // Função para obter cor do badge baseado na severidade
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para resolver alerta
  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast({
        title: "Alerta Resolvido",
        description: "O alerta foi marcado como resolvido.",
      });
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resolver o alerta.",
        variant: "destructive",
      });
    }
  };

  // Efeito para carregar alertas iniciais
  useEffect(() => {
    fetchActiveAlerts();
  }, [fetchActiveAlerts]);

  // Efeito para monitoramento em tempo real
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      checkForAnomalies();
      fetchActiveAlerts();
    }, 10000); // Verificar a cada 10 segundos

    return () => clearInterval(interval);
  }, [isMonitoring, checkForAnomalies, fetchActiveAlerts]);

  // Estatísticas dos alertas
  const alertStats = React.useMemo(() => {
    const stats = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length
    };
    return stats;
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* Header de Alertas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="w-6 h-6 mr-2 text-blue-600" />
            Sistema de Alertas em Tempo Real
          </h2>
          <p className="text-gray-600 mt-1">
            Monitoramento automático de anomalias e oportunidades
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            Última verificação: {lastCheck.toLocaleTimeString('pt-BR')}
          </div>
          
          <Button
            variant={isMonitoring ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Monitorando
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Pausado
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Estatísticas de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{alertStats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{alertStats.critical}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Altos</p>
                <p className="text-2xl font-bold text-orange-600">{alertStats.high}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Médios</p>
                <p className="text-2xl font-bold text-blue-600">{alertStats.medium}</p>
              </div>
              <Info className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Baixos</p>
                <p className="text-2xl font-bold text-green-600">{alertStats.low}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas Ativos */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Ativos</CardTitle>
          <CardDescription>
            Alertas que requerem atenção ou ação imediata
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <p className="text-lg font-medium">Nenhum alerta ativo</p>
              <p className="text-sm">Todos os sistemas estão funcionando normalmente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.alert_type, alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {getAlertTitle(alert.alert_type)}
                        </h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(alert.created_at).toLocaleString('pt-BR')}
                        </span>
                        {alert.page_url && (
                          <span className="truncate max-w-xs">
                            📄 {alert.page_url}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveAlert(alert.id)}
                    className="ml-4"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Resolver
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuração de Regras de Alerta */}
      <Card>
        <CardHeader>
          <CardTitle>Regras de Alerta</CardTitle>
          <CardDescription>
            Configure quando e como os alertas devem ser disparados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertRules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {getAlertTitle(rule.type)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {rule.condition}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Limite: {rule.threshold}
                  </span>
                  <Button
                    size="sm"
                    variant={rule.enabled ? "default" : "outline"}
                    onClick={() => {
                      setAlertRules(prev => 
                        prev.map((r, i) => 
                          i === index ? { ...r, enabled: !r.enabled } : r
                        )
                      );
                    }}
                  >
                    {rule.enabled ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dados em Tempo Real para Debug */}
      {realtimeData && (
        <Card>
          <CardHeader>
            <CardTitle>Dados em Tempo Real (Debug)</CardTitle>
            <CardDescription>
              Dados atuais sendo monitorados pelo sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600">Usuários Ativos</div>
                <div className="text-xl font-bold text-blue-900">
                  {Array.isArray(realtimeData) ? 
                    realtimeData.reduce((sum, page) => sum + (page.active_users || 0), 0) : 0
                  }
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600">Engagement Médio</div>
                <div className="text-xl font-bold text-green-900">
                  {Array.isArray(realtimeData) && realtimeData.length > 0 ? 
                    (realtimeData.reduce((sum, page) => sum + (page.avg_engagement || 0), 0) / realtimeData.length).toFixed(1) : 0
                  }
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600">Alta Intenção</div>
                <div className="text-xl font-bold text-purple-900">
                  {Array.isArray(realtimeData) ? 
                    realtimeData.reduce((sum, page) => sum + (page.high_intent_users || 0), 0) : 0
                  }
                </div>
              </div>
              
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-sm text-red-600">Risco Churn Médio</div>
                <div className="text-xl font-bold text-red-900">
                  {Array.isArray(realtimeData) && realtimeData.length > 0 ? 
                    ((realtimeData.reduce((sum, page) => sum + (page.avg_churn_risk || 0), 0) / realtimeData.length) * 100).toFixed(1) + '%' : '0%'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

