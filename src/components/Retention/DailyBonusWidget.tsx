import React, { useState, useEffect, useRef } from 'react';
import { Gift, Flame, Clock, Star, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUTICoins } from '@/contexts/UTICoinsContext';

interface DailyBonusState {
  available: boolean;
  coins_amount: number;
  streak_count: number;
  hours_remaining: number;
  already_claimed_today: boolean;
  next_bonus_hours?: number;
}

interface ClaimResult {
  success: boolean;
  message: string;
  data?: {
    coins_earned: number;
    streak_position: number;
    streak_days: number;
    next_bonus_hours: number;
  };
}

export const DailyBonusWidget: React.FC<{ className?: string }> = ({ className }) => {
  const { user } = useAuth();
  const { refreshData } = useUTICoins();
  const { toast } = useToast();
  
  const [bonusState, setBonusState] = useState<DailyBonusState | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  const previousBalance = useRef<number | undefined>();

  // Buscar estado do bonus
  const fetchBonusState = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar código atual
      const { data: currentCodeData, error: codeError } = await supabase.functions.invoke('daily-codes', {
        body: { action: 'get_current_code' }
      });

      // Buscar status da streak
      const { data: streakData, error: streakError } = await supabase.functions.invoke('daily-codes', {
        body: { action: 'get_streak_status' }
      });

      if (codeError || streakError) {
        console.error('[DAILY_BONUS] Error fetching data:', { codeError, streakError });
        return;
      }

      const currentCode = currentCodeData?.data;
      const streakStatus = streakData?.data;

      // Verificar se já resgatou hoje
      const today = new Date().toISOString().split('T')[0];
      const alreadyClaimedToday = streakStatus?.codes?.some((code: any) => 
        code.added_at.startsWith(today)
      ) || false;

      setBonusState({
        available: currentCode?.can_claim && !alreadyClaimedToday,
        coins_amount: calculateCoinsAmount(streakStatus?.streak_count || 0),
        streak_count: streakStatus?.streak_count || 0,
        hours_remaining: currentCode?.hours_until_claim_expires || 0,
        already_claimed_today: alreadyClaimedToday,
        next_bonus_hours: alreadyClaimedToday ? getHoursUntilNextBonus() : undefined
      });

    } catch (error) {
      console.error('[DAILY_BONUS] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular quantidade de coins baseado na sequência
  const calculateCoinsAmount = (streakCount: number) => {
    const baseAmount = 10;
    const maxAmount = 50;
    const streakDays = 7;
    
    if (streakDays > 1) {
      return baseAmount + Math.round(((maxAmount - baseAmount) * (streakCount % streakDays)) / (streakDays - 1));
    }
    return baseAmount;
  };

  // Calcular horas até próximo bonus (20h do dia seguinte)
  const getHoursUntilNextBonus = () => {
    const now = new Date();
    const tomorrow8PM = new Date();
    tomorrow8PM.setDate(tomorrow8PM.getDate() + 1);
    tomorrow8PM.setHours(20, 0, 0, 0);
    
    return Math.ceil((tomorrow8PM.getTime() - now.getTime()) / (1000 * 60 * 60));
  };

  // Timer para próximo bonus
  const updateTimer = () => {
    const now = new Date();
    const tomorrow8PM = new Date();
    tomorrow8PM.setDate(tomorrow8PM.getDate() + 1);
    tomorrow8PM.setHours(20, 0, 0, 0);
    
    const timeDiff = tomorrow8PM.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    setTimeUntilNext({
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      seconds: Math.max(0, seconds)
    });
  };

  // Função para resgatar bonus automaticamente
  const handleClaimBonus = async () => {
    if (!user || claiming) return;
    
    setClaiming(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('daily-codes', {
        body: { action: 'claim_daily_bonus' }
      });

      if (error) {
        console.error('[DAILY_BONUS] Error claiming:', error);
        toast({
          title: "❌ Erro",
          description: "Erro de conexão. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      if (data.success) {
        // Animação de sucesso estilo Duolingo
        setShowSuccess(true);
        
        toast({
          title: "🎉 Recompensa Resgatada!",
          description: `+${data.data.coins_earned} UTI Coins! Sequência: ${data.data.streak_position} dias`,
          duration: 5000,
        });

        // Atualizar estado
        setBonusState(prev => ({
          ...prev!,
          already_claimed_today: true,
          streak_count: data.data.streak_position,
          next_bonus_hours: data.data.next_bonus_hours
        }));

        // Atualizar dados das moedas
        setTimeout(() => {
          refreshData?.();
        }, 1000);

        // Esconder animação após 3 segundos
        setTimeout(() => setShowSuccess(false), 3000);
        
      } else {
        toast({
          title: "❌ Ops!",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('[DAILY_BONUS] Error:', error);
      toast({
        title: "❌ Erro",
        description: "Erro interno. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setClaiming(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchBonusState();
  }, [user]);

  // Atualizar timer a cada segundo
  useEffect(() => {
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Atualizar dados a cada 30 segundos
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchBonusState, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return <LoadingState />;
  }

  if (!bonusState) {
    return <ErrorState onRetry={fetchBonusState} />;
  }

  return (
    <div className={`relative ${className || ''}`}>
      {/* Animação de sucesso estilo Duolingo */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center z-50 overflow-hidden"
          >
            {/* Confete animado */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, x: Math.random() * 300, opacity: 1 }}
                  animate={{ y: 400, rotate: 360 }}
                  transition={{ duration: 2, delay: Math.random() * 0.5 }}
                  className="absolute w-2 h-2 bg-yellow-300 rounded"
                  style={{ left: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
            
            <div className="text-center text-white z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Star className="w-16 h-16 mx-auto mb-2 text-yellow-300" />
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-bold mb-1"
              >
                Recompensa Resgatada!
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-lg"
              >
                +{bonusState.coins_amount} UTI Coins
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interface principal */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white min-h-[200px]">
        {bonusState.available && !bonusState.already_claimed_today ? (
          <AvailableState 
            bonusState={bonusState}
            claiming={claiming}
            onClaim={handleClaimBonus}
          />
        ) : bonusState.already_claimed_today ? (
          <ClaimedState bonusState={bonusState} timeUntilNext={timeUntilNext} />
        ) : (
          <WaitingState bonusState={bonusState} timeUntilNext={timeUntilNext} />
        )}
      </div>
    </div>
  );
};

// Componente para estado disponível
const AvailableState: React.FC<{
  bonusState: DailyBonusState;
  claiming: boolean;
  onClaim: () => void;
}> = ({ bonusState, claiming, onClaim }) => (
  <div className="text-center">
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1
      }}
      className="mb-4"
    >
      <Gift className="w-12 h-12 mx-auto text-yellow-300" />
    </motion.div>
    
    <h3 className="text-xl font-bold mb-2">Recompensa Diária Disponível!</h3>
    
    <div className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
      <Sparkles className="w-6 h-6 text-yellow-300" />
      <span>+{bonusState.coins_amount} UTI Coins</span>
      <Sparkles className="w-6 h-6 text-yellow-300" />
    </div>
    
    {bonusState.streak_count > 0 && (
      <div className="flex items-center justify-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-300" />
        <span>Sequência: {bonusState.streak_count} dias</span>
        <Flame className="w-5 h-5 text-orange-300" />
      </div>
    )}
    
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClaim}
      disabled={claiming}
      className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {claiming ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          Resgatando...
        </div>
      ) : (
        "🎯 RESGATAR AGORA!"
      )}
    </motion.button>
    
    {bonusState.hours_remaining > 0 && (
      <p className="text-sm opacity-80 mt-3">
        ⏰ Válido por mais {bonusState.hours_remaining}h
      </p>
    )}
  </div>
);

// Componente para estado já resgatado
const ClaimedState: React.FC<{ 
  bonusState: DailyBonusState;
  timeUntilNext: { hours: number; minutes: number; seconds: number };
}> = ({ bonusState, timeUntilNext }) => (
  <div className="text-center">
    <div className="w-12 h-12 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
      <Trophy className="w-6 h-6 text-white" />
    </div>
    
    <h3 className="text-xl font-bold mb-2">Recompensa Resgatada!</h3>
    
    <div className="flex items-center justify-center gap-2 mb-4">
      <Flame className="w-5 h-5 text-orange-300" />
      <span>Sequência: {bonusState.streak_count} dias</span>
      <Flame className="w-5 h-5 text-orange-300" />
    </div>
    
    <div className="text-lg mb-2">Próxima recompensa em:</div>
    <div className="text-2xl font-mono font-bold mb-3">
      {String(timeUntilNext.hours).padStart(2, '0')}:
      {String(timeUntilNext.minutes).padStart(2, '0')}:
      {String(timeUntilNext.seconds).padStart(2, '0')}
    </div>
    
    <p className="text-sm opacity-80">🎯 Continue a sequência amanhã!</p>
  </div>
);

// Componente para estado aguardando
const WaitingState: React.FC<{ 
  bonusState: DailyBonusState;
  timeUntilNext: { hours: number; minutes: number; seconds: number };
}> = ({ bonusState, timeUntilNext }) => (
  <div className="text-center">
    <Clock className="w-12 h-12 mx-auto mb-4 text-blue-300" />
    
    <h3 className="text-xl font-bold mb-2">Próxima Recompensa Em:</h3>
    
    <div className="text-3xl font-mono font-bold mb-4">
      {String(timeUntilNext.hours).padStart(2, '0')}:
      {String(timeUntilNext.minutes).padStart(2, '0')}:
      {String(timeUntilNext.seconds).padStart(2, '0')}
    </div>
    
    {bonusState.streak_count > 0 && (
      <div className="flex items-center justify-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-300" />
        <span>Sequência atual: {bonusState.streak_count} dias</span>
        <Flame className="w-5 h-5 text-orange-300" />
      </div>
    )}
    
    <p className="text-lg">Volte às 20h para resgatar!</p>
  </div>
);

// Componente de loading
const LoadingState: React.FC = () => (
  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white min-h-[200px] flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p>Carregando recompensa...</p>
    </div>
  </div>
);

// Componente de erro
const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white min-h-[200px] flex items-center justify-center">
    <div className="text-center">
      <p className="mb-4">Erro ao carregar recompensa</p>
      <button 
        onClick={onRetry}
        className="bg-white text-gray-600 px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  </div>
);

export default DailyBonusWidget;

