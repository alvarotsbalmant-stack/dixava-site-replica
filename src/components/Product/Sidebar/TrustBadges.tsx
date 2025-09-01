import React from 'react';
import { Shield, Truck, RotateCcw, Headphones, Award, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadgesProps {
  className?: string;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({ className }) => {
  const badges = [
    {
      icon: Shield,
      title: 'Produto Original',
      description: 'Lacrado e garantido',
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Truck,
      title: 'Entrega Rápida',
      description: '3-5 dias úteis',
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: RotateCcw,
      title: 'Troca Garantida',
      description: '7 dias para trocar',
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Headphones,
      title: 'Suporte UTI',
      description: 'Atendimento especializado',
      color: 'bg-red-100 text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Título */}
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-gray-600" />
        <span className="font-medium text-gray-900 text-sm">Garantias UTI</span>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 gap-3">
        {badges.map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
                badge.bgColor
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                badge.color
              )}>
                <IconComponent className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">
                  {badge.title}
                </div>
                <div className="text-xs text-gray-600">
                  {badge.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificações */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900 text-sm">Segurança</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            SSL 256-bit
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            PCI Compliant
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Site Blindado
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Reclame Aqui
          </div>
        </div>
      </div>

      {/* Informações Legais */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>📋 CNPJ: 16.811.173/0001-20</div>
        <div>📍 Colatina - ES, Brasil</div>
        <div>⭐ 15+ anos no mercado</div>
        <div>🏆 +50.000 clientes satisfeitos</div>
      </div>

      {/* Links Úteis */}
      <div className="space-y-1">
        <button className="w-full text-left text-xs text-blue-600 hover:underline">
          📜 Política de Privacidade
        </button>
        <button className="w-full text-left text-xs text-blue-600 hover:underline">
          🔄 Política de Trocas
        </button>
        <button className="w-full text-left text-xs text-blue-600 hover:underline">
          📞 Central de Atendimento
        </button>
      </div>
    </div>
  );
};

export default TrustBadges;

