/**
 * TIMELINE DA JORNADA DO CLIENTE - VERSÃO CORRIGIDA
 * Corrige problema de associação de sessões aos clientes corretos
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
  Bug,
  CheckCircle
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

interface ClientJourneyTimelineFixedProps {
  clientId: string;
}

export const ClientJourneyTimelineFixed: React.FC<ClientJourneyTimelineFixedProps> = ({ clientId }) => {
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  // BUSCA INTELIGENTE: Múltiplas estratégias para encontrar sessões do cliente
  const fetchClientJourneyFixed = async () => {
    try {
      setLoading(true);
      console.log('🔧 [JOURNEY FIXED] Starting intelligent search for client:', clientId);

      // ESTRATÉGIA 1: Buscar mapeamento de IDs via realtime_activity
      console.log('🔍 [JOURNEY FIXED] Step 1: Finding ID mappings...');
      const { data: realtimeData, error: realtimeError } = await supabase
        .from('realtime_activity')
        .select('session_id, user_id')
        .or(`user_id.eq.${clientId},session_id.eq.${clientId}`);

      if (realtimeError) {
        console.error('❌ [JOURNEY FIXED] Realtime mapping error:', realtimeError);
      }

      // Extrair todos os IDs relacionados ao cliente
      const relatedIds = new Set<string>();
      relatedIds.add(clientId); // ID original

      realtimeData?.forEach(record => {
        if (record.user_id) relatedIds.add(record.user_id);
        if (record.session_id) relatedIds.add(record.session_id);
      });

      console.log('🆔 [JOURNEY FIXED] Related IDs found:', Array.from(relatedIds));

      // ESTRATÉGIA 2: Buscar sessões usando TODOS os IDs relacionados
      console.log('🔍 [JOURNEY FIXED] Step 2: Searching journey data...');
      
      const journeyPromises = Array.from(relatedIds).map(async (id) => {
        const { data, error } = await supabase
          .from('user_journey_detailed')
          .select('*')
          .or(`user_id.eq.${id},session_id.eq.${id}`)
          .order('step_start_time', { ascending: true });

        if (error) {
          console.error(`❌ [JOURNEY FIXED] Error searching for ID ${id}:`, error);
          return [];
        }

        console.log(`✅ [JOURNEY FIXED] Found ${data?.length || 0} records for ID: ${id}`);
        return data || [];
      });

      const journeyResults = await Promise.all(journeyPromises);
      
      // Combinar e deduplificar resultados
      const allJourneyData = new Map();
      journeyResults.flat().forEach(record => {
        allJourneyData.set(record.id, record);
      });

      const uniqueJourneyData = Array.from(allJourneyData.values());
      console.log('📊 [JOURNEY FIXED] Total unique journey records:', uniqueJourneyData.length);

      // ESTRATÉGIA 3: Agrupar por sessão
      const sessionMap = new Map<string, ClientSession>();

      uniqueJourneyData.forEach(step => {
        const sessionId = step.session_id;
        
        if (!sessionMap.has(sessionId)) {
          sessionMap.set(sessionId, {
            session_id: sessionId,
            start_time: step.step_start_time,
            end_time: step.step_end_time,
            total_duration: 0,
            device_info: step.action_details?.device_info || {},
            steps: []
          });
        }

        const session = sessionMap.get(sessionId)!;
        session.steps.push(step);

        // Atualizar tempos da sessão
        if (step.step_start_time < session.start_time) {
          session.start_time = step.step_start_time;
        }
        if (step.step_end_time && (!session.end_time || step.step_end_time > session.end_time)) {
          session.end_time = step.step_end_time;
        }
      });

      // Calcular duração total de cada sessão
      sessionMap.forEach(session => {
        if (session.end_time) {
          session.total_duration = Math.floor(
            (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000
          );
        } else {
          // Se não tem end_time, somar time_spent_seconds de todos os steps
          session.total_duration = session.steps.reduce((total, step) => total + (step.time_spent_seconds || 0), 0);
        }

        // Ordenar steps por número de sequência
        session.steps.sort((a, b) => a.step_number - b.step_number);
      });

      const sessionsArray = Array.from(sessionMap.values());
      
      // Ordenar sessões por data (mais recente primeiro)
      sessionsArray.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

      console.log('🎯 [JOURNEY FIXED] Final sessions processed:', sessionsArray.length);
      
      // Debug info
      setDebugInfo({
        clientId,
        relatedIds: Array.from(relatedIds),
        totalJourneyRecords: uniqueJourneyData.length,
        totalSessions: sessionsArray.length,
        searchStrategies: [
          'ID mapping via realtime_activity',
          'Multi-ID journey search',
          'Session grouping and deduplication'
        ]
      });

      setSessions(sessionsArray);
      
      // Auto-selecionar primeira sessão se houver
      if (sessionsArray.length > 0 && !selectedSession) {
        setSelectedSession(sessionsArray[0].session_id);
      }

    } catch (error) {
      console.error('❌ [JOURNEY FIXED] Error in fetchClientJourneyFixed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientJourneyFixed();
  }, [clientId]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'page_view': return <Eye className="h-4 w-4" />;
      case 'product_view': return <ShoppingCart className="h-4 w-4" />;
      case 'add_to_cart': return <ShoppingCart className="h-4 w-4" />;
      case 'purchase': return <CreditCard className="h-4 w-4" />;
      case 'click': return <MousePointer className="h-4 w-4" />;
      default: return <Navigation className="h-4 w-4" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'page_view': return 'bg-blue-100 text-blue-800';
      case 'product_view': return 'bg-green-100 text-green-800';
      case 'add_to_cart': return 'bg-orange-100 text-orange-800';
      case 'purchase': return 'bg-purple-100 text-purple-800';
      case 'click': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFunnelStageColor = (stage: string) => {
    switch (stage) {
      case 'awareness': return 'bg-blue-100 text-blue-800';
      case 'category_browse': return 'bg-cyan-100 text-cyan-800';
      case 'product_discovery': return 'bg-green-100 text-green-800';
      case 'purchase_intent': return 'bg-orange-100 text-orange-800';
      case 'purchase': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedSessionData = sessions.find(s => s.session_id === selectedSession);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando jornada do cliente...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Information */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Sistema de Busca Inteligente - ATIVO
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Client ID:</span>
              <div className="text-xs text-gray-600">{debugInfo.clientId}</div>
            </div>
            <div>
              <span className="font-medium">IDs Relacionados:</span>
              <div className="text-xs text-gray-600">{debugInfo.relatedIds?.length || 0}</div>
            </div>
            <div>
              <span className="font-medium">Registros Journey:</span>
              <div className="text-xs text-gray-600">{debugInfo.totalJourneyRecords || 0}</div>
            </div>
            <div>
              <span className="font-medium">Sessões Processadas:</span>
              <div className="text-xs text-gray-600">{debugInfo.totalSessions || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Selector */}
      {sessions.length > 0 && (
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
            <div className="grid gap-2">
              {sessions.map((session, index) => (
                <Button
                  key={session.session_id}
                  variant={selectedSession === session.session_id ? "default" : "outline"}
                  className="justify-start h-auto p-3"
                  onClick={() => setSelectedSession(session.session_id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <div className="font-medium">
                        Sessão {index + 1} | {formatDateTime(session.start_time)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTime(session.total_duration)} | {session.steps.length} ações
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Smartphone className="h-3 w-3 mr-1" />
                        {session.device_info?.screen?.width > 768 ? 'Desktop' : 'Mobile'}
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journey Timeline */}
      {selectedSessionData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Timeline de Ações
            </CardTitle>
            <CardDescription>
              Jornada detalhada da sessão selecionada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedSessionData.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${getActionColor(step.action_type)}`}>
                      {getActionIcon(step.action_type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">
                        {formatDateTime(step.step_start_time)}
                      </span>
                      <Badge className={getActionColor(step.action_type)}>
                        {step.action_type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={getFunnelStageColor(step.funnel_stage)}>
                        {step.funnel_stage.replace('_', ' ')}
                      </Badge>
                      {step.conversion_step && (
                        <Badge variant="default" className="bg-green-600">
                          Conversão
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="font-medium">{step.page_title || 'Página sem título'}</div>
                      <div className="text-xs text-gray-500 truncate">{step.page_url}</div>
                    </div>
                    
                    {step.action_details && (
                      <div className="text-xs text-gray-500">
                        {step.action_details.product_id && (
                          <div>Produto: {step.action_details.product_id}</div>
                        )}
                        {step.action_details.quantity && (
                          <div>Quantidade: {step.action_details.quantity}</div>
                        )}
                        {step.action_details.price && (
                          <div>Preço: R$ {step.action_details.price}</div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(step.time_spent_seconds || 0)}
                      </span>
                      <span>Score: {step.engagement_score}</span>
                      <span>Passo #{step.step_number}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma jornada encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Este cliente ainda não possui sessões registradas ou os dados estão sendo processados.
            </p>
            <Button onClick={fetchClientJourneyFixed} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

