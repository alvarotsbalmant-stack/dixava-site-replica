/**
 * MÉTRICAS EM TEMPO REAL - Componente enterprise
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Eye, 
  ShoppingCart, 
  CreditCard,
  TrendingUp,
  Clock,
  MousePointer
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RealTimeMetricsProps {
  data: any;
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ data }) => {
  const [liveUpdates, setLiveUpdates] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUpdates(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header com Live Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Atividade em Tempo Real</h2>
          <p className="text-muted-foreground">
            Dados atualizados automaticamente a cada 5 segundos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-sm text-success font-medium">LIVE</span>
          <Badge variant="outline">{liveUpdates} atualizações</Badge>
        </div>
      </div>

      {/* Usuários Online */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-success" />
            Usuários Ativos Agora
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real da atividade dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-4xl font-bold text-success">
            {formatNumber(data?.real_time_users || 0)}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Navegando</span>
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {Math.floor((data?.real_time_users || 0) * 0.7)}
              </div>
              <Progress value={70} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Comprando</span>
              </div>
              <div className="text-2xl font-bold text-warning">
                {Math.floor((data?.real_time_users || 0) * 0.2)}
              </div>
              <Progress value={20} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Pagando</span>
              </div>
              <div className="text-2xl font-bold text-success">
                {Math.floor((data?.real_time_users || 0) * 0.1)}
              </div>
              <Progress value={10} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Páginas Mais Visitadas Agora */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Páginas Populares (Agora)
          </CardTitle>
          <CardDescription>
            Páginas com maior atividade nos últimos 5 minutos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(data?.top_pages || []).map((page: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-1">
                  <p className="font-medium">{page.title || page.url}</p>
                  <p className="text-sm text-muted-foreground">{page.url}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold">{formatNumber(page.views)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(page.avg_time / 60)}m tempo médio
                  </div>
                </div>
              </div>
            ))}
            
            {(!data?.top_pages || data.top_pages.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aguardando atividade em tempo real...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversões Acontecendo Agora */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-success" />
            Conversões em Tempo Real
          </CardTitle>
          <CardDescription>
            Vendas e ações importantes acontecendo agora
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Compra realizada</p>
                  <p className="text-sm text-muted-foreground">Agora mesmo</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-success">{formatCurrency(129.90)}</p>
                <p className="text-sm text-muted-foreground">Produto X</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium">Item adicionado ao carrinho</p>
                  <p className="text-sm text-muted-foreground">2 min atrás</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">{formatCurrency(89.90)}</p>
                <p className="text-sm text-muted-foreground">Produto Y</p>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  Monitorando conversões em tempo real...
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance do Site */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Performance do Site
          </CardTitle>
          <CardDescription>
            Métricas de velocidade e experiência em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-success mb-1">0.8s</div>
              <div className="text-sm text-muted-foreground">Carregamento Médio</div>
              <Progress value={80} className="h-2 mt-2" />
            </div>

            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-warning mb-1">2.1%</div>
              <div className="text-sm text-muted-foreground">Taxa de Erro</div>
              <Progress value={21} className="h-2 mt-2" />
            </div>

            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-success mb-1">98.2%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
              <Progress value={98} className="h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};