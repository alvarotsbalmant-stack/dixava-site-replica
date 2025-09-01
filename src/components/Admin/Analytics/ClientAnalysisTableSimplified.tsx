/**
 * TABELA DE ANÁLISE DE CLIENTES - VERSÃO SIMPLIFICADA
 * Mostra todos os clientes disponíveis, mesmo com tempo 0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  ShoppingCart, 
  TrendingUp,
  User,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ClientDetailModal } from './ClientDetailModal';

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
  sessions: any[];
}

export const ClientAnalysisTableSimplified: React.FC = () => {
  const [clients, setClients] = useState<ClientAnalysis[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedClient, setSelectedClient] = useState<ClientAnalysis | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Função simplificada para buscar dados
  const fetchClientDataSimplified = async () => {
    try {
      setLoading(true);
      console.log('🔍 [SIMPLIFIED] Fetching all available data...');

      // Buscar TODOS os dados disponíveis
      const [realtimeResult, journeyResult, interactionsResult] = await Promise.all([
        supabase.from('realtime_activity').select('*').order('last_heartbeat', { ascending: false }),
        supabase.from('user_journey_detailed').select('*').order('step_start_time', { ascending: false }),
        supabase.from('page_interactions').select('*').order('created_at', { ascending: false })
      ]);

      const { data: realtimeActivity, error: realtimeError } = realtimeResult;
      const { data: journeyData, error: journeyError } = journeyResult;
      const { data: interactions, error: interactionsError } = interactionsResult;

      // Log de debug
      const debug = {
        realtimeActivity: realtimeActivity?.length || 0,
        journeyData: journeyData?.length || 0,
        interactions: interactions?.length || 0,
        errors: {
          realtime: realtimeError?.message,
          journey: journeyError?.message,
          interactions: interactionsError?.message
        }
      };
      
      setDebugInfo(debug);
      console.log('📊 [SIMPLIFIED] Raw data:', debug);

      if (realtimeError || journeyError || interactionsError) {
        console.error('❌ [SIMPLIFIED] Errors:', { realtimeError, journeyError, interactionsError });
      }

      // Processar dados de forma mais permissiva
      const clientMap = new Map<string, ClientAnalysis>();

      // 1. Processar atividade em tempo real
      realtimeActivity?.forEach(activity => {
        const userId = activity.user_id || activity.session_id || `anonymous_${activity.session_id}`;
        
        if (!clientMap.has(userId)) {
          clientMap.set(userId, {
            user_id: userId,
            email: null,
            first_session: activity.last_heartbeat || new Date().toISOString(),
            last_session: activity.last_heartbeat || new Date().toISOString(),
            total_sessions: 0,
            total_time_spent: 0,
            total_pages_visited: 0,
            total_products_viewed: 0,
            total_cart_additions: 0,
            total_purchases: 0,
            total_spent: 0,
            avg_session_duration: 0,
            conversion_rate: 0,
            favorite_categories: [],
            device_preference: 'Desktop',
            sessions: []
          });
        }

        const client = clientMap.get(userId)!;
        
        // Somar tempo (mesmo que seja 0)
        if (activity.time_on_site_seconds) {
          client.total_time_spent += activity.time_on_site_seconds;
        }

        // Atualizar datas
        if (activity.last_heartbeat) {
          if (activity.last_heartbeat < client.first_session) {
            client.first_session = activity.last_heartbeat;
          }
          if (activity.last_heartbeat > client.last_session) {
            client.last_session = activity.last_heartbeat;
          }
        }

        console.log(`👤 [SIMPLIFIED] Client ${userId}: time=${activity.time_on_site_seconds || 0}s`);
      });

      // 2. Processar jornada detalhada
      journeyData?.forEach(journey => {
        const userId = journey.user_id || journey.session_id || `anonymous_${journey.session_id}`;
        
        if (!clientMap.has(userId)) {
          clientMap.set(userId, {
            user_id: userId,
            email: null,
            first_session: journey.step_start_time || new Date().toISOString(),
            last_session: journey.step_start_time || new Date().toISOString(),
            total_sessions: 0,
            total_time_spent: 0,
            total_pages_visited: 0,
            total_products_viewed: 0,
            total_cart_additions: 0,
            total_purchases: 0,
            total_spent: 0,
            avg_session_duration: 0,
            conversion_rate: 0,
            favorite_categories: [],
            device_preference: 'Desktop',
            sessions: []
          });
        }

        const client = clientMap.get(userId)!;
        
        // Contar ações
        if (journey.action_type === 'page_view') {
          client.total_pages_visited++;
        }
        if (journey.action_type === 'product_view') {
          client.total_products_viewed++;
        }
        if (journey.action_type === 'add_to_cart') {
          client.total_cart_additions++;
        }
        if (journey.action_type === 'purchase') {
          client.total_purchases++;
          if (journey.action_details?.total_value) {
            client.total_spent += journey.action_details.total_value;
          }
        }

        // Somar tempo da jornada (mesmo que seja 0)
        if (journey.time_spent_seconds) {
          client.total_time_spent += journey.time_spent_seconds;
        }
      });

      // 3. Processar interações
      interactions?.forEach(interaction => {
        const userId = interaction.user_id || interaction.session_id || `anonymous_${interaction.session_id}`;
        
        if (clientMap.has(userId) && interaction.interaction_type === 'product_view') {
          // Já contado na jornada, mas validamos aqui
        }
      });

      // 4. Calcular métricas finais
      clientMap.forEach(client => {
        // Contar sessões únicas de forma mais permissiva
        const uniqueSessions = new Set();
        
        realtimeActivity?.forEach(activity => {
          const activityUserId = activity.user_id || activity.session_id || `anonymous_${activity.session_id}`;
          if (activityUserId === client.user_id) {
            uniqueSessions.add(activity.session_id);
          }
        });
        
        journeyData?.forEach(journey => {
          const journeyUserId = journey.user_id || journey.session_id || `anonymous_${journey.session_id}`;
          if (journeyUserId === client.user_id) {
            uniqueSessions.add(journey.session_id);
          }
        });
        
        client.total_sessions = Math.max(uniqueSessions.size, 1); // Pelo menos 1 sessão
        
        // Calcular métricas
        client.avg_session_duration = client.total_sessions > 0 
          ? client.total_time_spent / client.total_sessions 
          : 0;
        
        client.conversion_rate = client.total_products_viewed > 0 
          ? (client.total_purchases / client.total_products_viewed) * 100 
          : 0;

        console.log(`📊 [SIMPLIFIED] Client ${client.user_id}:`, {
          sessions: client.total_sessions,
          time: client.total_time_spent,
          pages: client.total_pages_visited,
          products: client.total_products_viewed,
          conversions: client.total_purchases
        });
      });

      // 5. Converter para array (SEM FILTROS RESTRITIVOS)
      const clientsArray = Array.from(clientMap.values())
        .sort((a, b) => new Date(b.last_session).getTime() - new Date(a.last_session).getTime());

      console.log(`✅ [SIMPLIFIED] Found ${clientsArray.length} clients total`);

      setClients(clientsArray);
      setFilteredClients(clientsArray);
    } catch (error) {
      console.error('❌ [SIMPLIFIED] Error fetching client data:', error);
      setDebugInfo(prev => ({ ...prev, fetchError: error.message }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDataSimplified();
  }, []);

  // Função para filtrar clientes
  useEffect(() => {
    let filtered = clients;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por tipo
    switch (filterType) {
      case 'high_value':
        filtered = filtered.filter(client => client.total_spent > 500);
        break;
      case 'frequent':
        filtered = filtered.filter(client => client.total_sessions > 5);
        break;
      case 'recent':
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        filtered = filtered.filter(client => new Date(client.last_session) > oneDayAgo);
        break;
      case 'converters':
        filtered = filtered.filter(client => client.total_purchases > 0);
        break;
      case 'with_time':
        filtered = filtered.filter(client => client.total_time_spent > 0);
        break;
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, filterType]);

  // Função para formatar tempo
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return '0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Função para determinar status do cliente
  const getClientStatus = (lastSession: string) => {
    const now = new Date();
    const lastActivity = new Date(lastSession);
    const diffHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return { label: 'Ativo Agora', color: 'bg-green-500' };
    if (diffHours < 24) return { label: 'Ativo Hoje', color: 'bg-blue-500' };
    if (diffHours < 168) return { label: 'Esta Semana', color: 'bg-yellow-500' };
    if (diffHours < 720) return { label: 'Este Mês', color: 'bg-orange-500' };
    return { label: 'Inativo', color: 'bg-gray-500' };
  };

  // Estatísticas resumidas
  const totalClients = filteredClients.length;
  const activeClients = filteredClients.filter(c => {
    const diffHours = (new Date().getTime() - new Date(c.last_session).getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }).length;
  const clientsWithPurchases = filteredClients.filter(c => c.total_purchases > 0).length;
  const avgTimeSpent = filteredClients.length > 0 
    ? Math.floor(filteredClients.reduce((sum, c) => sum + c.total_time_spent, 0) / filteredClients.length)
    : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Carregando Análise de Clientes...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm text-blue-800">Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-blue-700 space-y-1">
            <div>Realtime Activity: {debugInfo.realtimeActivity} registros</div>
            <div>Journey Data: {debugInfo.journeyData} registros</div>
            <div>Interactions: {debugInfo.interactions} registros</div>
            <div>Total Clientes Processados: {clients.length}</div>
            {debugInfo.errors?.realtime && <div className="text-red-600">Erro Realtime: {debugInfo.errors.realtime}</div>}
            {debugInfo.errors?.journey && <div className="text-red-600">Erro Journey: {debugInfo.errors.journey}</div>}
            {debugInfo.errors?.interactions && <div className="text-red-600">Erro Interactions: {debugInfo.errors.interactions}</div>}
            {debugInfo.fetchError && <div className="text-red-600">Erro Fetch: {debugInfo.fetchError}</div>}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                <p className="text-2xl font-bold">{totalClients}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold">{activeClients}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Compras</p>
                <p className="text-2xl font-bold">{clientsWithPurchases}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold">{formatTime(avgTimeSpent)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Individual de Clientes (Simplificada)</CardTitle>
          <CardDescription>
            Mostra todos os clientes disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por ID do cliente ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  <SelectItem value="with_time">Com Tempo &gt; 0</SelectItem>
                  <SelectItem value="high_value">Alto Valor (&gt;R$500)</SelectItem>
                  <SelectItem value="frequent">Frequentes (&gt;5 sessões)</SelectItem>
                  <SelectItem value="recent">Ativos Recentemente</SelectItem>
                  <SelectItem value="converters">Com Compras</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchClientDataSimplified} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Lista de Clientes */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Tempo Total</TableHead>
                  <TableHead>Produtos Vistos</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead>Conversão</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const status = getClientStatus(client.last_session);
                  return (
                    <TableRow key={client.user_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">Cliente {client.user_id.slice(-8)}</div>
                          <div className="text-sm text-gray-500">ID: {client.user_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.total_sessions}</TableCell>
                      <TableCell className="font-mono">
                        {formatTime(client.total_time_spent)}
                      </TableCell>
                      <TableCell>{client.total_products_viewed}</TableCell>
                      <TableCell>{client.total_purchases}</TableCell>
                      <TableCell>
                        <span className={client.conversion_rate > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                          {client.conversion_rate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(client.last_session).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClient(client)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {clients.length === 0 
                ? "Nenhum dado encontrado nas tabelas do banco de dados."
                : "Nenhum cliente encontrado com os filtros aplicados."
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

