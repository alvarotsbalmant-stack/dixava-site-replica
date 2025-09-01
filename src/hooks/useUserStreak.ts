import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  streak_multiplier: number;
  last_login_date: string | null;
}

interface DailyLoginTimer {
  canClaim: boolean;
  hoursUntilNext: number;
  minutesUntilNext: number;
  secondsUntilNext: number;
  nextClaimTime: Date | null;
}

interface StreakConfig {
  max_multiplier: number;
  multiplier_increment: number;
}

export const useUserStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState<DailyLoginTimer>({
    canClaim: true,
    hoursUntilNext: 0,
    minutesUntilNext: 0,
    secondsUntilNext: 0,
    nextClaimTime: null
  });
  const [config, setConfig] = useState<StreakConfig>({
    max_multiplier: 3.0,
    multiplier_increment: 0.1
  });

  // Calcular próximo multiplicador
  const calculateNextMultiplier = useCallback((currentStreak: number): number => {
    const nextStreak = currentStreak + 1;
    const nextMultiplier = 1.0 + ((nextStreak - 1) * config.multiplier_increment);
    return Math.min(nextMultiplier, config.max_multiplier);
  }, [config]);

  // Calcular porcentagem do multiplicador máximo
  const calculateMultiplierPercentage = useCallback((currentMultiplier: number): number => {
    return Math.round((currentMultiplier / config.max_multiplier) * 100);
  }, [config.max_multiplier]);

  // Calcular tempo até próximo claim (agora usando backend timer)
  const calculateNextClaimTime = useCallback(async (userId: string): Promise<DailyLoginTimer> => {
    try {
      // Verificar no backend se pode fazer claim hoje
      const { data, error } = await supabase
        .from('daily_actions')
        .select('last_performed_at')
        .eq('user_id', userId)
        .eq('action', 'daily_login')
        .eq('action_date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar timer:', error);
        return {
          canClaim: true,
          hoursUntilNext: 0,
          minutesUntilNext: 0,
          secondsUntilNext: 0,
          nextClaimTime: null
        };
      }

      // Se não há registro hoje, pode fazer claim
      if (!data) {
        return {
          canClaim: true,
          hoursUntilNext: 0,
          minutesUntilNext: 0,
          secondsUntilNext: 0,
          nextClaimTime: null
        };
      }

      // Se já fez hoje, calcular tempo até amanhã
      const today = new Date();
      const nextClaimDate = new Date(today);
      nextClaimDate.setDate(nextClaimDate.getDate() + 1);
      nextClaimDate.setHours(0, 0, 0, 0);

      const timeDiff = nextClaimDate.getTime() - today.getTime();
      const hoursUntilNext = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutesUntilNext = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const secondsUntilNext = Math.floor((timeDiff % (1000 * 60)) / 1000);

      return {
        canClaim: false,
        hoursUntilNext,
        minutesUntilNext,
        secondsUntilNext,
        nextClaimTime: nextClaimDate
      };
    } catch (error) {
      console.error('Erro ao calcular timer:', error);
      return {
        canClaim: true,
        hoursUntilNext: 0,
        minutesUntilNext: 0,
        secondsUntilNext: 0,
        nextClaimTime: null
      };
    }
  }, []);

  // Carregar dados de streak e configurações COM VALIDAÇÃO AUTOMÁTICA
  const loadStreakData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // USAR EDGE FUNCTION para carregar streak validado automaticamente
      const { data: validationResult, error: validationError } = await supabase.functions.invoke('secure-coin-actions', {
        body: { action: 'can_claim_daily_bonus_brasilia' }
      });

      if (!validationError && validationResult?.success) {
        // Criar objeto streak baseado nos dados validados do backend
        const validatedStreakData = {
          current_streak: validationResult.validatedStreak || 0,
          longest_streak: 0, // Será atualizado na próxima consulta se necessário
          streak_multiplier: validationResult.multiplier || 1.0,
          last_login_date: validationResult.lastClaim ? new Date(validationResult.lastClaim).toISOString().split('T')[0] : null
        };
        setStreak(validatedStreakData);

        // Configurar timer baseado nos dados do backend
        const secondsUntilNext = validationResult.secondsUntilNextClaim || 0;
        const nextClaimTime = validationResult.nextReset ? new Date(validationResult.nextReset) : null;
        
        setTimer({
          canClaim: validationResult.canClaim || false,
          hoursUntilNext: Math.floor(secondsUntilNext / 3600),
          minutesUntilNext: Math.floor((secondsUntilNext % 3600) / 60),
          secondsUntilNext: secondsUntilNext % 60,
          nextClaimTime
        });
      } else {
        // Fallback: carregar diretamente da tabela
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!streakError && streakData) {
          setStreak(streakData);
          const timerData = await calculateNextClaimTime(user.id);
          setTimer(timerData);
        } else if (streakError.code === 'PGRST116') {
          setStreak(null);
          setTimer({
            canClaim: true,
            hoursUntilNext: 0,
            minutesUntilNext: 0,
            secondsUntilNext: 0,
            nextClaimTime: null
          });
        }
      }

      // Carregar configurações do sistema
      const { data: configData, error: configError } = await supabase
        .from('coin_system_config')
        .select('setting_key, setting_value')
        .in('setting_key', ['max_streak_multiplier', 'streak_multiplier_increment']);

      if (!configError && configData) {
        const configMap: any = {};
        configData.forEach(item => {
          configMap[item.setting_key] = item.setting_value;
        });

        setConfig({
          max_multiplier: configMap.max_streak_multiplier || 3.0,
          multiplier_increment: configMap.streak_multiplier_increment || 0.1
        });
      }

    } catch (error) {
      console.error('Erro ao carregar dados de streak:', error);
    } finally {
      setLoading(false);
    }
  }, [user, calculateNextClaimTime]);

  // Atualizar timer a cada segundo usando backend timer
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user?.id) {
        const newTimer = await calculateNextClaimTime(user.id);
        setTimer(newTimer);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.id, calculateNextClaimTime]);

  // Carregar dados inicial
  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  return {
    streak,
    timer,
    loading,
    config,
    calculateNextMultiplier,
    calculateMultiplierPercentage,
    refreshStreak: loadStreakData
  };
};