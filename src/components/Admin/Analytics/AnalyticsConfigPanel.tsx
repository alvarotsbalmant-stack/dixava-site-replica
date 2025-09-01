import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { useAnalyticsConfig } from '@/hooks/useAnalyticsConfig';
import { useAuth } from '@/hooks/useAuth';

export const AnalyticsConfigPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showMockData, toggleMockData } = useAnalyticsConfig();

  // Debug logs
  console.log('AnalyticsConfigPanel - isAdmin:', isAdmin);
  console.log('AnalyticsConfigPanel - showMockData:', showMockData);

  // Só mostra o painel para admins
  if (!isAdmin) {
    console.log('AnalyticsConfigPanel - User is not admin, hiding panel');
    return null;
  }

  return (
    <Card className="mb-6 border-warning/20 bg-warning/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-warning-foreground">
          <AlertTriangle className="h-5 w-5" />
          Configurações de Analytics
        </CardTitle>
        <CardDescription>
          Configure como os dados de analytics são exibidos no dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="mock-data-toggle" className="text-base font-medium">
              Exibir dados mock
            </Label>
            <p className="text-sm text-muted-foreground">
              Quando habilitado, exibe dados de demonstração nos gráficos. 
              Desabilite para ver apenas dados reais do sistema.
            </p>
          </div>
          <Switch
            id="mock-data-toggle"
            checked={showMockData}
            onCheckedChange={toggleMockData}
          />
        </div>
        
        {showMockData && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-md">
            <p className="text-sm text-warning-foreground">
              ⚠️ <strong>Modo de demonstração ativo:</strong> Os dados exibidos são fictícios 
              e foram criados apenas para fins de demonstração. Desative esta opção para 
              visualizar dados reais do seu sistema.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};