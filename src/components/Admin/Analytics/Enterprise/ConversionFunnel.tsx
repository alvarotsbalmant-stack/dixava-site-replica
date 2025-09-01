/**
 * FUNIL DE CONVERSÃO VISUAL - Análise detalhada do funil
 */

import React, { useState, useEffect } from 'react';
import { TrendingDown, Users, Eye, ShoppingCart, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface ConversionFunnelProps {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ dateRange }) => {
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFunnelData();
  }, [dateRange]);

  const loadFunnelData = async () => {
    setLoading(true);
    try {
      // Simular dados do funil baseado nas sessões
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .gte('started_at', dateRange.startDate.toISOString())
        .lte('started_at', dateRange.endDate.toISOString());

      const totalSessions = sessions?.length || 0;
      const conversions = sessions?.filter(s => s.converted)?.length || 0;

      setFunnelData([
        {
          stage: 'Visitantes',
          count: totalSessions,
          percentage: 100,
          icon: Users,
          color: 'blue'
        },
        {
          stage: 'Visualizaram Produtos',
          count: Math.floor(totalSessions * 0.7),
          percentage: 70,
          icon: Eye,
          color: 'green'
        },
        {
          stage: 'Adicionaram ao Carrinho',
          count: Math.floor(totalSessions * 0.3),
          percentage: 30,
          icon: ShoppingCart,
          color: 'yellow'
        },
        {
          stage: 'Finalizaram Compra',
          count: conversions,
          percentage: totalSessions > 0 ? (conversions / totalSessions) * 100 : 0,
          icon: CreditCard,
          color: 'red'
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do funil:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Funil de Conversão</h2>
        <p className="text-muted-foreground">
          Análise visual da jornada do cliente até a conversão
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Etapas do Funil
          </CardTitle>
          <CardDescription>
            Visualização da perda de usuários em cada etapa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {funnelData.map((stage, index) => {
                const Icon = stage.icon;
                const nextStage = funnelData[index + 1];
                const dropRate = nextStage 
                  ? ((stage.count - nextStage.count) / stage.count) * 100 
                  : 0;

                return (
                  <div key={stage.stage} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${stage.color}-100`}>
                          <Icon className={`h-5 w-5 text-${stage.color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{stage.stage}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(stage.count)} usuários ({stage.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      
                      {nextStage && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-destructive">
                            -{dropRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(stage.count - nextStage.count)} perdidos
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <Progress value={stage.percentage} className="h-4" />
                    
                    {nextStage && (
                      <div className="flex justify-center">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-muted"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};