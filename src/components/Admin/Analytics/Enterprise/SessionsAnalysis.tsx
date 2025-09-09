/**
 * SESSIONS ANALYSIS - Análise detalhada de todas as sessões
 * Mostra todas as sessões com possibilidade de ver detalhes individuais
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Eye, 
  ShoppingCart, 
  TrendingUp, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Calendar,
  User,
  Target,
  Activity,
  MousePointer,
  Coins
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface SessionData {
  session_id: string;
  user_id?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  device_type: string;
  browser: string;
  traffic_source?: string;
  page_views: number;
  events_count: number;
  converted: boolean;
  purchase_value?: number;
  bounce_rate?: number;
  engagement_score?: number;
  location?: string;
  utm_source?: string;
  utm_campaign?: string;
}

interface SessionsAnalysisProps {
  onViewDetails: (sessionId: string) => void;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export const SessionsAnalysis: React.FC<SessionsAnalysisProps> = ({
  onViewDetails,
  dateRange
}) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDevice, setFilterDevice] = useState('all');
  const [filterConverted, setFilterConverted] = useState('all');
  const [sortBy, setSortBy] = useState('started_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const [stats, setStats] = useState({
    total_sessions: 0,
    total_users: 0,
    avg_duration: 0,
    conversion_rate: 0,
    total_revenue: 0,
    avg_pages_per_session: 0
  });

  const itemsPerPage = 25;

  useEffect(() => {
    loadSessions();
  }, [dateRange, currentPage, sortBy, sortOrder, filterDevice, filterConverted, searchTerm]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_sessions')
        .select('*', { count: 'exact' })
        .gte('started_at', dateRange.startDate.toISOString())
        .lte('started_at', dateRange.endDate.toISOString())
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      // Aplicar filtros
      if (filterDevice !== 'all') {
        query = query.eq('device_type', filterDevice);
      }

      if (filterConverted !== 'all') {
        query = query.eq('converted', filterConverted === 'converted');
      }

      if (searchTerm) {
        query = query.or(`session_id.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setSessions(data || []);
      setTotalSessions(count || 0);

      // Carregar estatísticas
      await loadStats();
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('started_at', dateRange.startDate.toISOString())
        .lte('started_at', dateRange.endDate.toISOString());

      if (error) throw error;

      const totalSessions = data.length;
      const uniqueUsers = new Set(data.filter(s => s.user_id).map(s => s.user_id)).size;
      const avgDuration = data.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / totalSessions;
      const conversions = data.filter(s => s.converted).length;
      const conversionRate = totalSessions > 0 ? (conversions / totalSessions) * 100 : 0;
      const totalRevenue = data.reduce((sum, s) => sum + (s.purchase_value || 0), 0);
      const avgPages = data.reduce((sum, s) => sum + (s.page_views || 0), 0) / totalSessions;

      setStats({
        total_sessions: totalSessions,
        total_users: uniqueUsers,
        avg_duration: avgDuration,
        conversion_rate: conversionRate,
        total_revenue: totalRevenue,
        avg_pages_per_session: avgPages
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />;
  };

  const getConversionBadge = (converted: boolean, purchaseValue?: number) => {
    if (converted) {
      return (
        <Badge variant="default" className="bg-success/20 text-success border-success/30">
          Converteu {purchaseValue ? formatCurrency(purchaseValue) : ''}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Não converteu
      </Badge>
    );
  };

  const totalPages = Math.ceil(totalSessions / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Estatísticas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessões</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_sessions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avg_duration / 60)}m</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversion_rate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatCurrency(stats.total_revenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Páginas/Sessão</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_pages_per_session.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Sessões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por Session ID ou User ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={filterDevice} onValueChange={setFilterDevice}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Dispositivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Dispositivos</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterConverted} onValueChange={setFilterConverted}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Conversão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="converted">Convertidas</SelectItem>
                <SelectItem value="not_converted">Não Convertidas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="started_at">Data</SelectItem>
                <SelectItem value="duration_seconds">Duração</SelectItem>
                <SelectItem value="page_views">Páginas Vistas</SelectItem>
                <SelectItem value="purchase_value">Valor Compra</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Sessões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sessões Detalhadas ({totalSessions.toLocaleString()})
          </CardTitle>
          <CardDescription>
            Clique em "Ver Detalhes" para análise completa da sessão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Páginas</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Conversão</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.session_id}>
                      <TableCell className="font-mono text-xs">
                        {session.session_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(session.started_at)}
                        </div>
                        {session.user_id && (
                          <div className="text-xs text-muted-foreground">
                            User: {session.user_id.slice(0, 8)}...
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(session.duration_seconds)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.device_type)}
                          <span className="capitalize">{session.device_type}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.browser}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {session.page_views || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          {session.events_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getConversionBadge(session.converted, session.purchase_value)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(session.session_id)}
                        >
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalSessions)} de {totalSessions} sessões
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};