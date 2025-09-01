import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Navigation } from 'lucide-react';
import { ProductFormData } from '@/types/product-extended';

interface NavigationTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

const NavigationTab: React.FC<NavigationTabProps> = ({ formData, onChange }) => {
  const handleBreadcrumbConfigChange = (field: string, value: any) => {
    const currentConfig = formData.breadcrumb_config || {};
    onChange('breadcrumb_config', {
      ...currentConfig,
      [field]: value
    });
  };

  const breadcrumbConfig = formData.breadcrumb_config || {
    show_breadcrumb: true,
    use_custom: false,
    custom_path: []
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Configurações de Navegação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={breadcrumbConfig.show_breadcrumb !== false}
              onCheckedChange={(checked) => handleBreadcrumbConfigChange('show_breadcrumb', checked)}
            />
            <Label>Exibir breadcrumb</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={breadcrumbConfig.use_custom || false}
              onCheckedChange={(checked) => handleBreadcrumbConfigChange('use_custom', checked)}
            />
            <Label>Usar breadcrumb personalizado</Label>
          </div>

          {breadcrumbConfig.use_custom && (
            <div>
              <Label htmlFor="custom_path">Caminho Personalizado</Label>
              <Input
                id="custom_path"
                value={breadcrumbConfig.custom_path?.join(' > ') || ''}
                onChange={(e) => {
                  const path = e.target.value.split('>').map(p => p.trim()).filter(Boolean);
                  handleBreadcrumbConfigChange('custom_path', path);
                }}
                placeholder="Home > Categoria > Subcategoria"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separar níveis com {' > '}. Ex: Home {' > '} Xbox {' > '} Consoles
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationTab;

