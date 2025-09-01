import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Plus, X } from 'lucide-react';
import { ProductFormData, TrustIndicator } from '@/types/product-extended';

interface TrustIndicatorsTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

const TrustIndicatorsTab: React.FC<TrustIndicatorsTabProps> = ({ formData, onChange }) => {
  const [newIndicator, setNewIndicator] = useState({
    text: '',
    type: 'warranty',
    is_visible: true
  });

  const indicatorTypes = [
    { value: 'warranty', label: 'Garantia' },
    { value: 'security', label: 'Segurança' },
    { value: 'shipping', label: 'Entrega' },
    { value: 'support', label: 'Suporte' },
    { value: 'quality', label: 'Qualidade' }
  ];

  const handleAddIndicator = () => {
    if (newIndicator.text.trim()) {
      const currentIndicators = formData.trust_indicators || [];
      const indicatorToAdd: TrustIndicator = {
        id: `indicator-${Date.now()}`,
        title: newIndicator.text.trim(),
        description: '',
        icon: '',
        color: '#22c55e',
        text: newIndicator.text.trim(),
        type: newIndicator.type,
        order: currentIndicators.length + 1,
        is_visible: newIndicator.is_visible
      };
      
      onChange('trust_indicators', [...currentIndicators, indicatorToAdd]);
      setNewIndicator({
        text: '',
        type: 'warranty',
        is_visible: true
      });
    }
  };

  const handleRemoveIndicator = (indicatorId: string) => {
    const currentIndicators = formData.trust_indicators || [];
    const newIndicators = currentIndicators.filter(i => i.id !== indicatorId);
    onChange('trust_indicators', newIndicators);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Indicador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="indicator_text">Texto do Indicador</Label>
            <Input
              id="indicator_text"
              value={newIndicator.text}
              onChange={(e) => setNewIndicator(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Ex: Garantia de 12 meses"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="indicator_type">Tipo</Label>
            <select
              id="indicator_type"
              value={newIndicator.type}
              onChange={(e) => setNewIndicator(prev => ({ ...prev, type: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
            >
              {indicatorTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={newIndicator.is_visible}
              onCheckedChange={(checked) => setNewIndicator(prev => ({ ...prev, is_visible: checked as boolean }))}
            />
            <Label>Visível no produto</Label>
          </div>

          <Button 
            onClick={handleAddIndicator} 
            disabled={!newIndicator.text.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Indicador
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Indicadores Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.trust_indicators && formData.trust_indicators.length > 0 ? (
            <div className="space-y-3">
              {formData.trust_indicators.map((indicator) => (
                <div key={indicator.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>{indicator.text || indicator.title}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {indicatorTypes.find(t => t.value === (indicator.type || 'warranty'))?.label}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveIndicator(indicator.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum indicador adicionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrustIndicatorsTab;

