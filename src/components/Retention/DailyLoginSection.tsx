
import React, { useState } from 'react';
import { Coins, Clock, TrendingUp, Calendar, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUTICoins } from '@/hooks/useUTICoins';
import { useDailyBonusBrasilia } from '@/hooks/useDailyBonusBrasilia';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface DailyLoginSectionProps {
  showTitle?: boolean;
}

export const DailyLoginSection: React.FC<DailyLoginSectionProps> = ({ showTitle = true }) => {
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);
  const { earnCoins } = useUTICoins();
  const { streak, timer, calculateNextMultiplier, calculateMultiplierPercentage, refreshStreak } = useDailyBonusBrasilia();
  const { toast } = useToast();

  const currentMultiplier = streak?.streak_multiplier || 1.0;
  const currentStreak = streak?.current_streak || 0;
  const nextMultiplier = calculateNextMultiplier(currentStreak);
  const multiplierPercentage = calculateMultiplierPercentage(currentMultiplier);

  const handleDailyLogin = async () => {
    if (!timer.canClaim || isClaimingDaily) return;

    setIsClaimingDaily(true);
    
    try {
      const result = await earnCoins('daily_login', undefined, 'Bônus diário resgatado');
      
      if (result?.success) {
        toast({
          title: "Bônus Diário Resgatado!",
          description: `Você ganhou ${result.coins_earned} UTI Coins! Streak: ${result.streak} dias`,
          duration: 5000,
        });
        
        // Atualizar dados de streak
        await refreshStreak();
      } else {
        // Mostrar mensagem específica do backend
        const errorMessage = result?.message || "Não foi possível resgatar o bônus diário";
        
        toast({
          title: "Erro ao Resgatar Bônus",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
        
        console.log('Erro detalhado:', result);
      }
    } catch (error) {
      console.error('Erro ao resgatar bônus diário:', error);
      toast({
        title: "Erro",
        description: "Erro interno. Tente novamente.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsClaimingDaily(false);
    }
  };

  const formatTime = (hours: number, minutes: number, seconds: number): string => {
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-800">Login Diário</h3>
        </div>
      )}

      {/* Status do Streak */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-700">Sequência Atual</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {currentStreak} {currentStreak === 1 ? 'dia' : 'dias'}
          </div>
        </div>

        {/* Informações do Multiplicador */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Multiplicador Atual</div>
            <div className="text-xl font-bold text-green-600">{currentMultiplier.toFixed(1)}x</div>
            <div className="text-xs text-gray-500">
              {multiplierPercentage}% do máximo
            </div>
          </div>

          <div className="bg-white/50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Próximo Multiplicador</div>
            <div className="text-xl font-bold text-blue-600">{nextMultiplier.toFixed(1)}x</div>
            <div className="text-xs text-gray-500">
              Faça login amanhã
            </div>
          </div>
        </div>

        {/* Progresso do Multiplicador */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progresso do Multiplicador</span>
            <span>{multiplierPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${multiplierPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Botão de Claim ou Timer */}
      {timer.canClaim ? (
        <Button
          onClick={handleDailyLogin}
          disabled={isClaimingDaily}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 text-lg font-semibold"
        >
          {isClaimingDaily ? (
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 animate-spin" />
              Resgatando...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Resgatar Bônus Diário
            </div>
          )}
        </Button>
      ) : timer.alreadyClaimed ? (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="text-center">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-2">Próximo bônus em:</div>
            <div className="text-2xl font-mono font-bold text-gray-800">
              {formatTime(timer.hoursUntilNext, timer.minutesUntilNext, timer.secondsUntilNext)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Renovação às 20h (Horário de Brasília)
            </div>
            {timer.lastClaim && (
              <div className="text-xs text-gray-400 mt-1">
                Último resgate: {new Date(timer.lastClaim).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-sm text-blue-600 mb-2">Aguarde o código diário ficar disponível</div>
            <div className="text-xs text-blue-500">
              Os códigos são liberados às 20h (Horário de Brasília)
            </div>
          </div>
        </div>
      )}

      {/* Dica sobre Multiplicador */}
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-700">
            <strong>Dica:</strong> Mantenha sua sequência de login para aumentar seu multiplicador de moedas!
            Quanto maior a sequência, mais moedas você ganha por dia.
          </div>
        </div>
      </div>
    </div>
  );
};
