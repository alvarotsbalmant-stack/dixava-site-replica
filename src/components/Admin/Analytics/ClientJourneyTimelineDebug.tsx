/**
 * TIMELINE DA JORNADA DO CLIENTE - VERSÃO DEBUG
 * Versão com debug detalhado para investigar por que alguns clientes não mostram sessões
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
  Smartphone,
  Bug
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

interface DebugInfo {
  clientId: string;
  journeyRecords: number;
  realtimeRecords: number;
  interactionRecords: number;
  uniqueUserIds: string[];
  uniqueSessionIds: string[];
  searchQueries: string[];
  errors: string[];
}

interface ClientJourneyTimelineDebugProps {
  clientId: string;
}

export const ClientJourneyTimelineDebug: React.FC<ClientJourneyTimelineDebugProps> = ({ clientId }) => {
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    clientId,
    journeyRecords: 0,
    realtimeRecords: 0,
    interactionRecords: 0,
    uniqueUserIds: [],
    uniqueSessionIds: [],
    searchQueries: [],
    errors: []
  });

  // Buscar jornada detalhada do cliente com debug extensivo
  const fetchClientJourney = async () => {
    try {
      setLoading(true);
      const debug: DebugInfo = {
        clientId,
        journeyRecords: 0,
        realtimeRecords: 0,
        interactionRecords: 0,
        uniqueUserIds: [],
        uniqueSessionIds: [],
        searchQueries: [],
        errors: []
      };

      console.log('🔍 [JOURNEY DEBUG] Starting investigation for client:', clientId);

      // BUSCA 1: Jornada detalhada - múltiplas estratégias
      console.log('📊 [JOURNEY DEBUG] Strategy 1: Direct user_id match');
      const query1 = supabase
        .from('user_journey_detailed')
        .select('*')
        .eq('user_id', clientId)
        .order('step_start_time', { ascending: true });
      
      debug.searchQueries.push(`user_id.eq.${clientId}`);
      
      const { data: journeyData1, error: journeyError1 } = await query1;
      
      if (journeyError1) {
        debug.errors.push(`Journey query 1 error: ${journeyError1.message}`);
        console.error('❌ [JOURNEY DEBUG] Query 1 error:', journeyError1);
      }

      console.log('📊 [JOURNEY DEBUG] Strategy 2: Direct session_id match');
      const query2 = supabase
        .from('user_journey_detailed')
        .select('*')
        .eq('session_id', clientId)
        .order('step_start_time', { ascending: true });
      
      debug.searchQueries.push(`session_id.eq.${clientId}`);
      
      const { data: journeyData2, error: journeyError2 } = await query2;
      
      if (journeyError2) {
        debug.errors.push(`Journey query 2 error: ${journeyError2.message}`);
        console.error('❌ [JOURNEY DEBUG] Query 2 error:', journeyError2);
      }

      console.log('📊 [JOURNEY DEBUG] Strategy 3: OR condition');
      const query3 = supabase
        .from('user_journey_detailed')
        .select('*')
        .or(`user_id.eq.${clientId},session_id.eq.${clientId}`)
        .order('step_start_time', { ascending: true });
      
      debug.searchQueries.push(`user_id.eq.${clientId} OR session_id.eq.${clientId}`);
      
      const { data: journeyData3, error: journeyError3 } = await query3;
      
      if (journeyError3) {
        debug.errors.push(`Journey query 3 error: ${journeyError3.message}`);
        console.error('❌ [JOURNEY DEBUG] Query 3 error:', journeyError3);
      }

      // Combinar resultados únicos
      const allJourneyData = new Map();
      
      [journeyData1, journeyData2, journeyData3].forEach((data, index) => {
        if (data) {
          console.log(`📊 [JOURNEY DEBUG] Query ${index + 1} returned ${data.length} records`);
          data.forEach(record => {
            const key = `${record.session_id}_${record.step_number}`;
            if (!allJourneyData.has(key)) {
              allJourneyData.set(key, record);
            }
          });
        }
      });

      const journeyData = Array.from(allJourneyData.values());
      debug.journeyRecords = journeyData.length;

      // BUSCA 2: Atividade em tempo real - múltiplas estratégias
      console.log('📊 [JOURNEY DEBUG] Realtime Strategy 1: Direct user_id match');
      const { data: realtimeData1, error: realtimeError1 } = await supabase
        .from('realtime_activity')
        .select('*')
        .eq('user_id', clientId)
        .order('last_heartbeat', { ascending: false });

      console.log('📊 [JOURNEY DEBUG] Realtime Strategy 2: Direct session_id match');
      const { data: realtimeData2, error: realtimeError2 } = await supabase
        .from('realtime_activity')
        .select('*')
        .eq('session_id', clientId)
        .order('last_heartbeat', { ascending: false });

      console.log('📊 [JOURNEY DEBUG] Realtime Strategy 3: OR condition');
      const { data: realtimeData3, error: realtimeError3 } = await supabase
        .from('realtime_activity')
        .select('*')
        .or(`user_id.eq.${clientId},session_id.eq.${clientId}`)
        .order('last_heartbeat', { ascending: false });

      // Combinar dados de realtime
      const allRealtimeData = new Map();
      
      [realtimeData1, realtimeData2, realtimeData3].forEach((data, index) => {
        if (data) {
          console.log(`📊 [JOURNEY DEBUG] Realtime query ${index + 1} returned ${data.length} records`);
          data.forEach(record => {
            if (!allRealtimeData.has(record.session_id)) {
              allRealtimeData.set(record.session_id, record);
            }
          });
        }
      });

      const realtimeData = Array.from(allRealtimeData.values());
      debug.realtimeRecords = realtimeData.length;

      // BUSCA 3: Interações de página
      console.log('📊 [JOURNEY DEBUG] Interactions search');
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('page_interactions')
        .select('*')
        .or(`user_id.eq.${clientId},session_id.eq.${clientId}`)
        .order('timestamp_precise', { ascending: false });

      if (interactionsError) {
        debug.errors.push(`Interactions error: ${interactionsError.message}`);
      }

      debug.interactionRecords = interactionsData?.length || 0;

      // Coletar IDs únicos para debug
      const userIds = new Set<string>();
      const sessionIds = new Set<string>();

      journeyData.forEach(record => {
        if (record.user_id) userIds.add(record.user_id);
        if (record.session_id) sessionIds.add(record.session_id);
      });

      realtimeData.forEach(record => {
        if (record.user_id) userIds.add(record.user_id);
        if (record.session_id) sessionIds.add(record.session_id);
      });

      debug.uniqueUserIds = Array.from(userIds);
      debug.uniqueSessionIds = Array.from(sessionIds);

      console.log('🔍 [JOURNEY DEBUG] Debug summary:', {
        clientId,
        journeyRecords: debug.journeyRecords,
        realtimeRecords: debug.realtimeRecords,
        interactionRecords: debug.interactionRecords,
        uniqueUserIds: debug.uniqueUserIds,
        uniqueSessionIds: debug.uniqueSessionIds,
        errors: debug.errors
      });

      // Processar sessões se houver dados
      const sessionMap = new Map<string, ClientSession>();

      if (journeyData.length > 0) {
        console.log('📊 [JOURNEY DEBUG] Processing journey data...');
        
        journeyData.forEach(step => {
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
        realtimeData.forEach(activity => {
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

        console.log(`✅ [JOURNEY DEBUG] Processed ${sessionsArray.length} sessions with ${journeyData.length} total steps`);

        setSessions(sessionsArray);
        
        // Selecionar primeira sessão por padrão
        if (sessionsArray.length > 0) {
          setSelectedSession(sessionsArray[0].session_id);
        }
      } else {
        console.log('❌ [JOURNEY DEBUG] No journey data found for client:', clientId);
        setSessions([]);
      }

      setDebugInfo(debug);

    } catch (error) {
      console.error('❌ [JOURNEY DEBUG] Error fetching client journey:', error);
      setDebugInfo(prev => ({
        ...prev,
        errors: [...prev.errors, `General error: ${error}`]
      }));
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
        return <Eye className="h-4 w-4" />;
      case 'add_to_cart':
        return <ShoppingCart className="h-4 w-4" />;
      case 'purchase':
        return <CreditCard className="h-4 w-4" />;
      case 'click':
        return <MousePointer className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

  // Função para obter cor do badge do estágio
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'awareness':
        return 'bg-blue-100 text-blue-800';
      case 'category_browse':
        return 'bg-green-100 text-green-800';
      case 'product_discovery':
        return 'bg-yellow-100 text-yellow-800';
      case 'consideration':
        return 'bg-orange-100 text-orange-800';
      case 'purchase_intent':
        return 'bg-red-100 text-red-800';
      case 'purchase':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando jornada detalhada...</span>
      </div>
    );
  }

  const selectedSessionData = sessions.find(s => s.session_id === selectedSession);

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Client ID:</strong> {debugInfo.clientId}
            </div>
            <div>
              <strong>Journey Records:</strong> {debugInfo.journeyRecords}
            </div>
            <div>
              <strong>Realtime Records:</strong> {debugInfo.realtimeRecords}
            </div>
            <div>
              <strong>Interaction Records:</strong> {debugInfo.interactionRecords}
            </div>
          </div>
          
          {debugInfo.uniqueUserIds.length > 0 && (
            <div className="mt-4">
              <strong>User IDs found:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {debugInfo.uniqueUserIds.map(id => (
                  <Badge key={id} variant="outline" className="text-xs">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {debugInfo.uniqueSessionIds.length > 0 && (
            <div className="mt-4">
              <strong>Session IDs found:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {debugInfo.uniqueSessionIds.slice(0, 5).map(id => (
                  <Badge key={id} variant="outline" className="text-xs">
                    {id}
                  </Badge>
                ))}
                {debugInfo.uniqueSessionIds.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{debugInfo.uniqueSessionIds.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {debugInfo.errors.length > 0 && (
            <div className="mt-4">
              <strong className="text-red-600">Errors:</strong>
              <ul className="list-disc list-inside mt-1 text-red-600">
                {debugInfo.errors.map((error, index) => (
                  <li key={index} className="text-xs">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Navigation className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma jornada encontrada
            </h3>
            <p className="text-gray-500 text-center">
              Este cliente ainda não possui dados de navegação detalhados.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              ID do Cliente: {debugInfo.clientId}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session, index) => (
                  <Button
                    key={session.session_id}
                    variant={selectedSession === session.session_id ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setSelectedSession(session.session_id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        {session.steps.length} ações
                      </Badge>
                      <span className="font-semibold">Sessão {index + 1}</span>
                    </div>
                    <div className="text-xs text-left space-y-1">
                      <div>{new Date(session.start_time).toLocaleDateString('pt-BR')}</div>
                      <div>{new Date(session.start_time).toLocaleTimeString('pt-BR')}</div>
                      <div>{formatTime(session.total_duration)}</div>
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
                  <MapPin className="h-5 w-5" />
                  Jornada Detalhada - Sessão {sessions.findIndex(s => s.session_id === selectedSession) + 1}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span>{new Date(selectedSessionData.start_time).toLocaleString('pt-BR')}</span>
                  <span>•</span>
                  <span>{formatTime(selectedSessionData.total_duration)}</span>
                  <span>•</span>
                  <span>{selectedSessionData.steps.length} ações</span>
                  {selectedSessionData.device_info?.userAgent && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Smartphone className="h-4 w-4" />
                        <span>
                          {selectedSessionData.device_info.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
                        </span>
                      </div>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedSessionData.steps.map((step, index) => (
                    <div key={step.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          {getActionIcon(step.action_type)}
                        </div>
                        {index < selectedSessionData.steps.length - 1 && (
                          <div className="w-px h-8 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">
                            {new Date(step.step_start_time).toLocaleTimeString('pt-BR')}
                          </span>
                          <Badge className={getStageColor(step.funnel_stage)}>
                            {step.funnel_stage}
                          </Badge>
                          {step.conversion_step && (
                            <Badge variant="destructive">Conversão</Badge>
                          )}
                        </div>
                        
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {step.action_type === 'page_view' && '👁️ Visualizou página'}
                          {step.action_type === 'product_view' && '🛍️ Visualizou produto'}
                          {step.action_type === 'add_to_cart' && '🛒 Adicionou ao carrinho'}
                          {step.action_type === 'purchase' && '💳 Realizou compra'}
                          {step.action_type === 'click' && '🖱️ Clicou em elemento'}
                        </h4>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="font-mono text-xs">{step.page_url}</span>
                          </div>
                          
                          {step.page_title && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">📄</span>
                              <span>{step.page_title}</span>
                            </div>
                          )}
                          
                          {step.action_details && Object.keys(step.action_details).length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <strong>Detalhes:</strong>
                              <pre className="mt-1 whitespace-pre-wrap">
                                {JSON.stringify(step.action_details, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(step.time_spent_seconds)}</span>
                            </div>
                            <div>
                              Passo {step.step_number}
                            </div>
                            <div>
                              Engajamento: {step.engagement_score}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Resumo da Sessão */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">📊 Resumo da Sessão</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total de Ações:</span>
                      <div className="font-semibold">{selectedSessionData.steps.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Páginas Visitadas:</span>
                      <div className="font-semibold">
                        {new Set(selectedSessionData.steps.map(s => s.page_url)).size}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Produtos Visualizados:</span>
                      <div className="font-semibold">
                        {selectedSessionData.steps.filter(s => s.action_type === 'product_view').length}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Conversões:</span>
                      <div className="font-semibold">
                        {selectedSessionData.steps.filter(s => s.conversion_step).length}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

