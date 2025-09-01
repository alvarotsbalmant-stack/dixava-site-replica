import React from 'react';
import { Product } from '@/hooks/useProducts';
import { Coins, Gift, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUTICoins } from '@/hooks/useUTICoins';
import { cn } from '@/lib/utils';

interface UTICoinsInfoProps {
  product: Product;
  quantity?: number;
  className?: string;
}

const UTICoinsInfo: React.FC<UTICoinsInfoProps> = ({
  product,
  quantity = 1,
  className
}) => {
  const { user } = useAuth();
  const { balance } = useUTICoins();

  // Cálculo de coins ganhos (2% do valor da compra)
  const coinsEarned = Math.floor((product.price * quantity) * 0.02);
  
  // Valor em reais dos coins ganhos (1 coin = R$ 0,01)
  const coinsValue = coinsEarned * 0.01;

  // Bonus por quantidade
  const quantityBonus = quantity >= 3 ? Math.floor(coinsEarned * 0.5) : 0;
  const totalCoins = coinsEarned + quantityBonus;

  return (
    <div className={cn("space-y-4", className)}>
      {/* UTI Coins - Ganhos na Compra */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-yellow-800 text-lg">UTI Coins</span>
            <div className="text-xs text-yellow-600">Sistema de fidelidade</div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Coins Ganhos */}
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Ganhe nesta compra:</span>
              <div className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="font-bold text-yellow-700 text-lg">
                  {totalCoins.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Base: {coinsEarned} coins (2% do valor)</div>
              {quantityBonus > 0 && (
                <div className="text-green-600">
                  • Bônus quantidade: +{quantityBonus} coins
                </div>
              )}
              <div className="text-yellow-600 font-medium">
                💰 Equivale a R$ {(totalCoins * 0.01).toFixed(2)} para próximas compras
              </div>
            </div>
          </div>

          {/* Saldo Atual (se logado) */}
          {user && (
            <div className="bg-white rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Seu saldo atual:</span>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  <span className="font-bold text-yellow-700">
                    {balance?.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                = R$ {((balance || 0) * 0.01).toFixed(2)} disponível
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Como Usar os Coins */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-800 text-sm">Como usar seus coins</span>
        </div>
        
        <div className="text-xs text-blue-700 space-y-1">
          <div>• 1 coin = R$ 0,01 de desconto</div>
          <div>• Use em qualquer compra</div>
          <div>• Sem prazo de validade</div>
          <div>• Acumule e troque por produtos</div>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full mt-3 border-blue-300 text-blue-600 hover:bg-blue-100 text-xs"
          onClick={() => window.open('/coins', '_blank')}
        >
          Ver meus coins
        </Button>
      </div>

      {/* Programa de Fidelidade */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-purple-800 text-sm">Programa VIP</span>
        </div>
        
        <div className="text-xs text-purple-700 space-y-1 mb-3">
          <div>🥉 Bronze: 2% em coins</div>
          <div>🥈 Prata: 3% em coins (R$ 500+)</div>
          <div>🥇 Ouro: 4% em coins (R$ 1.500+)</div>
          <div>💎 Diamante: 5% em coins (R$ 3.000+)</div>
        </div>

        <div className="bg-white rounded p-2 border border-purple-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-purple-600">Próximo nível:</span>
            <span className="font-medium text-purple-700">Prata</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-1.5 mt-1">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Faltam R$ 175 para o próximo nível
          </div>
        </div>
      </div>

      {/* Convite para Cadastro (se não logado) */}
      {!user && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-sm font-medium text-green-800 mb-2">
            🎁 Cadastre-se e ganhe coins!
          </div>
          <div className="text-xs text-green-700 mb-3">
            Crie sua conta e comece a acumular coins em todas as compras
          </div>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white text-xs"
          >
            Criar conta grátis
          </Button>
        </div>
      )}
    </div>
  );
};

export default UTICoinsInfo;

