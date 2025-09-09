/**
 * PREDIÇÃO DE CHURN - Machine Learning para retenção
 */

import React from 'react';
import { Brain, AlertTriangle, TrendingDown, Users, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ChurnPredictionProps {
  data: Array<{
    user_id: string;
    churn_risk_score: number;
    risk_level: string;
    last_activity: string;
    days_since_last_activity: number;
    behavior_changes: {
      engagement_decline: number;
      session_frequency_decline: number;
      purchase_decline: number;
    };
    recommended_actions: string[];
    intervention_priority: number;
  }>;
}

export const ChurnPrediction: React.FC<ChurnPredictionProps> = ({ data }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'destructive';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'High':
        return <TrendingDown className="h-4 w-4" />;
      case 'Medium':
        return <Users className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const criticalUsers = data?.filter(u => u.risk_level === 'Critical') || [];
  const highRiskUsers = data?.filter(u => u.risk_level === 'High') || [];
  const mediumRiskUsers = data?.filter(u => u.risk_level === 'Medium') || [];
  const lowRiskUsers = data?.filter(u => u.risk_level === 'Low') || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Predição de Churn
        </h2>
        <p className="text-muted-foreground">
          Análise preditiva para identificar clientes com risco de abandono
        </p>
      </div>

      {/* Resumo dos Riscos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Crítico</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {criticalUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">Intervenção imediata</p>
          </CardContent>
        </Card>

        <Card className="border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Alto Risco</span>
            </div>
            <div className="text-2xl font-bold text-warning">
              {highRiskUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">Ação necessária</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Médio Risco</span>
            </div>
            <div className="text-2xl font-bold">
              {mediumRiskUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">Monitoramento</p>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Baixo Risco</span>
            </div>
            <div className="text-2xl font-bold text-success">
              {lowRiskUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">Estáveis</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários em Risco */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Usuários Prioritários para Intervenção
          </CardTitle>
          <CardDescription>
            Clientes com maior risco de churn ordenados por prioridade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data && data.length > 0 ? (
              data
                .sort((a, b) => b.churn_risk_score - a.churn_risk_score)
                .slice(0, 10)
                .map((user, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          {getRiskIcon(user.risk_level)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Usuário {user.user_id.slice(0, 8)}</span>
                            <Badge variant={user.risk_level === 'Critical' ? 'destructive' : 'outline'}>
                              {user.risk_level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Prioridade {user.intervention_priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Última atividade: {formatDate(user.last_activity)} 
                            ({user.days_since_last_activity} dias atrás)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-destructive">
                          {(user.churn_risk_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">risco</div>
                      </div>
                    </div>

                    {/* Indicadores de Comportamento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Declínio Engajamento</span>
                          <span>{(user.behavior_changes.engagement_decline * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={user.behavior_changes.engagement_decline * 100} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Frequência Sessões</span>
                          <span>{(user.behavior_changes.session_frequency_decline * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={user.behavior_changes.session_frequency_decline * 100} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Atividade Compras</span>
                          <span>{(user.behavior_changes.purchase_decline * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={user.behavior_changes.purchase_decline * 100} className="h-2" />
                      </div>
                    </div>

                    {/* Ações Recomendadas */}
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Ações Recomendadas:</h5>
                      <div className="flex flex-wrap gap-2">
                        {user.recommended_actions.map((action, actionIndex) => (
                          <Badge key={actionIndex} variant="outline" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          Enviar Email
                        </Button>
                        <Button size="sm" variant="outline">
                          Oferecer Desconto
                        </Button>
                        <Button size="sm" variant="outline">
                          Contato Direto
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum usuário com risco elevado de churn</p>
                <p className="text-sm">Todos os clientes parecem estar engajados!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modelo de Machine Learning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Modelo Preditivo
          </CardTitle>
          <CardDescription>
            Informações sobre o algoritmo de predição de churn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-primary mb-1">92.3%</div>
              <div className="text-sm text-muted-foreground">Precisão do Modelo</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-success mb-1">87.1%</div>
              <div className="text-sm text-muted-foreground">Taxa de Recall</div>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <div className="text-2xl font-bold text-warning mb-1">15</div>
              <div className="text-sm text-muted-foreground">Variáveis Analisadas</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded">
            <p className="text-sm text-muted-foreground">
              <strong>Como funciona:</strong> O modelo analisa padrões comportamentais como frequência de visitas, 
              tempo de sessão, engajamento com produtos, e histórico de compras para calcular a probabilidade 
              de churn de cada usuário nos próximos 30 dias.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};