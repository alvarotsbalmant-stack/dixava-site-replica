/**
 * ANÁLISE COMPORTAMENTAL - Segmentação avançada de usuários
 */

import React from 'react';
import { Users, TrendingUp, Eye, ShoppingCart, Target, MousePointer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface BehavioralAnalysisProps {
  data: any[];
  onCustomerSelect: (sessionId: string) => void;
}

export const BehavioralAnalysis: React.FC<BehavioralAnalysisProps> = ({
  data,
  onCustomerSelect
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  const getSegmentColor = (segment: string) => {
    const colors = {
      'High-Value Converters': 'bg-success text-success-foreground',
      'Engaged Browsers': 'bg-primary text-primary-foreground',
      'Regular Researchers': 'bg-warning text-warning-foreground',
      'Casual Visitors': 'bg-accent text-accent-foreground',
      'Quick Bouncers': 'bg-destructive text-destructive-foreground',
      'Undefined Behavior': 'bg-muted text-muted-foreground'
    };
    return colors[segment as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'High-Value Converters':
        return <Target className="h-4 w-4" />;
      case 'Engaged Browsers':
        return <Eye className="h-4 w-4" />;
      case 'Regular Researchers':
        return <TrendingUp className="h-4 w-4" />;
      case 'Casual Visitors':
        return <Users className="h-4 w-4" />;
      case 'Quick Bouncers':
        return <MousePointer className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Análise Comportamental</h2>
        <p className="text-muted-foreground">
          Segmentação avançada baseada em padrões de comportamento dos usuários
        </p>
      </div>

      {/* Visão Geral dos Segmentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(data || []).map((segment: any, index: number) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge className={getSegmentColor(segment.segment)}>
                  {getSegmentIcon(segment.segment)}
                  <span className="ml-1">{segment.segment}</span>
                </Badge>
                <span className="text-2xl font-bold">
                  {segment.percentage.toFixed(1)}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usuários</span>
                  <span className="font-bold">{formatNumber(segment.user_count)}</span>
                </div>
                <Progress value={segment.percentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Tempo Médio</p>
                  <p className="text-sm font-bold">
                    {Math.round(segment.avg_session_duration / 60)}m
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conversão</p>
                  <p className="text-sm font-bold">{segment.conversion_rate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ticket Médio</p>
                  <p className="text-sm font-bold">{formatCurrency(segment.avg_order_value)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Receita Total</p>
                  <p className="text-sm font-bold">{formatCurrency(segment.total_revenue)}</p>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => onCustomerSelect(`segment_${segment.segment}`)}
              >
                Ver Detalhes do Segmento
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights Comportamentais
          </CardTitle>
          <CardDescription>
            Análises e recomendações baseadas nos padrões identificados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* High-Value Converters Insight */}
            {data?.find((s: any) => s.segment === 'High-Value Converters') && (
              <div className="p-4 rounded-lg border border-success/20 bg-success/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-success mb-1">
                      Conversores de Alto Valor Identificados
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Esse segmento representa seus clientes mais valiosos. 
                      Considere criar um programa VIP ou ofertas exclusivas.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        Programa VIP
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Ofertas Exclusivas
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Suporte Premium
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Bouncers Insight */}
            {data?.find((s: any) => s.segment === 'Quick Bouncers') && (
              <div className="p-4 rounded-lg border border-warning/20 bg-warning/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                    <MousePointer className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-warning mb-1">
                      Alto Índice de Rejeição Detectado
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Muitos usuários estão saindo rapidamente. 
                      Revise a velocidade do site e a experiência inicial.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        Otimizar Performance
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Melhorar UX
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        A/B Test Landing
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Engaged Browsers Insight */}
            {data?.find((s: any) => s.segment === 'Engaged Browsers') && (
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary mb-1">
                      Navegadores Engajados com Potencial
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Usuários interessados mas que ainda não compraram. 
                      Implemente estratégias de nurturing e remarketing.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        Email Marketing
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Remarketing Ads
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Popup de Desconto
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Segmento</CardTitle>
          <CardDescription>
            Métricas completas para cada segmento comportamental
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Segmento</th>
                  <th className="text-right p-3">Usuários</th>
                  <th className="text-right p-3">% Total</th>
                  <th className="text-right p-3">Tempo/Sessão</th>
                  <th className="text-right p-3">Páginas/Sessão</th>
                  <th className="text-right p-3">Conversão</th>
                  <th className="text-right p-3">Ticket Médio</th>
                  <th className="text-right p-3">Receita</th>
                </tr>
              </thead>
              <tbody>
                {(data || []).map((segment: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <Badge className={getSegmentColor(segment.segment)} variant="outline">
                        {getSegmentIcon(segment.segment)}
                        <span className="ml-1">{segment.segment}</span>
                      </Badge>
                    </td>
                    <td className="text-right p-3 font-mono">
                      {formatNumber(segment.user_count)}
                    </td>
                    <td className="text-right p-3 font-mono">
                      {segment.percentage.toFixed(1)}%
                    </td>
                    <td className="text-right p-3 font-mono">
                      {Math.round(segment.avg_session_duration / 60)}m
                    </td>
                    <td className="text-right p-3 font-mono">
                      {segment.avg_pages_per_session?.toFixed(1) || '0.0'}
                    </td>
                    <td className="text-right p-3 font-mono">
                      {segment.conversion_rate.toFixed(1)}%
                    </td>
                    <td className="text-right p-3 font-mono">
                      {formatCurrency(segment.avg_order_value)}
                    </td>
                    <td className="text-right p-3 font-mono">
                      {formatCurrency(segment.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};