import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Clock, 
  Database, 
  HardDrive, 
  RefreshCw, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useProductPerformance } from '@/hooks/useProductPerformance';

interface PerformanceIndicatorProps {
  productCount: number;
  isLoading: boolean;
  className?: string;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  productCount,
  isLoading,
  className = ''
}) => {
  const performance = useProductPerformance();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMemory, setCurrentMemory] = useState<number | undefined>();

  useEffect(() => {
    const updateMemory = () => {
      setCurrentMemory(performance.getMemoryUsage());
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, [performance]);

  const metrics = performance.getMetrics();
  const latestMetric = metrics[metrics.length - 1];

  const getPerformanceStatus = () => {
    if (isLoading) return { status: 'loading', color: 'bg-blue-500', icon: RefreshCw };
    if (!latestMetric) return { status: 'idle', color: 'bg-gray-500', icon: Activity };
    
    const totalTime = latestMetric.queryTime + latestMetric.renderTime;
    
    if (totalTime < 100) return { status: 'excellent', color: 'bg-green-500', icon: CheckCircle };
    if (totalTime < 500) return { status: 'good', color: 'bg-yellow-500', icon: TrendingUp };
    return { status: 'slow', color: 'bg-red-500', icon: AlertTriangle };
  };

  const formatMemory = (bytes?: number) => {
    if (!bytes) return 'N/A';
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const formatTime = (ms: number) => `${ms.toFixed(1)}ms`;

  const statusInfo = getPerformanceStatus();

  if (!isExpanded) {
    return (
      <Card className={`bg-card border-border ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusInfo.color} ${isLoading ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium text-foreground">
                {productCount} produtos
              </span>
              {latestMetric && (
                <Badge variant="outline" className="text-xs">
                  {formatTime(latestMetric.queryTime + latestMetric.renderTime)}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-6 px-2 text-xs"
            >
              <Activity className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <statusInfo.icon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Performance Monitor
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-6 px-2 text-xs"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Produtos:</span>
            </div>
            <div className="font-mono font-medium">{productCount}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Memória:</span>
            </div>
            <div className="font-mono font-medium">{formatMemory(currentMemory)}</div>
          </div>
        </div>

        {/* Latest Performance */}
        {latestMetric && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-medium">Última Query:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground">Query:</span>
                <div className="font-mono">{formatTime(latestMetric.queryTime)}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Render:</span>
                <div className="font-mono">{formatTime(latestMetric.renderTime)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Historical Metrics */}
        {metrics.length > 1 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-medium">Histórico:</div>
            <div className="space-y-1">
              {metrics.slice(-3).reverse().map((metric, index) => (
                <div key={metric.timestamp} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    #{metrics.length - index}:
                  </span>
                  <span className="font-mono">
                    {formatTime(metric.queryTime + metric.renderTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={performance.clearMetrics}
            className="flex-1 h-7 text-xs"
          >
            <Clock className="w-3 h-3 mr-1" />
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};