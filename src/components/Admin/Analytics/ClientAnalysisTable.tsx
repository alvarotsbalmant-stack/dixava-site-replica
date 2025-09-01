import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  ShoppingCart, 
  TrendingUp,
  User,
  Calendar,
  MapPin,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ClientDetailModal } from './ClientDetailModal';

interface ClientSession {
  session_id: string;
  user_id: string | null;
  start_time: string;
  end_time: string | null;
  total_duration: number | null;
  device_info: any;
  location_info: any;
  pages_visited: number;
  products_viewed: number;
  cart_items_added: number;
  purchases_made: number;
  total_spent: number;
  last_activity: string;
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

export const ClientAnalysisTable = () => {
  const [clients, setClients] = useState<ClientAnalysis[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedClient, setSelectedClient] = useState<ClientAnalysis | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      // Buscar dados das sessões detalhadas
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_journey_detailed')
        .select(`
          session_id,
          user_id,
          step_start_time,
          step_end_time,
          page_url,
          action_type,
          engagement_score,
          funnel_stage
        `)
        .order('step_start_time', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Buscar dados de atividade em tempo real
      const { data: activity, error: activityError } = await supabase
        .from('realtime_activity')
        .select('*')
        .order('last_heartbeat', { ascending: false });

      if (activityError) throw activityError;

      // Buscar interações detalhadas
      const { data: interactions, error: interactionsError } = await supabase
        .from('page_interactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (interactionsError) throw interactionsError;

      // Processar dados para criar análise por cliente
      const clientMap = new Map<string, ClientAnalysis>();

      // Processar sessões
      sessions?.forEach(session => {
        const userId = session.user_id || session.session_id;
        if (!clientMap.has(userId)) {
          clientMap.set(userId, {
            user_id: userId,
            email: null,
            first_session: session.step_start_time,
            last_session: session.step_start_time,
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
        
        // Atualizar estatísticas
        if (session.step_start_time < client.first_session) {
          client.first_session = session.step_start_time;
        }
        if (session.step_start_time > client.last_session) {
          client.last_session = session.step_start_time;
        }

        client.total_pages_visited++;
        
        if (session.action_type === 'product_view') {
          client.total_products_viewed++;
        }
        if (session.action_type === 'add_to_cart') {
          client.total_cart_additions++;
        }
        if (session.action_type === 'purchase') {
          client.total_purchases++;
        }
      });

      // Processar atividade em tempo real
      activity?.forEach(act => {
        const userId = act.session_id;
        if (clientMap.has(userId)) {
          const client = clientMap.get(userId)!;
          if (act.time_on_site_seconds) {
            client.total_time_spent += act.time_on_site_seconds;
          }
        }
      });

      // Calcular métricas derivadas
      clientMap.forEach(client => {
        const uniqueSessions = new Set();
        sessions?.forEach(s => {
          if ((s.user_id || s.session_id) === client.user_id) {
            uniqueSessions.add(s.session_id);
          }
        });
        
        client.total_sessions = uniqueSessions.size;
        client.avg_session_duration = client.total_sessions > 0 
          ? client.total_time_spent / client.total_sessions 
          : 0;
        client.conversion_rate = client.total_products_viewed > 0 
          ? (client.total_purchases / client.total_products_viewed) * 100 
          : 0;
      });

      const clientsArray = Array.from(clientMap.values())
        .filter(client => client.total_sessions > 0)
        .sort((a, b) => new Date(b.last_session).getTime() - new Date(a.last_session).getTime());

      setClients(clientsArray);
      setFilteredClients(clientsArray);
    } catch (error) {
      console.error('Erro ao buscar dados de clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  useEffect(() => {
    let filtered = clients;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoria
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'high_value':
          filtered = filtered.filter(client => client.total_spent > 500);
          break;
        case 'frequent':
          filtered = filtered.filter(client => client.total_sessions > 5);
          break;
        case 'recent':
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          filtered = filtered.filter(client => 
            new Date(client.last_session) > oneWeekAgo
          );
          break;
        case 'converters':
          filtered = filtered.filter(client => client.total_purchases > 0);
          break;
      }
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, filterBy]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClientStatus = (client: ClientAnalysis) => {
    const lastSession = new Date(client.last_session);
    const now = new Date();
    const daysDiff = (now.getTime() - lastSession.getTime()) / (1000 * 3600 * 24);

    if (daysDiff < 1) return { label: 'Ativo Hoje', variant: 'default' as const };
    if (daysDiff < 7) return { label: 'Ativo Esta Semana', variant: 'secondary' as const };
    if (daysDiff < 30) return { label: 'Ativo Este Mês', variant: 'outline' as const };
    return { label: 'Inativo', variant: 'destructive' as const };
  };

  const handleViewClient = (client: ClientAnalysis) => {
    setSelectedClient(client);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Análise Individual de Clientes</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe o comportamento detalhado de cada cliente
          </p>
        </div>
        <Button
          onClick={fetchClientData}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID do cliente ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Clientes</SelectItem>
                    <SelectItem value="high_value">Alto Valor (&gt;R$500)</SelectItem>
                    <SelectItem value="frequent">Frequentes (&gt;5 sessões)</SelectItem>
                    <SelectItem value="recent">Ativos Recentemente</SelectItem>
                    <SelectItem value="converters">Com Compras</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => {
                    const daysDiff = (new Date().getTime() - new Date(c.last_session).getTime()) / (1000 * 3600 * 24);
                    return daysDiff < 7;
                  }).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Compras</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.total_purchases > 0).length}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">
                  {clients.length > 0 
                    ? formatDuration(clients.reduce((acc, c) => acc + c.avg_session_duration, 0) / clients.length)
                    : '0m'
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {filteredClients.length} de {clients.length} clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando dados...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                    const status = getClientStatus(client);
                    return (
                      <TableRow key={client.user_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {client.email || `Cliente ${client.user_id.slice(-8)}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {client.user_id.slice(-12)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{client.total_sessions}</span>
                        </TableCell>
                        <TableCell>
                          {formatDuration(client.total_time_spent)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{client.total_products_viewed}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{client.total_purchases}</span>
                          {client.total_spent > 0 && (
                            <p className="text-sm text-muted-foreground">
                              R$ {client.total_spent.toFixed(2)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            client.conversion_rate > 10 ? 'text-green-600' :
                            client.conversion_rate > 5 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {client.conversion_rate.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(client.last_session)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewClient(client)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredClients.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Nenhum cliente encontrado com os filtros aplicados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Cliente */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          open={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};

