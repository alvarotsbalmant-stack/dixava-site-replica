import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  Eye, 
  ShoppingCart, 
  TrendingUp, 
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Activity,
  ArrowRight,
  Package,
  CreditCard,
  MousePointer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ClientSession {
  session_id: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  device_info: any;
  pages: SessionPage[];
  products_viewed: ProductView[];
  cart_actions: CartAction[];
  purchases: Purchase[];
}

interface SessionPage {
  url: string;
  title: string;
  entry_time: string;
  exit_time: string | null;
  time_spent: number;
  scroll_depth: number;
  clicks: number;
}

interface ProductView {
  product_id: string;
  product_name: string;
  timestamp: string;
  time_spent: number;
  added_to_cart: boolean;
}

interface CartAction {
  action: 'add' | 'remove';
  product_id: string;
  product_name: string;
  timestamp: string;
  quantity: number;
}

interface Purchase {
  order_id: string;
  total_value: number;
  items_count: number;
  timestamp: string;
  products: string[];
}

interface ClientAnalysis {
  user_id: string;
  email: string | null;
  first_session: string;
  last_session: string;
  total_sessions: number;
  total_time_spent: number;
  total_pages_visited: number;
  total_products_viewed: number;
  total_cart_additions: number;
  total_purchases: number;
  total_spent: number;
  avg_session_duration: number;
  conversion_rate: number;
  favorite_categories: string[];
  device_preference: string;
  sessions: ClientSession[];
}

interface ClientDetailModalProps {
  client: ClientAnalysis;
  open: boolean;
  onClose: () => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  open,
  onClose
}) => {
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ClientSession | null>(null);

  const fetchDetailedSessions = async () => {
    setLoading(true);
    try {
      // Buscar sessões detalhadas do cliente
      const { data: journeyData, error: journeyError } = await supabase
        .from('user_journey_detailed')
        .select('*')
        .eq('user_id', client.user_id)
        .order('step_start_time', { ascending: true });

      if (journeyError) throw journeyError;

      // Buscar interações detalhadas
      const { data: interactions, error: interactionsError } = await supabase
        .from('page_interactions')
        .select('*')
        .eq('session_id', client.user_id)
        .order('timestamp_precise', { ascending: true });

      if (interactionsError) throw interactionsError;

      // Processar dados para agrupar por sessão
      const sessionMap = new Map<string, ClientSession>();

      journeyData?.forEach(step => {
        if (!sessionMap.has(step.session_id)) {
          sessionMap.set(step.session_id, {
            session_id: step.session_id,
            start_time: step.step_start_time,
            end_time: step.step_end_time,
            duration: 0,
            device_info: {},
            pages: [],
            products_viewed: [],
            cart_actions: [],
            purchases: []
          });
        }

        const session = sessionMap.get(step.session_id)!;
        
        // Atualizar tempo de fim da sessão
        if (step.step_end_time && (!session.end_time || step.step_end_time > session.end_time)) {
          session.end_time = step.step_end_time;
        }

        // Adicionar página visitada
        if (step.page_url) {
          const existingPage = session.pages.find(p => p.url === step.page_url);
          if (!existingPage) {
            session.pages.push({
              url: step.page_url,
              title: step.page_url.split('/').pop() || 'Página',
              entry_time: step.step_start_time,
              exit_time: step.step_end_time,
              time_spent: 0,
              scroll_depth: 0,
              clicks: 0
            });
          }
        }

        // Processar ações específicas
        if (step.action_type === 'product_view') {
          session.products_viewed.push({
            product_id: step.session_id, // Placeholder
            product_name: 'Produto Visualizado',
            timestamp: step.step_start_time,
            time_spent: 0,
            added_to_cart: false
          });
        }

        if (step.action_type === 'add_to_cart') {
          session.cart_actions.push({
            action: 'add',
            product_id: step.session_id,
            product_name: 'Produto Adicionado',
            timestamp: step.step_start_time,
            quantity: 1
          });
        }

        if (step.action_type === 'purchase') {
          session.purchases.push({
            order_id: step.session_id,
            total_value: 0,
            items_count: 1,
            timestamp: step.step_start_time,
            products: ['Produto Comprado']
          });
        }
      });

      // Calcular durações das sessões
      sessionMap.forEach(session => {
        if (session.end_time) {
          session.duration = Math.floor(
            (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000
          );
        }
      });

      const sessionsArray = Array.from(sessionMap.values())
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

      setSessions(sessionsArray);
    } catch (error) {
      console.error('Erro ao buscar sessões detalhadas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && client) {
      fetchDetailedSessions();
    }
  }, [open, client]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalhes do Cliente
          </DialogTitle>
          <DialogDescription>
            Análise completa da jornada e comportamento do cliente
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sessions">Histórico de Sessões</TabsTrigger>
            <TabsTrigger value="behavior">Comportamento</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[70vh] mt-4">
            <TabsContent value="overview" className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações do Cliente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">ID: {client.user_id.slice(-12)}</Badge>
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Email:</span>
                        <span className="text-sm">{client.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        Cliente desde: {formatDateTime(client.first_session)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">
                        Última atividade: {formatDateTime(client.last_session)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estatísticas Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Sessões</p>
                        <p className="text-2xl font-bold">{client.total_sessions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Total</p>
                        <p className="text-2xl font-bold">{formatDuration(client.total_time_spent)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Páginas Visitadas</p>
                        <p className="text-2xl font-bold">{client.total_pages_visited}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Produtos Vistos</p>
                        <p className="text-2xl font-bold">{client.total_products_viewed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Métricas de Conversão */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Itens no Carrinho</p>
                        <p className="text-2xl font-bold">{client.total_cart_additions}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Compras Realizadas</p>
                        <p className="text-2xl font-bold">{client.total_purchases}</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                        <p className={`text-2xl font-bold ${getEngagementColor(client.conversion_rate)}`}>
                          {client.conversion_rate.toFixed(1)}%
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Histórico de Sessões</h3>
                <Badge variant="outline">{sessions.length} sessões</Badge>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Carregando sessões...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <Card key={session.session_id} className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Sessão #{index + 1}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDateTime(session.start_time)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDuration(session.duration)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {session.pages.length} páginas
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              {session.products_viewed.length} produtos
                            </div>
                          </div>
                        </div>

                        {session.pages.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm font-medium mb-2">Jornada da Sessão:</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {session.pages.slice(0, 5).map((page, pageIndex) => (
                                <React.Fragment key={pageIndex}>
                                  <Badge variant="secondary" className="text-xs">
                                    {page.title}
                                  </Badge>
                                  {pageIndex < Math.min(session.pages.length - 1, 4) && (
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </React.Fragment>
                              ))}
                              {session.pages.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{session.pages.length - 5} mais
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {sessions.length === 0 && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma sessão detalhada encontrada</p>
                          <p className="text-sm">Os dados podem estar sendo processados</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Padrões de Navegação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Duração Média por Sessão</p>
                        <p className="text-lg font-bold">{formatDuration(client.avg_session_duration)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Páginas por Sessão</p>
                        <p className="text-lg font-bold">
                          {client.total_sessions > 0 
                            ? (client.total_pages_visited / client.total_sessions).toFixed(1)
                            : '0'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Dispositivo Preferido</p>
                        <div className="flex items-center gap-2">
                          {client.device_preference === 'Mobile' ? (
                            <Smartphone className="h-4 w-4" />
                          ) : (
                            <Monitor className="h-4 w-4" />
                          )}
                          <span>{client.device_preference}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comportamento de Compra</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Produtos por Sessão</p>
                        <p className="text-lg font-bold">
                          {client.total_sessions > 0 
                            ? (client.total_products_viewed / client.total_sessions).toFixed(1)
                            : '0'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Taxa de Adição ao Carrinho</p>
                        <p className="text-lg font-bold">
                          {client.total_products_viewed > 0 
                            ? ((client.total_cart_additions / client.total_products_viewed) * 100).toFixed(1)
                            : '0'
                          }%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Valor Total Gasto</p>
                        <p className="text-lg font-bold">R$ {client.total_spent.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Timeline de Atividades</h3>
                
                {sessions.length > 0 ? (
                  <div className="space-y-4">
                    {sessions.slice(0, 10).map((session, index) => (
                      <div key={session.session_id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          {index < sessions.length - 1 && (
                            <div className="w-px h-16 bg-border mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">Sessão #{index + 1}</span>
                            <Badge variant="outline" className="text-xs">
                              {formatDuration(session.duration)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatDateTime(session.start_time)}
                          </p>
                          <div className="text-sm">
                            <p>• {session.pages.length} páginas visitadas</p>
                            <p>• {session.products_viewed.length} produtos visualizados</p>
                            {session.cart_actions.length > 0 && (
                              <p>• {session.cart_actions.length} itens adicionados ao carrinho</p>
                            )}
                            {session.purchases.length > 0 && (
                              <p className="text-green-600 font-medium">• {session.purchases.length} compras realizadas</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Timeline não disponível</p>
                        <p className="text-sm">Dados de sessão estão sendo processados</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

