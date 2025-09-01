// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  ShoppingCart, 
  Eye, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Activity,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ClientDetailModal } from './ClientDetailModal';

interface ClientAnalysis {
  user_id: string;
  sessions: ClientSession[];
  total_sessions: number;
  total_time_spent: number;
  total_purchases: number;
  avg_session_duration: number;
  churn_risk_score: number;
  conversion_probability: number;
  last_activity: string;
  activity_status: 'active' | 'idle' | 'at_risk' | 'churned';
  cart_abandonment_rate: number;
  preferred_categories: string[];
  device_preferences: string[];
  geographic_data: {
    city?: string;
    state?: string;
    country?: string;
  };
}

interface ClientSession {
  session_id: string;
  start_time: string;
  end_time?: string;
  duration: number;
  pages: number;
  cart_actions: number;
  purchases: number;
  conversion_events: any[];
}

interface ActivityRecord {
  session_id: string;
  user_id: string;
  page_url: string;
  timestamp: string;
  action_type: string;
  engagement_score?: number;
  device_info?: any;
}

export const ClientAnalysisTable = () => {
  const { 
    loading, 
    error, 
    getClientSessions, 
    getActivityAnalytics 
  } = useAnalytics();
  
  const [clients, setClients] = useState<ClientAnalysis[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientAnalysis | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadClientAnalysis = async () => {
    setRefreshing(true);
    try {
      const [sessions, activity] = await Promise.all([
        getClientSessions(),
        getActivityAnalytics()
      ]);

      // Agrupar dados por usuário
      const clientMap = new Map<string, ClientAnalysis>();

      // Processar sessões
      sessions?.forEach(session => {
        const userId = session.user_id || session.session_id;
        if (!clientMap.has(userId)) {
          clientMap.set(userId, {
            user_id: userId,
            sessions: [],
            total_sessions: 0,
            total_time_spent: 0,
            total_purchases: 0,
            avg_session_duration: 0,
            churn_risk_score: 0,
            conversion_probability: 0,
            last_activity: session.created_at,
            activity_status: 'active',
            cart_abandonment_rate: 0,
            preferred_categories: [],
            device_preferences: [],
            geographic_data: {}
          });
        }

        const client = clientMap.get(userId)!;
        client.sessions.push({
          session_id: session.id,
          start_time: session.created_at,
          end_time: session.updated_at,
          duration: 0,
          pages: 0,
          cart_actions: 0,
          purchases: 0,
          conversion_events: []
        });
        client.total_sessions++;

        if (session.action_type === 'purchase') {
          client.total_purchases++;
        }
      });

      // Processar atividade em tempo real
      activity?.forEach(act => {
        const userId = act.session_id;
        if (clientMap.has(userId)) {
          const client = clientMap.get(userId)!;
          // Safe access to properties that might not exist
        }
      });

      // Calcular métricas derivadas
      clientMap.forEach(client => {
        const uniqueSessions = new Set();
        sessions?.forEach(s => {
          if ((s.user_id || s.session_id) === client.user_id) {
            uniqueSessions.add(s.id);
          }
        });

        client.total_sessions = uniqueSessions.size;
        client.avg_session_duration = client.total_sessions > 0 
          ? client.total_time_spent / client.total_sessions 
          : 0;
        
        // Calcular pontuação de risco de churn (simplificado)
        const daysSinceLastActivity = Math.floor(
          (Date.now() - new Date(client.last_activity).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastActivity > 30) {
          client.churn_risk_score = 0.8;
          client.activity_status = 'churned';
        } else if (daysSinceLastActivity > 14) {
          client.churn_risk_score = 0.6;
          client.activity_status = 'at_risk';
        } else if (daysSinceLastActivity > 7) {
          client.churn_risk_score = 0.3;
          client.activity_status = 'idle';
        } else {
          client.churn_risk_score = 0.1;
          client.activity_status = 'active';
        }

        // Calcular probabilidade de conversão
        client.conversion_probability = client.total_purchases > 0 
          ? Math.min(0.9, 0.3 + (client.total_purchases * 0.1))
          : Math.max(0.1, 0.5 - (daysSinceLastActivity * 0.02));
      });

      const clientAnalysis = Array.from(clientMap.values())
        .sort((a, b) => b.total_sessions - a.total_sessions);

      setClients(clientAnalysis);
    } catch (err) {
      console.error('Erro ao carregar análise de clientes:', err);
      toast.error('Erro ao carregar análise de clientes');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClientAnalysis();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, label: "Ativo" },
      idle: { variant: "secondary" as const, label: "Inativo" },
      at_risk: { variant: "destructive" as const, label: "Em Risco" },
      churned: { variant: "outline" as const, label: "Perdido" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.idle;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getRiskColor = (score: number) => {
    if (score > 0.7) return "text-red-600";
    if (score > 0.4) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading && clients.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>Erro ao carregar dados: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com métricas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Total de Clientes</span>
            </div>
            <p className="text-2xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Clientes Ativos</span>
            </div>
            <p className="text-2xl font-bold">
              {clients.filter(c => c.activity_status === 'active').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Em Risco</span>
            </div>
            <p className="text-2xl font-bold">
              {clients.filter(c => c.activity_status === 'at_risk').length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">Conversões</span>
            </div>
            <p className="text-2xl font-bold">
              {clients.reduce((sum, c) => sum + c.total_purchases, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de clientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Análise Detalhada de Clientes</span>
          </CardTitle>
          <Button 
            onClick={loadClientAnalysis}
            disabled={refreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Cliente</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Sessões</th>
                  <th className="text-left p-3 font-medium">Tempo Total</th>
                  <th className="text-left p-3 font-medium">Compras</th>
                  <th className="text-left p-3 font-medium">Risco Churn</th>
                  <th className="text-left p-3 font-medium">Conversão</th>
                  <th className="text-left p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.user_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-sm">
                        {client.user_id.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(client.last_activity).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(client.activity_status)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{client.total_sessions}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{formatDuration(client.total_time_spent)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <ShoppingCart className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{client.total_purchases}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${getRiskColor(client.churn_risk_score)}`}>
                        {(client.churn_risk_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span>{(client.conversion_probability * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedClient(client);
                          setModalOpen(true);
                        }}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clients.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
};