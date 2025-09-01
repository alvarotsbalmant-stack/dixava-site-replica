/**
 * TIMELINE DA JORNADA DO CLIENTE
 * Mostra cada página visitada, tempo gasto, produtos visualizados em ordem cronológica
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Eye, 
  ShoppingCart, 
  CreditCard,
  MousePointer,
  Navigation,
  RefreshCw,
  Calendar,
  MapPin,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface JourneyStep {
  id: string;
  session_id: string;
  step_number: number;
  page_url: string;
  page_title: string;
  action_type: string;
  action_details: any;
  time_spent_seconds: number;
  cumulative_time_seconds: number;
  step_start_time: string;
  step_end_time: string | null;
  funnel_stage: string;
  conversion_step: boolean;
  engagement_score: number;
}

interface ClientSession {
  session_id: string;
  start_time: string;
  end_time: string | null;
  total_duration: number;
  device_info: any;
  steps: JourneyStep[];
}

interface ClientJourneyTimelineProps {
  clientId: string;
}

export const ClientJourneyTimeline: React.FC<ClientJourneyTimelineProps> = ({ clientId }) => {
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Buscar jornada detalhada do cliente
  const fetchClientJourney = async () => {
    try {
      setLoading(true);
      console.log('🔍 [JOURNEY] Fetching journey for client:', clientId);

      // Buscar dados da jornada detalhada
      const { data: journeyData, error: journeyError } = await supabase
        .from('user_journey_detailed')
        .select('*')
        .or(`user_id.eq.${clientId},session_id.eq.${clientId}`)
        .order('step_start_time', { ascending: true });

      if (journeyError) {
        console.error('❌ [JOURNEY] Error fetching journey:', journeyError);
        throw journeyError;
      }

      // Buscar dados de atividade em tempo real para informações de sessão
      const { data: realtimeData, error: realtimeError } = await supabase
        .from('realtime_activity')
        .select('*')
        .or(`user_id.eq.${clientId},session_id.eq.${clientId}`)
        .order('last_heartbeat', { ascending: false });

      if (realtimeError) {
        console.error('❌ [JOURNEY] Error fetching realtime data:', realtimeError);
      }

      console.log('📊 [JOURNEY] Raw data:', {
        journeySteps: journeyData?.length || 0,
        realtimeActivities: realtimeData?.length || 0
      });

      // Agrupar por sessão
      const sessionMap = new Map<string, ClientSession>();

      // Processar dados de jornada
      journeyData?.forEach(step => {
        const sessionId = step.session_id;
        
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, {
            session_id: sessionId,
            start_time: step.step_start_time,
            end_time: null,
            total_duration: 0,
            device_info: {},
            steps: []
          });
        }

        const session = sessionMap.get(sessionId)!;
        
        // Atualizar informações da sessão
        if (step.step_start_time < session.start_time) {
          session.start_time = step.step_start_time;
        }
        if (step.step_end_time && (!session.end_time || step.step_end_time > session.end_time)) {
          session.end_time = step.step_end_time;
        }

        // Adicionar step à sessão
        session.steps.push({
          id: `${step.session_id}_${step.step_number}`,
          session_id: step.session_id,
          step_number: step.step_number,
          page_url: step.page_url,
          page_title: step.page_title,
          action_type: step.action_type,
          action_details: step.action_details || {},
          time_spent_seconds: step.time_spent_seconds || 0,
          cumulative_time_seconds: step.cumulative_time_seconds || 0,
          step_start_time: step.step_start_time,
          step_end_time: step.step_end_time,
          funnel_stage: step.funnel_stage || 'unknown',
          conversion_step: step.conversion_step || false,
          engagement_score: step.engagement_score || 0
        });
      });

      // Adicionar informações de realtime
      realtimeData?.forEach(activity => {
        const sessionId = activity.session_id;
        if (sessionMap.has(sessionId)) {
          const session = sessionMap.get(sessionId)!;
          session.device_info = activity.device_info || {};
          session.total_duration = activity.time_on_site_seconds || 0;
        }
      });

      // Ordenar steps dentro de cada sessão
      sessionMap.forEach(session => {
        session.steps.sort((a, b) => a.step_number - b.step_number);
        
        // Calcular duração total da sessão se não tiver
        if (!session.total_duration && session.steps.length > 0) {
          session.total_duration = session.steps.reduce((sum, step) => sum + step.time_spent_seconds, 0);
        }
      });

      // Converter para array e ordenar por data
      const sessionsArray = Array.from(sessionMap.values())
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

      console.log(`✅ [JOURNEY] Processed ${sessionsArray.length} sessions with ${journeyData?.length || 0} total steps`);

      setSessions(sessionsArray);
      
      // Selecionar primeira sessão por padrão
      if (sessionsArray.length > 0) {
        setSelectedSession(sessionsArray[0].session_id);
      }

    } catch (error) {
      console.error('❌ [JOURNEY] Error fetching client journey:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchClientJourney();
    }
  }, [clientId]);

  // Função para formatar tempo
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Função para obter ícone da ação
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'page_view':
        return <Eye className="h-4 w-4" />;
      case 'product_view':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'add_to_cart':
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'purchase':
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      case 'click':
        return <MousePointer className="h-4 w-4 text-orange-500" />;
      default:
        return <Navigation className="h-4 w-4 text-gray-500" />;
    }
  };

  // Função para obter cor do badge do funnel
  const getFunnelColor = (stage: string) => {
    switch (stage) {
      case 'awareness':
        return 'bg-blue-500';
      case 'category_browse':
        return 'bg-green-500';
      case 'product_discovery':
        return 'bg-yellow-500';
      case 'consideration':
        return 'bg-orange-500';
      case 'purchase_intent':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Função para formatar URL
  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
            Carregando jornada do cliente...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Navigation className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nenhuma jornada encontrada</p>
            <p className="text-sm">Este cliente ainda não possui dados de navegação detalhados.</p>
            <p className="text-xs mt-2 text-gray-400">ID: {clientId}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedSessionData = sessions.find(s => s.session_id === selectedSession);

  return (
    <div className="space-y-4">
      {/* Seletor de Sessões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sessões do Cliente ({sessions.length})
          </CardTitle>
          <CardDescription>
            Selecione uma sessão para ver a jornada detalhada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sessions.map((session, index) => (
              <Button
                key={session.session_id}
                variant={selectedSession === session.session_id ? "default" : "outline"}
                className="h-auto p-3 text-left"
                onClick={() => setSelectedSession(session.session_id)}
              >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Sessão {index + 1}</span>
                    <Badge variant="secondary" className="text-xs">
                      {session.steps.length} ações
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>{new Date(session.start_time).toLocaleDateString('pt-BR')}</div>
                    <div>{new Date(session.start_time).toLocaleTimeString('pt-BR')}</div>
                    <div className="font-medium">{formatTime(session.total_duration)}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline da Sessão Selecionada */}
      {selectedSessionData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Jornada Detalhada - Sessão {sessions.findIndex(s => s.session_id === selectedSession) + 1}
            </CardTitle>
            <CardDescription>
              {new Date(selectedSessionData.start_time).toLocaleString('pt-BR')} • 
              Duração: {formatTime(selectedSessionData.total_duration)} • 
              {selectedSessionData.steps.length} ações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Informações da Sessão */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Dispositivo:</span>
                  <div className="font-medium flex items-center gap-1">
                    <Smartphone className="h-4 w-4" />
                    {selectedSessionData.device_info?.userAgent ? 
                      (selectedSessionData.device_info.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop') : 
                      'Desconhecido'
                    }
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Início:</span>
                  <div className="font-medium">{new Date(selectedSessionData.start_time).toLocaleTimeString('pt-BR')}</div>
                </div>
                <div>
                  <span className="text-gray-600">Fim:</span>
                  <div className="font-medium">
                    {selectedSessionData.end_time ? 
                      new Date(selectedSessionData.end_time).toLocaleTimeString('pt-BR') : 
                      'Em andamento'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline de Ações */}
            <div className="space-y-4">
              {selectedSessionData.steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  {/* Linha do tempo */}
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full ${step.conversion_step ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {getActionIcon(step.action_type)}
                    </div>
                    {index < selectedSessionData.steps.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Conteúdo da ação */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">
                          {step.action_type === 'page_view' && 'Visualizou página'}
                          {step.action_type === 'product_view' && 'Visualizou produto'}
                          {step.action_type === 'add_to_cart' && 'Adicionou ao carrinho'}
                          {step.action_type === 'purchase' && 'Realizou compra'}
                          {step.action_type === 'click' && 'Clicou em elemento'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(step.step_start_time).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getFunnelColor(step.funnel_stage)} text-white text-xs`}>
                          {step.funnel_stage}
                        </Badge>
                        {step.conversion_step && (
                          <Badge variant="secondary" className="text-xs">
                            Conversão
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm font-mono text-gray-600">
                          {formatUrl(step.page_url)}
                        </span>
                      </div>
                      
                      {step.page_title && (
                        <div className="text-sm font-medium">{step.page_title}</div>
                      )}

                      {/* Detalhes específicos da ação */}
                      {step.action_details && Object.keys(step.action_details).length > 0 && (
                        <div className="text-xs text-gray-600 space-y-1">
                          {step.action_details.product_id && (
                            <div>Produto: {step.action_details.product_id}</div>
                          )}
                          {step.action_details.quantity && (
                            <div>Quantidade: {step.action_details.quantity}</div>
                          )}
                          {step.action_details.price && (
                            <div>Preço: R$ {step.action_details.price}</div>
                          )}
                          {step.action_details.total_value && (
                            <div>Valor Total: R$ {step.action_details.total_value}</div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(step.time_spent_seconds)}
                          </span>
                          <span>Engajamento: {step.engagement_score}%</span>
                        </div>
                        <span>Passo {step.step_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo da Sessão */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Resumo da Sessão</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Total de Ações:</span>
                  <div className="font-medium">{selectedSessionData.steps.length}</div>
                </div>
                <div>
                  <span className="text-gray-600">Páginas Visitadas:</span>
                  <div className="font-medium">
                    {selectedSessionData.steps.filter(s => s.action_type === 'page_view').length}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Produtos Visualizados:</span>
                  <div className="font-medium">
                    {selectedSessionData.steps.filter(s => s.action_type === 'product_view').length}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Conversões:</span>
                  <div className="font-medium">
                    {selectedSessionData.steps.filter(s => s.conversion_step).length}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

