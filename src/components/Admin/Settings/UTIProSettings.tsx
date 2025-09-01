import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Globe } from 'lucide-react';

interface UTIProSettingsProps {
  utiProEnabled: boolean;
  setUtiProEnabled: (enabled: boolean) => void;
}

export const UTIProSettings: React.FC<UTIProSettingsProps> = ({
  utiProEnabled,
  setUtiProEnabled
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Sistema UTI PRO
        </CardTitle>
        <CardDescription>
          Ativar ou desativar o sistema de preços UTI PRO no site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="uti-pro-enabled"
            checked={utiProEnabled}
            onCheckedChange={setUtiProEnabled}
          />
          <Label htmlFor="uti-pro-enabled">
            UTI PRO {utiProEnabled ? 'Ativado' : 'Desativado'}
          </Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Quando ativado, os preços especiais para membros UTI PRO serão exibidos no site.
        </p>
      </CardContent>
    </Card>
  );
};