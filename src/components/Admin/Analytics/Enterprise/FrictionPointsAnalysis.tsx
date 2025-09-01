/**
 * ANÁLISE DE PONTOS DE FRICÇÃO - Identificação de problemas UX
 */

import React from 'react';
import { AlertTriangle, Zap, Clock, MousePointer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FrictionPointsAnalysisProps {
  frictionPoints: Array<{
    page: string;
    issue: string;
    severity: number;
    affected_sessions: number;
  }>;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export const FrictionPointsAnalysis: React.FC<FrictionPointsAnalysisProps> = ({ 
  frictionPoints 
}) => {
  const getSeverityColor = (severity: number) => {
    if (severity >= 80) return 'destructive';
    if (severity >= 60) return 'warning';
    return 'default';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 80) return 'Crítico';
    if (severity >= 60) return 'Alto';
    if (severity >= 40) return 'Médio';
    return 'Baixo';
  };

  const getIssueIcon = (issue: string) => {
    switch (issue) {
      case 'rapid_clicks':
        return <MousePointer className="h-4 w-4" />;
      case 'long_pauses':
        return <Clock className="h-4 w-4" />;
      case 'form_abandonment':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getIssueDescription = (issue: string) => {
    const descriptions = {
      'rapid_clicks': 'Cliques rápidos repetidos indicando frustração',
      'long_pauses': 'Pausas longas sugerindo confusão ou dificuldade',
      'back_forth_navigation': 'Navegação hesitante entre páginas',
      'form_abandonment': 'Abandono de formulários sem conclusão',
      'general_friction': 'Fricção geral detectada na experiência'
    };
    return descriptions[issue as keyof typeof descriptions] || 'Problema de usabilidade detectado';
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Análise de Pontos de Fricção</h2>
        <p className="text-muted-foreground">
          Identificação automática de problemas na experiência do usuário
        </p>
      </div>

      {/* Resumo de Fricção */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Pontos Críticos</span>
            </div>
            <div className="text-2xl font-bold text-destructive">
              {frictionPoints.filter(p => p.severity >= 80).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Sessões Afetadas</span>
            </div>
            <div className="text-2xl font-bold text-warning">
              {formatNumber(frictionPoints.reduce((sum, p) => sum + p.affected_sessions, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Severidade Média</span>
            </div>
            <div className="text-2xl font-bold">
              {frictionPoints.length > 0 
                ? Math.round(frictionPoints.reduce((sum, p) => sum + p.severity, 0) / frictionPoints.length)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pontos de Fricção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Problemas Detectados
          </CardTitle>
          <CardDescription>
            Pontos de fricção ordenados por severidade e impacto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {frictionPoints.length > 0 ? (
              frictionPoints
                .sort((a, b) => b.severity - a.severity)
                .map((point, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          {getIssueIcon(point.issue)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{point.page}</h4>
                            <Badge variant={point.severity >= 80 ? 'destructive' : 'outline'}>
                              {getSeverityLabel(point.severity)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getIssueDescription(point.issue)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{point.severity}</div>
                        <div className="text-xs text-muted-foreground">severidade</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Impacto</span>
                        <span>{formatNumber(point.affected_sessions)} sessões afetadas</span>
                      </div>
                      <Progress value={point.severity} className="h-2" />
                    </div>

                    {/* Recomendações */}
                    <div className="mt-3 p-3 bg-muted/50 rounded">
                      <h5 className="font-medium text-sm mb-2">Recomendações:</h5>
                      <div className="flex flex-wrap gap-1">
                        {point.issue === 'rapid_clicks' && (
                          <>
                            <Badge variant="outline" className="text-xs">Melhorar responsividade</Badge>
                            <Badge variant="outline" className="text-xs">Adicionar feedback visual</Badge>
                          </>
                        )}
                        {point.issue === 'long_pauses' && (
                          <>
                            <Badge variant="outline" className="text-xs">Simplificar navegação</Badge>
                            <Badge variant="outline" className="text-xs">Adicionar tooltips</Badge>
                          </>
                        )}
                        {point.issue === 'form_abandonment' && (
                          <>
                            <Badge variant="outline" className="text-xs">Simplificar formulário</Badge>
                            <Badge variant="outline" className="text-xs">Melhorar validação</Badge>
                          </>
                        )}
                        {point.issue === 'back_forth_navigation' && (
                          <>
                            <Badge variant="outline" className="text-xs">Melhorar arquitetura</Badge>
                            <Badge variant="outline" className="text-xs">Adicionar breadcrumbs</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum ponto de fricção detectado no período</p>
                <p className="text-sm">Isso indica uma boa experiência do usuário!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Heatmap de Fricção por Página */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Calor da Fricção</CardTitle>
          <CardDescription>
            Visualização da intensidade de problemas por página
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from(new Set(frictionPoints.map(p => p.page))).map((page, index) => {
              const pageIssues = frictionPoints.filter(p => p.page === page);
              const avgSeverity = pageIssues.reduce((sum, p) => sum + p.severity, 0) / pageIssues.length;
              const totalSessions = pageIssues.reduce((sum, p) => sum + p.affected_sessions, 0);

              return (
                <div key={index} className="p-3 rounded-lg border">
                  <div className="mb-2">
                    <h4 className="font-medium text-sm truncate">{page}</h4>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{pageIssues.length} problemas</span>
                      <span>{formatNumber(totalSessions)} sessões</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Severidade</span>
                      <span>{avgSeverity.toFixed(0)}</span>
                    </div>
                    <Progress value={avgSeverity} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};