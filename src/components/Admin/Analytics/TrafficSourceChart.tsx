import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrafficAnalytics } from '@/hooks/useAnalyticsData';

interface TrafficSourceChartProps {
  trafficData: TrafficAnalytics[];
  loading: boolean;
}

const chartConfig = {
  sessions: {
    label: "Sessões",
    color: "hsl(var(--chart-1))",
  },
  conversions: {
    label: "Conversões",
    color: "hsl(var(--chart-2))",
  },
  revenue: {
    label: "Receita",
    color: "hsl(var(--chart-3))",
  },
};

export const TrafficSourceChart: React.FC<TrafficSourceChartProps> = ({
  trafficData,
  loading
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getSourceDisplayName = (source: string) => {
    const names: { [key: string]: string } = {
      'google': 'Google',
      'social': 'Redes Sociais',
      'direct': 'Direto',
      'whatsapp': 'WhatsApp',
      'email': 'E-mail',
      'referral': 'Referência',
      'unknown': 'Desconhecido'
    };
    return names[source] || source;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fontes de Tráfego</CardTitle>
          <CardDescription>Performance por canal de aquisição</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (trafficData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fontes de Tráfego</CardTitle>
          <CardDescription>Performance por canal de aquisição</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado de tráfego disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = trafficData.map(item => ({
    ...item,
    displayName: getSourceDisplayName(item.source)
  }));

  const totalSessions = trafficData.reduce((sum, item) => sum + item.sessions, 0);
  const totalConversions = trafficData.reduce((sum, item) => sum + item.conversions, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fontes de Tráfego</CardTitle>
        <CardDescription>
          {formatNumber(totalSessions)} sessões, {formatNumber(totalConversions)} conversões
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category"
                dataKey="displayName"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-semibold">{label}</p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Sessões: </span>
                          {formatNumber(data.sessions)}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Conversões: </span>
                          {formatNumber(data.conversions)}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Taxa: </span>
                          {data.conversion_rate.toFixed(2)}%
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Receita: </span>
                          {formatCurrency(data.revenue)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="sessions" 
                fill={chartConfig.sessions.color}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Estatísticas resumidas */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Canal mais efetivo:</p>
            <p className="font-medium">
              {trafficData.length > 0 && 
                getSourceDisplayName(
                  trafficData.reduce((prev, current) => 
                    prev.conversion_rate > current.conversion_rate ? prev : current
                  ).source
                )
              }
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Maior volume:</p>
            <p className="font-medium">
              {trafficData.length > 0 && 
                getSourceDisplayName(
                  trafficData.reduce((prev, current) => 
                    prev.sessions > current.sessions ? prev : current
                  ).source
                )
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};