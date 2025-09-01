import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Percent } from 'lucide-react';
import { ProductEditorData } from '../ProductEditor';

interface PricingTabProps {
  formData: ProductEditorData;
  onChange: (field: string, value: any) => void;
}

const PricingTab: React.FC<PricingTabProps> = ({ formData, onChange }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateProPrice = () => {
    if (!formData.price) return 0;
    if (formData.pro_price) return formData.pro_price;
    return formData.price * 0.9; // 10% desconto padrão
  };

  const calculateDiscountedPrice = () => {
    if (!formData.price || !formData.discount_percentage) return formData.price;
    return formData.price * (1 - formData.discount_percentage / 100);
  };

  const calculatePixPrice = () => {
    const basePrice = calculateDiscountedPrice();
    const pixDiscount = formData.pix_discount_percentage || 5;
    return basePrice * (1 - pixDiscount / 100);
  };

  return (
    <div className="space-y-6">
      {/* Preços básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Preços Principais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço de Venda *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Preço principal de venda do produto
              </p>
            </div>

            <div>
              <Label htmlFor="list_price">Preço de Lista (Opcional)</Label>
              <Input
                id="list_price"
                type="number"
                step="0.01"
                value={formData.list_price || ''}
                onChange={(e) => onChange('list_price', parseFloat(e.target.value) || undefined)}
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Preço original para mostrar desconto
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="pro_price">Preço UTI Pro (Opcional)</Label>
            <Input
              id="pro_price"
              type="number"
              step="0.01"
              value={formData.pro_price || ''}
              onChange={(e) => onChange('pro_price', parseFloat(e.target.value) || undefined)}
              placeholder="0.00"
            />
            <p className="text-sm text-gray-500 mt-1">
              Preço especial para membros UTI Pro. Se não informado, será aplicado 10% de desconto automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Descontos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Descontos e Promoções
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_percentage">Desconto Promocional (%)</Label>
              <Input
                id="discount_percentage"
                type="number"
                min="0"
                max="90"
                value={formData.discount_percentage || ''}
                onChange={(e) => onChange('discount_percentage', parseInt(e.target.value) || undefined)}
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                Desconto geral aplicado ao produto
              </p>
            </div>

            <div>
              <Label htmlFor="pix_discount_percentage">Desconto PIX (%)</Label>
              <Input
                id="pix_discount_percentage"
                type="number"
                min="0"
                max="20"
                value={formData.pix_discount_percentage || 5}
                onChange={(e) => onChange('pix_discount_percentage', parseInt(e.target.value) || 5)}
                placeholder="5"
              />
              <p className="text-sm text-gray-500 mt-1">
                Desconto adicional para pagamento via PIX
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview de preços */}
      <Card>
        <CardHeader>
          <CardTitle>Preview dos Preços</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            {formData.list_price && formData.list_price > formData.price && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Preço de Lista:</span>
                <span className="text-sm line-through text-gray-500">
                  {formatCurrency(formData.list_price)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="font-medium">Preço de Venda:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(formData.price || 0)}
              </span>
            </div>

            {formData.discount_percentage && formData.discount_percentage > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">
                  Com desconto de {formData.discount_percentage}%:
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(calculateDiscountedPrice())}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600">Preço UTI Pro:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatCurrency(calculateProPrice())}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-600">
                Preço no PIX ({formData.pix_discount_percentage || 5}% desc.):
              </span>
              <span className="text-lg font-bold text-orange-600">
                {formatCurrency(calculatePixPrice())}
              </span>
            </div>

            {formData.price > 0 && (
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500">
                  <p>• Parcelamento: até 12x de {formatCurrency((formData.price || 0) / 12)}</p>
                  <p>• Economia UTI Pro: {formatCurrency((formData.price || 0) - calculateProPrice())}</p>
                  <p>• Economia PIX: {formatCurrency(calculateDiscountedPrice() - calculatePixPrice())}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingTab;