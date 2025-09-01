import React, { useState } from 'react';
import { Coins, X, Gift, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUTICoins } from '@/hooks/useUTICoins';
import { useToast } from '@/hooks/use-toast';

import { UTICoinsConditional } from './UTICoinsConditional';

export const FloatingActionButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { coins } = useUTICoins();

  // Só mostrar para usuários logados
  if (!user) return null;

  return (
    <UTICoinsConditional>
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Menu expandido */}
          <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-96 transform transition-all duration-300 scale-100 max-h-[80vh] overflow-y-auto">{/* Updated width from w-72 to w-96 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-800">UTI Coins</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Saldo */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 text-white mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Seu saldo</p>
                  <p className="text-2xl font-bold">{coins.balance.toLocaleString()}</p>
                </div>
                <Coins className="w-8 h-8 text-yellow-200" />
              </div>
            </div>


            {/* Ações rápidas */}
            <div className="space-y-2">
              
              <button
                onClick={() => {
                  setIsExpanded(false);
                  navigate('/coins');
                }}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Ver Tudo & Recompensas
              </button>
            </div>
          </div>
        </>
      )}

      {/* Botão principal */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl
          flex items-center justify-center transition-all duration-300 hover:scale-110
          ${isExpanded ? 'rotate-45' : 'rotate-0'}
        `}
      >
        {isExpanded ? (
          <X className="w-6 h-6" />
        ) : (
          <Coins className="w-6 h-6" />
        )}
      </button>
    </div>
    </UTICoinsConditional>
  );
};

