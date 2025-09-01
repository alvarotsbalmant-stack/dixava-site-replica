import React from 'react';
import { MessageCircle, TrendingUp, Users, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DashboardAnalytics } from '@/hooks/useAnalyticsData';

interface WhatsAppAnalyticsProps {
  data: DashboardAnalytics | null;
  loading: boolean;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}

const chartConfig = {
  whatsapp_clicks: {
    label: "Cliques WhatsApp",
    color: "hsl(var(--chart-1))",
  },
  conversions: {
    label: "Conversões",
    color: "hsl(var(--chart-2))",
  },
};

export const WhatsAppAnalytics: React.FC<WhatsAppAnalyticsProps> = ({
  data,
  loading,
  dateRange
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Nenhum dado disponível para análise do WhatsApp
          </div>
        </CardContent>
      </Card>
    );
  }

  // Simular dados de conversão do WhatsApp baseado nos cliques
  const whatsappConversionRate = data.total_purchases > 0 
    ? (data.whatsapp_clicks / data.total_purchases) * 0.15 // Assumindo 15% de conversão via WhatsApp
    : 0;

  const estimatedWhatsAppConversions = Math.round(data.whatsapp_clicks * 0.15);

  const chartData = data.period_data?.map(item => ({
    date: item.date,
    formattedDate: formatDate(item.date),
    whatsapp_clicks: Math.round(item.sessions * 0.1), // Estimativa de cliques por dia
    conversions: Math.round(item.purchases * 0.15) // Estimativa de conversões via WhatsApp
  })) || [];

  return (
    <div className="space-y-6">
      {/* Métricas principais do WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques no WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.whatsapp_clicks)}</div>
            <p className="text-xs text-muted-foreground">
              {((data.whatsapp_clicks / data.total_sessions) * 100).toFixed(1)}% das sessões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões Estimadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(estimatedWhatsAppConversions)}</div>
            <p className="text-xs text-muted-foreground">
              ~15% dos cliques convertidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Interesse</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage((data.whatsapp_clicks / data.total_sessions) * 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessões que clicaram no WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência WhatsApp</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(whatsappConversionRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Conversões via WhatsApp vs total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos do WhatsApp */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução dos cliques */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução dos Cliques WhatsApp</CardTitle>
            <CardDescription>
              Tendência de interesse no WhatsApp ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="whatsapp_clicks" 
                    stroke={chartConfig.whatsapp_clicks.color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Conversões estimadas */}
        <Card>
          <CardHeader>
            <CardTitle>Conversões via WhatsApp</CardTitle>
            <CardDescription>
              Estimativa de vendas originadas pelo WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="conversions" 
                    fill={chartConfig.conversions.color}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights e recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Insights WhatsApp</CardTitle>
          <CardDescription>
            Análise e recomendações baseadas no comportamento dos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Performance Atual</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Taxa de cliques:</span>
                  <span className="font-medium">
                    {((data.whatsapp_clicks / data.total_sessions) * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cliques por sessão:</span>
                  <span className="font-medium">
                    {(data.whatsapp_clicks / data.total_sessions).toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversões estimadas:</span>
                  <span className="font-medium">{estimatedWhatsAppConversions}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Recomendações</h4>
              <div className="space-y-2 text-sm">
                {data.whatsapp_clicks / data.total_sessions < 0.05 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      📱 Taxa de cliques baixa. Considere posicionar o botão WhatsApp de forma mais visível.
                    </p>
                  </div>
                )}
                
                {data.whatsapp_clicks / data.total_sessions > 0.15 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">
                      ✅ Excelente engajamento no WhatsApp! Continue otimizando a conversão.
                    </p>
                  </div>
                )}
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">
                    💡 Implemente tracking de conversões reais do WhatsApp para métricas mais precisas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};