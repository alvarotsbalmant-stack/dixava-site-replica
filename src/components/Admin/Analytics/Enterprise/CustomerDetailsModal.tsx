/**
 * CUSTOMER DETAILS MODAL - Modal detalhado do cliente
 * Mostra informações completas sobre uma sessão específica incluindo:
 * - Todas as páginas visitadas com timestamps
 * - Todos os cliques e interações
 * - Tempo exato em cada página
 * - Produtos visualizados vs comprados
 * - UTI Coins ganhos
 * - Jornada completa step-by-step
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Eye, 
  ShoppingCart, 
  MousePointer, 
  Smartphone, 
  Monitor,
  Calendar,
  MapPin,
  TrendingUp,
  Activity,
  ExternalLink,
  User,
  Target,
  Zap,
  Coins,
  Navigation,
  ScrollText,
  Move,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface CustomerDetailsModalProps {
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PageView {
  url: string;
  title: string;
  entered_at: string;
  exited_at?: string;
  time_on_page: number;
  scroll_percentage: number;
  clicks: number;
}

interface Interaction {
  interaction_type: string;
  element_selector: string;
  coordinates: { x: number; y: number };
  timestamp: string;
  page_url: string;
  element_text?: string;
}

interface SessionDetails {
  session_id: string;
  user_id?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  device_type: string;
  browser: string;
  page_views: PageView[];
  interactions: Interaction[];
  products_viewed: any[];
  cart_events: any[];
  purchases: any[];
  uti_coins_earned: number;
  conversion_score: number;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  sessionId,
  isOpen,
  onClose
}) => {
  const [sessionData, setSessionData] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isOpen && sessionId) {
      loadSessionDetails();
    }
  }, [isOpen, sessionId]);

  const loadSessionDetails = async () => {
    setLoading(true);
    try {
      // Carregar dados da sessão principal
      const { data: session, error: sessionError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Carregar jornada detalhada
      const { data: journey, error: journeyError } = await supabase.rpc('get_user_complete_journey', {
        p_session_id: sessionId,
        p_include_interactions: true
      });

      if (journeyError) throw journeyError;

      // Carregar interações da página
      const { data: interactions, error: interactionsError } = await supabase
        .from('page_interactions')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp_precise', { ascending: true });

      if (interactionsError) throw interactionsError;

      // Carregar eventos de cliente
      const { data: events, error: eventsError } = await supabase
        .from('customer_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (eventsError) throw eventsError;

      // Calcular UTI coins ganhos nesta sessão
      const utiCoinsEvents = events?.filter(e => e.event_type === 'uti_coins_earned') || [];
      const totalUtiCoins = utiCoinsEvents.reduce((sum, event) => sum + ((event.event_data as any)?.amount || 0), 0);

      // Montar dados completos
      const completeSessionData: SessionDetails = {
        session_id: session.session_id,
        user_id: session.user_id,
        started_at: session.started_at,
        ended_at: session.ended_at,
        duration_seconds: session.duration_seconds,
        device_type: session.device_type,
        browser: session.browser,
        page_views: (journey as any)?.journey_steps || [],
        interactions: interactions?.map(interaction => ({
          interaction_type: interaction.interaction_type || 'click',
          element_selector: interaction.element_selector || '',
          coordinates: (interaction.coordinates as any) || { x: 0, y: 0 },
          timestamp: interaction.timestamp_precise || interaction.created_at,
          page_url: interaction.page_url || '',
          element_text: (interaction.element_attributes as any)?.text || ''
        })) || [],
        products_viewed: events?.filter(e => e.event_type === 'product_view') || [],
        cart_events: events?.filter(e => ['add_to_cart', 'remove_from_cart'].includes(e.event_type)) || [],
        purchases: events?.filter(e => e.event_type === 'purchase') || [],
        uti_coins_earned: totalUtiCoins,
        conversion_score: 0 // Será calculado
      };

      setSessionData(completeSessionData);

    } catch (error) {
      console.error('Erro ao carregar detalhes da sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'click': return <MousePointer className="h-3 w-3" />;
      case 'scroll': return <ScrollText className="h-3 w-3" />;
      case 'hover': return <Move className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Análise Completa da Sessão
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span>Session ID: <code className="bg-muted px-1 rounded text-xs">{sessionId}</code></span>
            {sessionData?.user_id && (
              <span>User ID: <code className="bg-muted px-1 rounded text-xs">{sessionData.user_id.slice(0, 8)}...</code></span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !sessionData ? (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2" />
            <p>Nenhum dado encontrado para esta sessão</p>
          </div>
        ) : (
          <div className="flex flex-col h-[80vh]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Resumo</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="pages">Páginas</TabsTrigger>
                <TabsTrigger value="interactions">Interações</TabsTrigger>
                <TabsTrigger value="products">Produtos</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="overview" className="space-y-4 m-0">
                  {/* Cards de Resumo */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Duração
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {formatDuration(sessionData.duration_seconds)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(sessionData.started_at)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Páginas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {sessionData.page_views.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          páginas visitadas
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MousePointer className="h-4 w-4" />
                          Interações
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">
                          {sessionData.interactions.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          cliques e ações
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          UTI Coins
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold text-yellow-600">
                          {sessionData.uti_coins_earned}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ganhos nesta sessão
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Dispositivo e Browser */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informações do Dispositivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(sessionData.device_type)}
                          <span className="capitalize">{sessionData.device_type}</span>
                        </div>
                        <Badge variant="outline">{sessionData.browser}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resumo de Conversão */}
                  {(sessionData.purchases.length > 0 || sessionData.cart_events.length > 0) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Atividade de Compra
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Produtos Visualizados</p>
                            <p className="text-xl font-bold">{sessionData.products_viewed.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Adicionados ao Carrinho</p>
                            <p className="text-xl font-bold">{sessionData.cart_events.filter(e => e.event_type === 'add_to_cart').length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Compras Realizadas</p>
                            <p className="text-xl font-bold">{sessionData.purchases.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4 m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Timeline Completa da Sessão
                      </CardTitle>
                      <CardDescription>
                        Sequência cronológica de todas as ações do usuário
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {/* Combinar todas as ações em ordem cronológica */}
                        {[
                          ...sessionData.page_views.map(page => ({
                            type: 'page_view',
                            timestamp: page.entered_at,
                            data: page
                          })),
                          ...sessionData.interactions.map(interaction => ({
                            type: 'interaction',
                            timestamp: interaction.timestamp,
                            data: interaction
                          })),
                          ...sessionData.products_viewed.map(product => ({
                            type: 'product_view',
                            timestamp: product.created_at,
                            data: product
                          })),
                          ...sessionData.cart_events.map(event => ({
                            type: event.event_type,
                            timestamp: event.created_at,
                            data: event
                          })),
                          ...sessionData.purchases.map(purchase => ({
                            type: 'purchase',
                            timestamp: purchase.created_at,
                            data: purchase
                          }))
                        ]
                          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                          .map((action, index) => (
                            <div key={index} className="flex gap-3 p-3 border rounded-lg">
                              <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      {action.type === 'page_view' && <Eye className="h-4 w-4" />}
                                      {action.type === 'interaction' && getInteractionIcon(action.data.interaction_type)}
                                      {action.type === 'product_view' && <Target className="h-4 w-4" />}
                                      {action.type === 'add_to_cart' && <ShoppingCart className="h-4 w-4" />}
                                      {action.type === 'purchase' && <TrendingUp className="h-4 w-4" />}
                                      <h4 className="font-medium capitalize">{action.type.replace('_', ' ')}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {action.type === 'page_view' && action.data.title}
                                      {action.type === 'interaction' && `${action.data.interaction_type} em ${action.data.element_selector}`}
                                      {action.type === 'product_view' && `Produto: ${action.data.event_data?.product_name || 'Produto'}`}
                                      {action.type === 'add_to_cart' && `Adicionou: ${action.data.event_data?.product_name || 'Produto'}`}
                                      {action.type === 'purchase' && `Comprou: ${formatCurrency(action.data.event_data?.value || 0)}`}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {formatDate(action.timestamp)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pages" className="space-y-4 m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        Páginas Visitadas ({sessionData.page_views.length})
                      </CardTitle>
                      <CardDescription>
                        Tempo exato gasto em cada página
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sessionData.page_views.map((page, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{page.title}</h4>
                                <p className="text-sm text-muted-foreground">{page.url}</p>
                              </div>
                              <Badge variant="outline">
                                {formatDuration(page.time_on_page)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Entrada</p>
                                <p className="text-sm">{formatDate(page.entered_at)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Scroll</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={page.scroll_percentage} className="flex-1" />
                                  <span className="text-sm">{page.scroll_percentage}%</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Cliques</p>
                                <p className="text-sm">{page.clicks}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="interactions" className="space-y-4 m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MousePointer className="h-5 w-5" />
                        Todas as Interações ({sessionData.interactions.length})
                      </CardTitle>
                      <CardDescription>
                        Cliques, scrolls e outros eventos com coordenadas exatas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {sessionData.interactions.map((interaction, index) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <div className="flex items-center gap-3">
                              {getInteractionIcon(interaction.interaction_type)}
                              <div>
                                <p className="text-sm font-medium capitalize">
                                  {interaction.interaction_type}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {interaction.element_selector}
                                </p>
                                {interaction.element_text && (
                                  <p className="text-xs text-muted-foreground">
                                    Texto: "{interaction.element_text}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {formatDate(interaction.timestamp)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                x:{interaction.coordinates.x}, y:{interaction.coordinates.y}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-4 m-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Produtos Visualizados */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="h-5 w-5" />
                          Produtos Visualizados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {sessionData.products_viewed.map((product, index) => (
                            <div key={index} className="p-2 border rounded">
                              <p className="font-medium">{product.event_data?.product_name || 'Produto'}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(product.created_at)}
                              </p>
                            </div>
                          ))}
                          {sessionData.products_viewed.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">
                              Nenhum produto visualizado
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Eventos do Carrinho */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Carrinho de Compras
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {sessionData.cart_events.map((event, index) => (
                            <div key={index} className="p-2 border rounded">
                              <div className="flex justify-between items-center">
                                <p className="font-medium">{event.event_data?.product_name || 'Produto'}</p>
                                <Badge variant={event.event_type === 'add_to_cart' ? 'default' : 'destructive'}>
                                  {event.event_type === 'add_to_cart' ? 'Adicionou' : 'Removeu'}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(event.created_at)}
                              </p>
                            </div>
                          ))}
                          {sessionData.cart_events.length === 0 && (
                            <p className="text-muted-foreground text-center py-4">
                              Nenhuma atividade no carrinho
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Compras Realizadas */}
                  {sessionData.purchases.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Compras Realizadas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {sessionData.purchases.map((purchase, index) => (
                            <div key={index} className="p-3 border rounded-lg bg-success/5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">Compra #{purchase.event_data?.order_id || index + 1}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {purchase.event_data?.items?.length || 1} itens
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-success">
                                    {formatCurrency(purchase.event_data?.value || 0)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(purchase.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};