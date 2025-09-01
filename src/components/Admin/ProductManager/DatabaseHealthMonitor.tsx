import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  Info
} from 'lucide-react';
import { analyzeDatabasePerformance } from '@/hooks/useProducts/optimizedQueries';

interface DatabaseHealth {
  productCount: number;
  indexStatus: string;
  recommendations: string[];
  lastChecked?: Date;
}

export const DatabaseHealthMonitor: React.FC = () => {
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeDatabasePerformance();
      setHealth({
        ...result,
        lastChecked: new Date()
      });
    } catch (error) {
      console.error('[DatabaseHealthMonitor] Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getHealthStatus = () => {
    if (!health) return { status: 'unknown', color: 'bg-gray-500', icon: Database };
    
    if (health.productCount < 500) {
      return { status: 'excellent', color: 'bg-green-500', icon: CheckCircle };
    } else if (health.productCount < 2000) {
      return { status: 'good', color: 'bg-yellow-500', icon: TrendingUp };
    } else {
      return { status: 'needs-attention', color: 'bg-red-500', icon: AlertTriangle };
    }
  };

  const statusInfo = getHealthStatus();

  if (!isExpanded) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusInfo.color} ${isLoading ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium text-foreground">DB Health</span>
              {health && (
                <Badge variant="outline" className="text-xs">
                  {health.productCount} produtos
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="h-6 px-2 text-xs"
            >
              <Database className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <statusInfo.icon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Database Health
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={checkHealth}
              disabled={isLoading}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 px-2 text-xs"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Current Status */}
        {health && (
          <>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Produtos:</span>
                </div>
                <div className="font-mono font-medium">{health.productCount}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Status:</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {statusInfo.status}
                </Badge>
              </div>
            </div>

            {/* Last Checked */}
            <div className="text-xs text-muted-foreground">
              Última verificação: {health.lastChecked?.toLocaleTimeString()}
            </div>

            {/* Recommendations */}
            {health.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground font-medium">Recomendações:</div>
                <div className="space-y-1">
                  {health.recommendations.map((recommendation, index) => (
                    <Alert key={index} className="p-2">
                      <Info className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        {recommendation}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {isLoading && !health && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <div className="text-xs text-muted-foreground">Verificando saúde do banco...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};