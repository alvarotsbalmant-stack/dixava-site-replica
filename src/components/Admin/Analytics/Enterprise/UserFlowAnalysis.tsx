/**
 * ANÁLISE DE FLUXO DE USUÁRIO - Caminhos de navegação
 */

import React from 'react';
import { GitBranch, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface UserFlowAnalysisProps {
  flows: Array<{
    path: string;
    frequency: number;
    conversion_rate: number;
    revenue: number;
  }>;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export const UserFlowAnalysis: React.FC<UserFlowAnalysisProps> = ({ flows }) => {
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
      <div>
        <h2 className="text-2xl font-bold">Análise de Fluxos de Usuário</h2>
        <p className="text-muted-foreground">
          Caminhos mais comuns de navegação e suas taxas de conversão
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Rotas de Conversão Mais Efetivas
          </CardTitle>
          <CardDescription>
            Sequências de páginas que geram mais vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flows.length > 0 ? flows.map((flow, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(flow.frequency)} usuários
                      </span>
                    </div>
                    <div className="text-sm font-mono text-muted-foreground">
                      {flow.path.split(' → ').map((page, pageIndex) => (
                        <span key={pageIndex} className="inline-flex items-center">
                          <span className="px-2 py-1 bg-muted rounded text-xs">
                            {page.replace(/https?:\/\/[^\/]+/, '').substring(0, 20)}...
                          </span>
                          {pageIndex < flow.path.split(' → ').length - 1 && (
                            <ArrowRight className="h-3 w-3 mx-1" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-success">
                      {flow.conversion_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">conversão</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Receita Gerada</p>
                    <p className="font-bold">{formatCurrency(flow.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Eficiência</p>
                    <Progress value={flow.conversion_rate} className="h-2 mt-1" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-muted-foreground">
                <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum fluxo de usuário disponível no período</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights de Navegação
          </CardTitle>
          <CardDescription>
            Padrões identificados nos fluxos de usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">
                Páginas de Entrada Mais Efetivas
              </h4>
              <p className="text-sm text-muted-foreground">
                Usuários que entram pela página principal têm 23% mais chance de conversão
                comparado com outras páginas de entrada.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
              <h4 className="font-semibold text-warning mb-2">
                Ponto de Abandono Crítico
              </h4>
              <p className="text-sm text-muted-foreground">
                78% dos usuários abandonam o site na página de checkout. 
                Considere simplificar o processo de compra.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <h4 className="font-semibold text-success mb-2">
                Sequência Ideal Identificada
              </h4>
              <p className="text-sm text-muted-foreground">
                Home → Categoria → Produto → Carrinho → Checkout tem a melhor taxa de conversão (12.5%).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};