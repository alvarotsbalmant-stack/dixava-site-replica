import React, { useState } from 'react';
import { CreditCard, Smartphone, FileText, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaymentMethodsProps {
  className?: string;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const paymentMethods = [
    {
      category: 'PIX',
      icon: Smartphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      methods: [
        { name: 'PIX', discount: '5% desconto', highlight: true },
      ]
    },
    {
      category: 'Cartão de Crédito',
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      methods: [
        { name: 'Visa', installments: 'até 12x sem juros' },
        { name: 'Mastercard', installments: 'até 12x sem juros' },
        { name: 'Elo', installments: 'até 12x sem juros' },
        { name: 'American Express', installments: 'até 10x sem juros' },
      ]
    },
    {
      category: 'Cartão de Débito',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      methods: [
        { name: 'Débito Visa', discount: '3% desconto' },
        { name: 'Débito Mastercard', discount: '3% desconto' },
      ]
    },
    {
      category: 'Outros',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      methods: [
        { name: 'Boleto Bancário', installments: 'à vista' },
        { name: 'Transferência', installments: 'à vista' },
      ]
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Título */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900 text-sm">Formas de pagamento</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Métodos Principais (sempre visíveis) */}
      <div className="space-y-2">
        {/* PIX - Destaque */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-green-800 text-sm">PIX</div>
              <div className="text-xs text-green-600 font-medium">
                5% de desconto à vista
              </div>
            </div>
            <div className="text-green-700 font-bold text-sm">
              Instantâneo
            </div>
          </div>
        </div>

        {/* Cartão de Crédito */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-blue-800 text-sm">Cartão de Crédito</div>
              <div className="text-xs text-blue-600">
                Até 12x sem juros
              </div>
            </div>
          </div>
        </div>

        {/* Bandeiras Principais */}
        <div className="flex justify-center gap-2 py-2">
          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
            VISA
          </div>
          <div className="w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
            MC
          </div>
          <div className="w-8 h-5 bg-yellow-500 rounded text-white text-xs flex items-center justify-center font-bold">
            ELO
          </div>
          <div className="w-8 h-5 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
            AE
          </div>
        </div>
      </div>

      {/* Métodos Expandidos */}
      {isExpanded && (
        <div className="space-y-3 border-t border-gray-200 pt-3">
          {paymentMethods.slice(1).map((category, categoryIndex) => {
            const IconComponent = category.icon;
            return (
              <div key={categoryIndex} className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconComponent className={cn("w-4 h-4", category.color)} />
                  <span className="font-medium text-gray-800 text-sm">
                    {category.category}
                  </span>
                </div>
                
                <div className="space-y-1 ml-6">
                  {category.methods.map((method, methodIndex) => (
                    <div
                      key={methodIndex}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <span className="text-gray-700">{method.name}</span>
                      <span className={cn(
                        "font-medium",
                        method.discount ? "text-green-600" : "text-gray-600"
                      )}>
                        {method.discount || method.installments}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Informações Adicionais */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-600 space-y-1">
              <div>💳 Parcelamento sem juros no cartão</div>
              <div>🔒 Pagamento 100% seguro</div>
              <div>📱 Checkout rápido e fácil</div>
              <div>🎁 Cashback em compras recorrentes</div>
            </div>
          </div>

          {/* Calculadora de Parcelas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-800 mb-2">
              💰 Simulação de parcelas
            </div>
            <div className="space-y-1 text-xs text-blue-700">
              <div className="flex justify-between">
                <span>1x no cartão:</span>
                <span className="font-medium">R$ 199,99</span>
              </div>
              <div className="flex justify-between">
                <span>6x sem juros:</span>
                <span className="font-medium">R$ 33,33</span>
              </div>
              <div className="flex justify-between">
                <span>12x sem juros:</span>
                <span className="font-medium">R$ 16,67</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link para Mais Informações */}
      <div className="text-center">
        <button className="text-xs text-blue-600 hover:underline">
          Ver todas as condições de pagamento
        </button>
      </div>
    </div>
  );
};

export default PaymentMethods;

