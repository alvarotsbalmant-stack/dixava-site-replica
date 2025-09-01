import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DailyBonusTimer {
  canClaim: boolean;
  hoursUntilNext: number;
  minutesUntilNext: number;
  secondsUntilNext: number;
  nextReset: Date | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  lastClaim: Date | null;
  alreadyClaimed?: boolean;
}

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  streak_multiplier: number;
  last_login_date: string | null;
}

interface StreakConfig {
  max_multiplier: number;
  multiplier_increment: number;
}

export const useDailyBonusBrasilia = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState<DailyBonusTimer>({
    canClaim: true,
    hoursUntilNext: 0,
    minutesUntilNext: 0,
    secondsUntilNext: 0,
    nextReset: null,
    periodStart: null,
    periodEnd: null,
    lastClaim: null
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

  // Buscar timer do backend (Brasília)
  const fetchBrasiliaTimer = useCallback(async (): Promise<DailyBonusTimer> => {
    if (!user?.id) {
      return {
        canClaim: false,
        hoursUntilNext: 0,
        minutesUntilNext: 0,
        secondsUntilNext: 0,
        nextReset: null,
        periodStart: null,
        periodEnd: null,
        lastClaim: null
      };
    }

    try {
      const { data, error } = await supabase.functions.invoke('secure-coin-actions', {
        body: { action: 'get_daily_timer' }
      });

      if (error) {
        console.error('Erro ao buscar timer de Brasília:', error);
        return {
          canClaim: true,
          hoursUntilNext: 0,
          minutesUntilNext: 0,
          secondsUntilNext: 0,
          nextReset: null,
          periodStart: null,
          periodEnd: null,
          lastClaim: null
        };
      }

      if (!data.success) {
        console.error('Timer response failed:', data);
        return {
          canClaim: true,
          hoursUntilNext: 0,
          minutesUntilNext: 0,
          secondsUntilNext: 0,
          nextReset: null,
          periodStart: null,
          periodEnd: null,
          lastClaim: null
        };
      }

      const nextReset = data.nextReset ? new Date(data.nextReset) : null;
      const periodStart = data.periodStart ? new Date(data.periodStart) : null;
      const periodEnd = data.periodEnd ? new Date(data.periodEnd) : null;
      const lastClaim = data.lastClaim ? new Date(data.lastClaim) : null;

      // Use server-calculated seconds to avoid client/server time discrepancies
      const totalSecondsUntilNext = data.secondsUntilNextClaim || 0;
      
      const hoursUntilNext = Math.floor(totalSecondsUntilNext / 3600);
      const minutesUntilNext = Math.floor((totalSecondsUntilNext % 3600) / 60);
      const secondsUntilNext = totalSecondsUntilNext % 60;

      return {
        canClaim: data.canClaim,
        hoursUntilNext,
        minutesUntilNext,
        secondsUntilNext,
        nextReset,
        periodStart,
        periodEnd,
        lastClaim,
        alreadyClaimed: data.alreadyClaimed || false
      };
    } catch (error) {
      console.error('Erro ao buscar timer de Brasília:', error);
      return {
        canClaim: true,
        hoursUntilNext: 0,
        minutesUntilNext: 0,
        secondsUntilNext: 0,
        nextReset: null,
        periodStart: null,
        periodEnd: null,
        lastClaim: null
      };
    }
  }, [user?.id]);

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
      } else {
        // Fallback: carregar diretamente da tabela
        const { data: streakData, error: streakError } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!streakError && streakData) {
          setStreak(streakData);
        } else if (streakError.code === 'PGRST116') {
          setStreak(null);
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

      // Carregar timer inicial
      const initialTimer = await fetchBrasiliaTimer();
      setTimer(initialTimer);

    } catch (error) {
      console.error('Erro ao carregar dados de streak:', error);
    } finally {
      setLoading(false);
    }
  }, [user, fetchBrasiliaTimer]);

  // Atualizar timer a cada segundo usando apenas dados do servidor inicial
  useEffect(() => {
    if (!user?.id || !timer.nextReset) return;

    const interval = setInterval(() => {
      const now = new Date();
      const nextResetTime = new Date(timer.nextReset);
      const timeDiff = nextResetTime.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        // Timer expirou, buscar dados atualizados do backend
        fetchBrasiliaTimer().then(newTimer => setTimer(newTimer));
        return;
      }
      
      // Usar apenas cálculo baseado no timestamp do servidor
      const totalSecondsUntilNext = Math.floor(timeDiff / 1000);
      const hoursUntilNext = Math.floor(totalSecondsUntilNext / 3600);
      const minutesUntilNext = Math.floor((totalSecondsUntilNext % 3600) / 60);
      const secondsUntilNext = totalSecondsUntilNext % 60;
      
      setTimer(prevTimer => ({
        ...prevTimer,
        hoursUntilNext,
        minutesUntilNext,
        secondsUntilNext
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.id, timer.nextReset, fetchBrasiliaTimer]);

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