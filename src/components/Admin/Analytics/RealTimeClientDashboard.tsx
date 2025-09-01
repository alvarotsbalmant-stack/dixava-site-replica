import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Eye, 
  ShoppingCart, 
  Clock, 
  Activity,
  MapPin,
  Smartphone,
  Monitor,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  MousePointer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OnlineUser {
  session_id: string;
  user_id: string | null;
  current_page: string;
  activity_status: string;
  last_heartbeat: string;
  time_on_site_seconds: number | null;
  engagement_score: number | null;
  device_info: any;
  location_info: any;
  pages_in_session: number;
  products_viewed_today: number;
  cart_items: number;
  is_vip: boolean;
  last_purchase_date: string | null;
}

interface RealtimeActivity {
  type: 'page_view' | 'product_view' | 'add_to_cart' | 'purchase' | 'cart_abandon';
  user_id: string;
  session_id: string;
  timestamp: string;
  details: any;
}

interface AlertItem {
  id: string;
  type: 'vip_online' | 'cart_abandon' | 'high_value_cart' | 'unusual_behavior';
  message: string;
  timestamp: string;
  user_id: string;
  priority: 'low' | 'medium' | 'high';
}

export const RealTimeClientDashboard = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<RealtimeActivity[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchRealTimeData = async () => {
    try {
      // Buscar usuários online (atividade nos últimos 5 minutos)
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const { data: activeUsers, error: usersError } = await supabase
        .from('realtime_activity')
        .select('*')
        .gte('last_heartbeat', fiveMinutesAgo.toISOString())
        .eq('activity_status', 'active')
        .order('last_heartbeat', { ascending: false });

      if (usersError) throw usersError;

      // Buscar atividade recente (últimos 30 minutos)
      const thirtyMinutesAgo = new Date();
      thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

      const { data: recentJourney, error: journeyError } = await supabase
        .from('user_journey_detailed')
        .select('*')
        .gte('step_start_time', thirtyMinutesAgo.toISOString())
        .order('step_start_time', { ascending: false })
        .limit(50);

      if (journeyError) throw journeyError;

      // Processar usuários online
      const processedUsers: OnlineUser[] = (activeUsers || []).map(user => ({
        session_id: user.session_id,
        user_id: user.user_id,
        current_page: user.current_page || 'Página Inicial',
        activity_status: user.activity_status,
        last_heartbeat: user.last_heartbeat,
        time_on_site_seconds: user.time_on_site_seconds,
        engagement_score: user.engagement_score,
        device_info: user.device_info || {},
        location_info: user.location_info || {},
        pages_in_session: 0,
        products_viewed_today: 0,
        cart_items: 0,
        is_vip: false,
        last_purchase_date: null
      }));

      // Processar atividade recente
      const processedActivity: RealtimeActivity[] = (recentJourney || []).map(activity => ({
        type: activity.action_type as any || 'page_view',
        user_id: activity.user_id || activity.session_id,
        session_id: activity.session_id,
        timestamp: activity.step_start_time,
        details: {
          page_url: activity.page_url,
          funnel_stage: activity.funnel_stage,
          engagement_score: activity.engagement_score
        }
      }));

      // Gerar alertas baseados nos dados
      const generatedAlerts: AlertItem[] = [];
      
      // Alerta para usuários VIP online
      processedUsers.forEach(user => {
        if (user.is_vip) {
          generatedAlerts.push({
            id: `vip_${user.session_id}`,
            type: 'vip_online',
            message: `Cliente VIP está online navegando em ${user.current_page}`,
            timestamp: user.last_heartbeat,
            user_id: user.user_id || user.session_id,
            priority: 'high'
          });
        }
      });

      // Alerta para carrinhos de alto valor
      processedUsers.forEach(user => {
        if (user.cart_items > 3) {
          generatedAlerts.push({
            id: `cart_${user.session_id}`,
            type: 'high_value_cart',
            message: `Cliente com ${user.cart_items} itens no carrinho`,
            timestamp: user.last_heartbeat,
            user_id: user.user_id || user.session_id,
            priority: 'medium'
          });
        }
      });

      setOnlineUsers(processedUsers);
      setRecentActivity(processedActivity);
      setAlerts(generatedAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao buscar dados em tempo real:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getPageName = (url: string) => {
    if (!url) return 'Página Inicial';
    const path = url.split('/').pop() || '';
    if (path.includes('product')) return 'Produto';
    if (path.includes('cart')) return 'Carrinho';
    if (path.includes('checkout')) return 'Checkout';
    if (path.includes('playstation')) return 'PlayStation';
    if (path.includes('xbox')) return 'Xbox';
    if (path.includes('nintendo')) return 'Nintendo';
    return path || 'Página Inicial';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product_view': return <Eye className="h-4 w-4" />;
      case 'add_to_cart': return <ShoppingCart className="h-4 w-4" />;
      case 'purchase': return <TrendingUp className="h-4 w-4" />;
      case 'page_view': return <MousePointer className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'product_view': return 'text-blue-600';
      case 'add_to_cart': return 'text-orange-600';
      case 'purchase': return 'text-green-600';
      case 'page_view': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Dashboard em Tempo Real</h3>
          <p className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </div>
        <Button
          onClick={fetchRealTimeData}
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
                <p className="text-sm font-medium text-muted-foreground">Usuários Online</p>
                <p className="text-2xl font-bold">{onlineUsers.length}</p>
              </div>
              <div className="relative">
                <Users className="h-8 w-8 text-muted-foreground" />
                {onlineUsers.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atividades (30min)</p>
                <p className="text-2xl font-bold">{recentActivity.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas Ativos</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">
                  {onlineUsers.length > 0 
                    ? formatDuration(
                        onlineUsers.reduce((acc, user) => acc + (user.time_on_site_seconds || 0), 0) / onlineUsers.length
                      )
                    : '0m'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuários Online */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários Online Agora
            </CardTitle>
            <CardDescription>
              Usuários ativos nos últimos 5 minutos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {onlineUsers.map((user) => (
                  <div
                    key={user.session_id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-medium">
                          {user.user_id ? `Cliente ${user.user_id.slice(-8)}` : `Visitante ${user.session_id.slice(-8)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getPageName(user.current_page)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {user.is_vip && (
                          <Badge variant="default" className="text-xs">VIP</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {formatDuration(user.time_on_site_seconds)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(user.last_heartbeat)}
                      </p>
                    </div>
                  </div>
                ))}
                {onlineUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum usuário online no momento</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade em Tempo Real
            </CardTitle>
            <CardDescription>
              Últimas ações dos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {recentActivity.slice(0, 20).map((activity, index) => (
                  <div
                    key={`${activity.session_id}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className={`${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.user_id ? `Cliente ${activity.user_id.slice(-8)}` : `Visitante ${activity.session_id.slice(-8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.type === 'product_view' && 'Visualizou produto'}
                        {activity.type === 'add_to_cart' && 'Adicionou ao carrinho'}
                        {activity.type === 'purchase' && 'Realizou compra'}
                        {activity.type === 'page_view' && `Visitou ${getPageName(activity.details?.page_url)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alertas Inteligentes
            </CardTitle>
            <CardDescription>
              Notificações baseadas no comportamento dos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${getAlertColor(alert.priority)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {alert.user_id.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={alert.priority === 'high' ? 'destructive' : 
                                alert.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.priority === 'high' ? 'Alta' : 
                         alert.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

