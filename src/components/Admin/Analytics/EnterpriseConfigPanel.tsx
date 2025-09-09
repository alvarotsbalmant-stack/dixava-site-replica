import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Activity, MousePointer, Scroll, Zap, AlertTriangle } from 'lucide-react';
import { useEnterpriseAnalyticsConfig } from '@/hooks/useEnterpriseAnalyticsConfig';
import { useHybridAnalytics } from '@/hooks/useHybridAnalytics';

export const EnterpriseConfigPanel = () => {
  const { 
    config, 
    updateConfig, 
    toggleEnterprise, 
    toggleHybridMode, 
    toggleDebugMode,
    isEnterpriseEnabled,
    isHybridMode,
    isDebugMode
  } = useEnterpriseAnalyticsConfig();

  const { getSystemInfo } = useHybridAnalytics();
  const systemInfo = getSystemInfo();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Configuração Enterprise Analytics</CardTitle>
            <Badge variant={isEnterpriseEnabled ? "default" : "secondary"}>
              {isEnterpriseEnabled ? "ATIVO" : "INATIVO"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Básico: {systemInfo.basicSessionId?.slice(-8)}
            </Badge>
            {isEnterpriseEnabled && (
              <Badge variant="outline" className="text-xs">
                Enterprise: {systemInfo.enterpriseSessionId?.slice(-8)}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Configure o sistema avançado de analytics com tracking granular de comportamento do usuário
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configurações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enterprise-enabled" className="text-base font-medium">
                  Sistema Enterprise
                </Label>
                <p className="text-sm text-muted-foreground">
                  Ativar tracking avançado com dados granulares
                </p>
              </div>
              <Switch
                id="enterprise-enabled"
                checked={isEnterpriseEnabled}
                onCheckedChange={toggleEnterprise}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hybrid-mode" className="text-base font-medium">
                  Modo Híbrido
                </Label>
                <p className="text-sm text-muted-foreground">
                  Manter sistema básico funcionando em paralelo
                </p>
              </div>
              <Switch
                id="hybrid-mode"
                checked={isHybridMode}
                onCheckedChange={toggleHybridMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="debug-mode" className="text-base font-medium">
                  Modo Debug
                </Label>
                <p className="text-sm text-muted-foreground">
                  Logs detalhados no console (desenvolvimento)
                </p>
              </div>
              <Switch
                id="debug-mode"
                checked={isDebugMode}
                onCheckedChange={toggleDebugMode}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Atividade em Tempo Real
                </Label>
                <p className="text-sm text-muted-foreground">
                  Heartbeat e status online
                </p>
              </div>
              <Switch
                checked={config.enableRealTimeActivity}
                onCheckedChange={(checked) => updateConfig({ enableRealTimeActivity: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  Tracking de Mouse
                </Label>
                <p className="text-sm text-muted-foreground">
                  Movimento, cliques e coordenadas
                </p>
              </div>
              <Switch
                checked={config.enableMouseTracking}
                onCheckedChange={(checked) => updateConfig({ enableMouseTracking: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Scroll className="h-4 w-4" />
                  Tracking de Scroll
                </Label>
                <p className="text-sm text-muted-foreground">
                  Profundidade, velocidade e paradas
                </p>
              </div>
              <Switch
                checked={config.enableScrollTracking}
                onCheckedChange={(checked) => updateConfig({ enableScrollTracking: checked })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Configurações Avançadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Tracking de Performance
                </Label>
                <p className="text-sm text-muted-foreground">
                  Web Vitals e métricas de carregamento
                </p>
              </div>
              <Switch
                checked={config.enablePerformanceTracking}
                onCheckedChange={(checked) => updateConfig({ enablePerformanceTracking: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Tracking de Erros
                </Label>
                <p className="text-sm text-muted-foreground">
                  JavaScript errors e promise rejections
                </p>
              </div>
              <Switch
                checked={config.enableErrorTracking}
                onCheckedChange={(checked) => updateConfig({ enableErrorTracking: checked })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Intervalo de Flush (ms)</Label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.flushInterval}
                  onChange={(e) => updateConfig({ flushInterval: parseInt(e.target.value) })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  min="1000"
                  max="30000"
                  step="1000"
                />
                <span className="text-sm text-muted-foreground">ms</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Eventos por Lote</Label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={config.maxEventsPerBatch}
                  onChange={(e) => updateConfig({ maxEventsPerBatch: parseInt(e.target.value) })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  min="5"
                  max="50"
                  step="5"
                />
                <span className="text-sm text-muted-foreground">eventos</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Status do Sistema */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Status do Sistema</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Sistema Enterprise</p>
              <Badge variant={isEnterpriseEnabled ? "default" : "secondary"}>
                {isEnterpriseEnabled ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Modo Híbrido</p>
              <Badge variant={isHybridMode ? "default" : "secondary"}>
                {isHybridMode ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Debug</p>
              <Badge variant={isDebugMode ? "default" : "secondary"}>
                {isDebugMode ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Ambiente</p>
              <Badge variant="outline">
                {process.env.NODE_ENV === 'development' ? 'Dev' : 'Prod'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('🚀 Enterprise Analytics System Info:', systemInfo);
              console.log('🚀 Enterprise Analytics Config:', config);
            }}
          >
            Log System Info
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              updateConfig({
                enabled: true,
                hybridMode: true,
                enableRealTimeActivity: true,
                enableMouseTracking: true,
                enableScrollTracking: true,
                enablePerformanceTracking: true,
                enableErrorTracking: true
              });
            }}
          >
            Ativar Tudo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

