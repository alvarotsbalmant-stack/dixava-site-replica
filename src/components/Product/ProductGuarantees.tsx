
import React from 'react';
import { Shield, Truck, RotateCcw, Headphones, Award, CreditCard } from 'lucide-react';

const ProductGuarantees: React.FC = () => {
  const guarantees = [
    {
      icon: Shield,
      title: 'Produto Original',
      description: '100% original e lacrado de fábrica',
      color: 'text-green-600 bg-green-100',
    },
    {
      icon: Truck,
      title: 'Entrega Rápida',
      description: '2 a 5 dias úteis para todo Brasil',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: RotateCcw,
      title: 'Troca Garantida',
      description: '7 dias para trocar sem complicação',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      icon: Headphones,
      title: 'Suporte Especializado',
      description: 'Atendimento gamer por especialistas',
      color: 'text-red-600 bg-red-100',
    },
    {
      icon: Award,
      title: 'Garantia UTI',
      description: '30 dias de garantia contra defeitos',
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      icon: CreditCard,
      title: 'Pagamento Seguro',
      description: 'PIX, cartão e boleto com segurança',
      color: 'text-indigo-600 bg-indigo-100',
    },
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Suas Garantias na UTI dos Games
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Mais de 10 anos de tradição em games, oferecendo sempre o melhor 
            atendimento e produtos com garantia de qualidade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guarantees.map((guarantee, index) => {
            const IconComponent = guarantee.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${guarantee.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {guarantee.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {guarantee.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Políticas Detalhadas */}
        <div className="mt-12 bg-white rounded-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Políticas de Troca e Devolução
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Política de Troca</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• 7 dias corridos a partir do recebimento</li>
                <li>• Produto deve estar lacrado e sem sinais de uso</li>
                <li>• Embalagem original preservada</li>
                <li>• Nota fiscal obrigatória</li>
                <li>• Frete de retorno por conta da UTI dos Games</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Política de Entrega</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Frete GRÁTIS para compras acima de R$ 150</li>
                <li>• Entrega expressa disponível</li>
                <li>• Rastreamento em tempo real</li>
                <li>• Seguro contra avarias incluído</li>
                <li>• Retirada na loja física disponível</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductGuarantees;
