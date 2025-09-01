import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Monitor } from 'lucide-react';
import { ProductFormData } from '@/types/product-extended';

interface DisplayTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

const DisplayTab: React.FC<DisplayTabProps> = ({ formData, onChange }) => {
  const handleDisplayConfigChange = (field: string, value: any) => {
    const currentConfig = formData.display_config || {};
    onChange('display_config', {
      ...currentConfig,
      [field]: value
    });
  };

  const displayConfig = formData.display_config || {
    show_stock_counter: true,
    show_view_counter: false,
    custom_view_count: 0,
    show_urgency_banner: false,
    urgency_text: '',
    show_social_proof: false,
    social_proof_text: ''
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Controles de Exibição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={displayConfig.show_stock_counter !== false}
              onCheckedChange={(checked) => handleDisplayConfigChange('show_stock_counter', checked)}
            />
            <Label>Exibir contador de estoque</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={displayConfig.show_view_counter || false}
              onCheckedChange={(checked) => handleDisplayConfigChange('show_view_counter', checked)}
            />
            <Label>Exibir contador de visualizações</Label>
          </div>

          {displayConfig.show_view_counter && (
            <div>
              <Label htmlFor="custom_view_count">Número de Visualizações</Label>
              <Input
                id="custom_view_count"
                type="number"
                value={displayConfig.custom_view_count || 0}
                onChange={(e) => handleDisplayConfigChange('custom_view_count', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={displayConfig.show_urgency_banner || false}
              onCheckedChange={(checked) => handleDisplayConfigChange('show_urgency_banner', checked)}
            />
            <Label>Exibir banner de urgência</Label>
          </div>

          {displayConfig.show_urgency_banner && (
            <div>
              <Label htmlFor="urgency_text">Texto de Urgência</Label>
              <Input
                id="urgency_text"
                value={displayConfig.urgency_text || ''}
                onChange={(e) => handleDisplayConfigChange('urgency_text', e.target.value)}
                placeholder="Ex: Últimas unidades!"
                className="mt-1"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={displayConfig.show_social_proof || false}
              onCheckedChange={(checked) => handleDisplayConfigChange('show_social_proof', checked)}
            />
            <Label>Exibir prova social</Label>
          </div>

          {displayConfig.show_social_proof && (
            <div>
              <Label htmlFor="social_proof_text">Texto de Prova Social</Label>
              <Input
                id="social_proof_text"
                value={displayConfig.social_proof_text || ''}
                onChange={(e) => handleDisplayConfigChange('social_proof_text', e.target.value)}
                placeholder="Ex: 50+ pessoas compraram hoje"
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DisplayTab;

