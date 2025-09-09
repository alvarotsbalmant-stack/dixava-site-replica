import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface AnalyticsFiltersProps {
  dateRange: DateRange;
  compareRange: DateRange | null;
  onDateRangeChange: (range: DateRange) => void;
  onCompareRangeChange: (range: DateRange | null) => void;
  loading: boolean;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  dateRange,
  compareRange,
  onDateRangeChange,
  onCompareRangeChange,
  loading
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const handlePresetRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    onDateRangeChange({ startDate, endDate });
  };

  const toggleComparison = (enabled: boolean) => {
    if (enabled) {
      const diffDays = Math.ceil(
        (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const compareEndDate = new Date(dateRange.startDate.getTime() - 24 * 60 * 60 * 1000);
      const compareStartDate = new Date(compareEndDate.getTime() - diffDays * 24 * 60 * 60 * 1000);
      onCompareRangeChange({ startDate: compareStartDate, endDate: compareEndDate });
    } else {
      onCompareRangeChange(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros de Período</CardTitle>
        <CardDescription>
          Selecione o período para análise e configure comparações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Período principal */}
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <Label className="whitespace-nowrap">Período:</Label>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.startDate && "text-muted-foreground"
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.startDate ? (
                    `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`
                  ) : (
                    "Selecione o período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.startDate,
                    to: dateRange.endDate
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      onDateRangeChange({
                        startDate: range.from,
                        endDate: range.to
                      });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Presets rápidos */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetRange(7)}
              disabled={loading}
            >
              7 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetRange(30)}
              disabled={loading}
            >
              30 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetRange(90)}
              disabled={loading}
            >
              90 dias
            </Button>
          </div>

          {/* Comparação */}
          <div className="flex items-center space-x-2">
            <Switch
              id="comparison"
              checked={compareRange !== null}
              onCheckedChange={toggleComparison}
              disabled={loading}
            />
            <Label htmlFor="comparison" className="whitespace-nowrap">
              Comparar com período anterior
            </Label>
          </div>

          {compareRange && (
            <div className="text-sm text-muted-foreground">
              Comparando com: {formatDate(compareRange.startDate)} - {formatDate(compareRange.endDate)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};