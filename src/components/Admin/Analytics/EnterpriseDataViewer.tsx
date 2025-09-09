import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  MousePointer, 
  Scroll, 
  Clock, 
  Users, 
  Eye,
  RefreshCw,
  Database,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEnterpriseAnalyticsConfig } from '@/hooks/useEnterpriseAnalyticsConfig';

interface PageInteraction {
  id: string;
  interaction_type: string;
  page_url: string;
  element_selector: string | null;
  coordinates: any;
  timestamp_precise: string;
  device_type: string | null;
  session_id: string;
}

interface UserJourneyStep {
  id: string;
  action_type: string;
  page_url: string;
  step_number: number;
  engagement_score: number | null;
  funnel_stage: string | null;
  step_start_time: string;
  session_id: string;
}

interface RealTimeActivity {
  session_id: string;
  current_page: string;
  activity_status: string;
  last_heartbeat: string;
  engagement_score: number | null;
  time_on_site_seconds: number | null;
}

export const EnterpriseDataViewer = () => {
  const { isEnterpriseEnabled } = useEnterpriseAnalyticsConfig();
  const [loading, setLoading] = useState(false);
  const [pageInteractions, setPageInteractions] = useState<PageInteraction[]>([]);
  const [userJourney, setUserJourney] = useState<UserJourneyStep[]>([]);
  const [realTimeActivity, setRealTimeActivity] = useState<RealTimeActivity[]>([]);

  const fetchEnterpriseData = async () => {
    if (!isEnterpriseEnabled) return;
    
    setLoading(true);
    try {
      // Buscar interações recentes
      const { data: interactions } = await supabase
        .from('page_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Buscar jornada do usuário
      const { data: journey } = await supabase
        .from('user_journey_detailed')
        .select('*')
        .order('step_start_time', { ascending: false })
        .limit(30);

      // Buscar atividade em tempo real
      const { data: activity } = await supabase
        .from('realtime_activity')
        .select('*')
        .order('last_heartbeat', { ascending: false })
        .limit(20);

      setPageInteractions(interactions || []);
      setUserJourney(journey || []);
      setRealTimeActivity(activity || []);
    } catch (error) {
      console.error('Erro ao buscar dados enterprise:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnterpriseData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchEnterpriseData, 30000);
    return () => clearInterval(interval);
  }, [isEnterpriseEnabled]);

  if (!isEnterpriseEnabled) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Sistema Enterprise Inativo</p>
            <p className="text-sm">Ative o sistema enterprise para visualizar dados avançados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'click': return '🖱️';
      case 'scroll': return '📜';
      case 'mousemove': return '👆';
      case 'hover': return '⏸️';
      case 'focus': return '🎯';
      default: return '📊';
    }
  };

  const getEngagementColor = (score: number | null) => {
    if (!score) return 'secondary';
    if (score >= 80) return 'default';
    if (score >= 60) return 'default';
    if (score >= 40) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Dados Enterprise</h3>
          <p className="text-sm text-muted-foreground">
            Visualização em tempo real dos dados avançados de analytics
          </p>
        </div>
        <Button
          onClick={fetchEnterpriseData}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interações</p>
                <p className="text-2xl font-bold">{pageInteractions.length}</p>
              </div>
              <MousePointer className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Jornadas</p>
                <p className="text-2xl font-bold">{userJourney.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Online</p>
                <p className="text-2xl font-bold">
                  {realTimeActivity.filter(a => a.activity_status === 'active').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Médio</p>
                <p className="text-2xl font-bold">
                  {userJourney.length > 0 
                    ? Math.round(userJourney.reduce((acc, j) => acc + (j.engagement_score || 0), 0) / userJourney.length)
                    : 0}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dados Detalhados */}
      <Tabs defaultValue="interactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interactions">Interações</TabsTrigger>
          <TabsTrigger value="journey">Jornada</TabsTrigger>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
        </TabsList>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Interações da Página
              </CardTitle>
              <CardDescription>
                Últimas 50 interações capturadas pelo sistema enterprise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {pageInteractions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {getInteractionIcon(interaction.interaction_type)}
                        </span>
                        <div>
                          <p className="font-medium capitalize">
                            {interaction.interaction_type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {interaction.element_selector || 'Sem elemento'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {interaction.page_url.split('/').pop() || 'Home'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(interaction.timestamp_precise)}
                        </p>
                        {interaction.coordinates && (
                          <p className="text-xs text-muted-foreground">
                            ({interaction.coordinates.x}, {interaction.coordinates.y})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {pageInteractions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma interação encontrada</p>
                      <p className="text-sm">Navegue pelo site para gerar dados</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Jornada do Usuário
              </CardTitle>
              <CardDescription>
                Passos detalhados da jornada com scores de engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {userJourney.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">
                          #{step.step_number}
                        </Badge>
                        <div>
                          <p className="font-medium capitalize">
                            {step.action_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {step.page_url.split('/').pop() || 'Home'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        {step.engagement_score && (
                          <Badge variant={getEngagementColor(step.engagement_score)}>
                            {step.engagement_score}% engagement
                          </Badge>
                        )}
                        {step.funnel_stage && (
                          <Badge variant="outline" className="text-xs">
                            {step.funnel_stage}
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(step.step_start_time)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {userJourney.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma jornada encontrada</p>
                      <p className="text-sm">Dados de jornada aparecerão aqui</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade em Tempo Real
              </CardTitle>
              <CardDescription>
                Usuários ativos e suas atividades atuais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {realTimeActivity.map((activity) => (
                    <div
                      key={activity.session_id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.activity_status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="font-medium">
                            Sessão {activity.session_id.slice(-8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.current_page.split('/').pop() || 'Home'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.activity_status === 'active' ? 'default' : 'secondary'}>
                          {activity.activity_status}
                        </Badge>
                        {activity.time_on_site_seconds && (
                          <p className="text-sm text-muted-foreground">
                            {Math.floor(activity.time_on_site_seconds / 60)}min no site
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.last_heartbeat)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {realTimeActivity.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma atividade em tempo real</p>
                      <p className="text-sm">Usuários ativos aparecerão aqui</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

