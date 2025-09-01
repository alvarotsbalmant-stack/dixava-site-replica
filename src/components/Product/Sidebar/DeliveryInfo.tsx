import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { Truck, MapPin, Clock, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { formatPrice } from '@/utils/formatPrice';

interface DeliveryInfoProps {
  product: Product;
  className?: string;
}

const DeliveryInfo: React.FC<DeliveryInfoProps> = ({ 
  product, 
  className 
}) => {
  const [cep, setCep] = useState('');
  const [showCepInput, setShowCepInput] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const { storeSettings } = useStoreSettings();

  const isFreeShipping = product.free_shipping || product.price >= storeSettings.free_shipping_minimum;

  const handleCepCalculation = () => {
    // Mock de cálculo de frete usando configurações dinâmicas
    setDeliveryInfo({
      standard: { days: storeSettings.standard_delivery_days, price: isFreeShipping ? 0 : 12.90 },
      express: { days: storeSettings.express_delivery_days, price: storeSettings.express_delivery_price }
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Frete Grátis - Design Clean e Minimalista */}
      <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm">
        {/* Header clean */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
            <Truck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg text-gray-900">
                Frete Grátis
              </span>
              <div className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                Garantido
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Entrega sem custo adicional
            </p>
          </div>
        </div>

        {/* Benefícios clean */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                Acima de {formatPrice(storeSettings.free_shipping_minimum)}
              </span>
            </div>
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                Para {storeSettings.free_shipping_regions.join(', ')}
              </span>
            </div>
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">
                Entrega em {storeSettings.standard_delivery_days} dias úteis
              </span>
            </div>
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Estimativa de Entrega */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-gray-900">
          <Clock className="w-4 h-4" />
          <span className="font-medium">Prazo de entrega</span>
        </div>
        
        <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
          <div className="font-medium text-blue-800 mb-1">
            📦 Chegará grátis entre quinta e sexta-feira
          </div>
          <div className="text-blue-600">
            Compre até às {storeSettings.cutoff_time} e receba mais rápido
          </div>
        </div>
      </div>

      {/* Calculadora de CEP */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Calcular frete</span>
          </div>
          <button
            onClick={() => setShowCepInput(!showCepInput)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showCepInput ? 'Ocultar' : 'Calcular'}
          </button>
        </div>

        {showCepInput && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Digite seu CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="flex-1 text-sm"
                maxLength={9}
              />
              <Button
                size="sm"
                onClick={handleCepCalculation}
                disabled={cep.length < 8}
                className="px-3"
              >
                <Calculator className="w-4 h-4" />
              </Button>
            </div>
            
            {deliveryInfo && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Padrão ({deliveryInfo.standard.days} dias)</span>
                  <span className="font-medium text-green-600">Grátis</span>
                </div>
                <div className="flex justify-between">
                  <span>Expressa ({deliveryInfo.express.days} dias)</span>
                  <span className="font-medium">R$ {deliveryInfo.express.price.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Opções de Entrega */}
      <div className="space-y-2">
        <button className="w-full text-left text-sm text-blue-600 hover:underline">
          📍 Retirar na loja ({storeSettings.store_address})
        </button>
        <button className="w-full text-left text-sm text-blue-600 hover:underline">
          🚚 Mais opções de entrega
        </button>
      </div>

      {/* Informações Adicionais */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg space-y-1">
        <div>📋 Produto enviado pela {storeSettings.company_name}</div>
        <div>🔒 Embalagem discreta e segura</div>
        <div>📞 Rastreamento em tempo real</div>
        {storeSettings.company_cnpj && (
          <div>🏢 CNPJ: {storeSettings.company_cnpj}</div>
        )}
      </div>
    </div>
  );
};

export default DeliveryInfo;

