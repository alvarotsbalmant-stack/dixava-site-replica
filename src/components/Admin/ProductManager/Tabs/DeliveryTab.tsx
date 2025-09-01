import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck } from 'lucide-react';
import { ProductFormData } from '@/types/product-extended';

interface DeliveryTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

const DeliveryTab: React.FC<DeliveryTabProps> = ({ formData, onChange }) => {
  const handleDeliveryConfigChange = (field: string, value: any) => {
    const currentConfig = formData.delivery_config || {};
    onChange('delivery_config', {
      ...currentConfig,
      [field]: value
    });
  };

  const deliveryConfig = formData.delivery_config || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Configurações de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="shipping_time">Prazo de Entrega Personalizado</Label>
            <Input
              id="shipping_time"
              value={deliveryConfig.custom_shipping_time || ''}
              onChange={(e) => handleDeliveryConfigChange('custom_shipping_time', e.target.value)}
              placeholder="Ex: 2-5 dias úteis"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="shipping_regions">Regiões de Entrega</Label>
            <Input
              id="shipping_regions"
              value={deliveryConfig.shipping_regions?.join(', ') || ''}
              onChange={(e) => {
                const regions = e.target.value.split(',').map(r => r.trim()).filter(Boolean);
                handleDeliveryConfigChange('shipping_regions', regions);
              }}
              placeholder="São Paulo, Rio de Janeiro, Minas Gerais..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pickup_locations">Locais de Retirada</Label>
            <Textarea
              id="pickup_locations"
              value={deliveryConfig.pickup_locations?.join('\n') || ''}
              onChange={(e) => {
                const locations = e.target.value.split('\n').map(l => l.trim()).filter(Boolean);
                handleDeliveryConfigChange('pickup_locations', locations);
              }}
              placeholder="Endereço 1&#10;Endereço 2..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="shipping_notes">Observações de Entrega</Label>
            <Textarea
              id="shipping_notes"
              value={deliveryConfig.shipping_notes || ''}
              onChange={(e) => handleDeliveryConfigChange('shipping_notes', e.target.value)}
              placeholder="Informações adicionais sobre entrega..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={deliveryConfig.express_available || false}
              onCheckedChange={(checked) => handleDeliveryConfigChange('express_available', checked)}
            />
            <Label>Entrega expressa disponível</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryTab;

