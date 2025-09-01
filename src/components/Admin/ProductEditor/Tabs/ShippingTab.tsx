import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Truck, Package, Clock, MapPin } from 'lucide-react';
import { ProductEditorData } from '../ProductEditor';

interface ShippingTabProps {
  formData: ProductEditorData;
  onChange: (field: string, value: any) => void;
}

const ShippingTab: React.FC<ShippingTabProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Configurações de frete */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Configurações de Frete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="free_shipping">Frete Grátis</Label>
              <p className="text-sm text-gray-500">Este produto tem frete grátis</p>
            </div>
            <Switch
              id="free_shipping"
              checked={formData.free_shipping}
              onCheckedChange={(checked) => onChange('free_shipping', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shipping_time_min">Tempo Mínimo de Entrega (dias)</Label>
              <Input
                id="shipping_time_min"
                type="number"
                min="1"
                value={formData.shipping_time_min || 1}
                onChange={(e) => onChange('shipping_time_min', parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <Label htmlFor="shipping_time_max">Tempo Máximo de Entrega (dias)</Label>
              <Input
                id="shipping_time_max"
                type="number"
                min="1"
                value={formData.shipping_time_max || 3}
                onChange={(e) => onChange('shipping_time_max', parseInt(e.target.value) || 3)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shipping_weight">Peso para Frete (kg)</Label>
            <Input
              id="shipping_weight"
              type="number"
              step="0.1"
              value={formData.shipping_weight || ''}
              onChange={(e) => onChange('shipping_weight', parseFloat(e.target.value) || undefined)}
              placeholder="0.5"
            />
            <p className="text-sm text-gray-500 mt-1">
              Peso usado para calcular o frete. Se não informado, será usado um peso padrão.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Retirada na loja */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Retirada na Loja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="store_pickup_available">Disponível para Retirada</Label>
              <p className="text-sm text-gray-500">Permitir retirada na loja física</p>
            </div>
            <Switch
              id="store_pickup_available"
              checked={formData.store_pickup_available}
              onCheckedChange={(checked) => onChange('store_pickup_available', checked)}
            />
          </div>

          {formData.store_pickup_available && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Retirada Disponível</span>
              </div>
              <p className="text-sm text-green-700">
                Este produto estará disponível para retirada na loja física. 
                O cliente será notificado quando estiver pronto para coleta.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview das informações de entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Preview - Informações de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-gray-900">Opções de Entrega:</h4>
            
            <div className="space-y-2">
              {formData.store_pickup_available && (
                <div className="flex items-center gap-2 text-sm">
                  <span>📦</span>
                  <span className="text-gray-700">Retirar na loja - Disponível</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <span>🚚</span>
                <span className="text-gray-700">
                  Entrega - {formData.shipping_time_min || 1} a {formData.shipping_time_max || 3} dias úteis
                  {formData.free_shipping && (
                    <span className="text-green-600 font-medium"> (Frete Grátis)</span>
                  )}
                </span>
              </div>
            </div>

            {formData.shipping_weight && (
              <div className="text-xs text-gray-500 pt-2 border-t">
                Peso: {formData.shipping_weight}kg
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingTab;