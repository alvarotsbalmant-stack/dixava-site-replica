import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CustomerSegment } from '@/hooks/useAnalyticsData';

interface CustomerSegmentChartProps {
  segments: CustomerSegment[];
  loading: boolean;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const chartConfig = {
  customers: {
    label: "Clientes",
  },
  new: {
    label: "Novos",
    color: "hsl(var(--chart-1))",
  },
  active: {
    label: "Ativos",
    color: "hsl(var(--chart-2))",
  },
  at_risk: {
    label: "Em Risco",
    color: "hsl(var(--chart-3))",
  },
  lost: {
    label: "Perdidos",
    color: "hsl(var(--chart-4))",
  },
  unknown: {
    label: "Indefinidos",
    color: "hsl(var(--chart-5))",
  },
};

export const CustomerSegmentChart: React.FC<CustomerSegmentChartProps> = ({
  segments,
  loading
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Segmentação de Clientes</CardTitle>
          <CardDescription>Distribuição por comportamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (segments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Segmentação de Clientes</CardTitle>
          <CardDescription>Distribuição por comportamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado de segmentação disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = segments.map((segment, index) => ({
    name: segment.segment,
    value: segment.count,
    percentage: segment.percentage,
    revenue: segment.total_revenue,
    aov: segment.avg_order_value,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold capitalize">{data.name}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Clientes: </span>
            {data.value} ({data.percentage.toFixed(1)}%)
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Receita: </span>
            {formatCurrency(data.revenue)}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">AOV: </span>
            {formatCurrency(data.aov)}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalCustomers = segments.reduce((sum, segment) => sum + segment.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segmentação de Clientes</CardTitle>
        <CardDescription>
          Distribuição de {totalCustomers.toLocaleString('pt-BR')} clientes por comportamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legenda customizada */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm capitalize">{item.name}</span>
              <span className="text-sm text-muted-foreground ml-auto">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};