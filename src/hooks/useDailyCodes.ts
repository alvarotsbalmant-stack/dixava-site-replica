import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DailyCode {
  code: string;
  created_at: string;
  claimable_until: string;
  valid_until: string;
  can_claim: boolean;
  is_valid: boolean;
  hours_until_claim_expires: number;
  hours_until_validity_expires: number;
}

interface UserCode {
  code: string;
  added_at: string;
  expires_at: string;
  streak_position: number;
  hours_until_expiry: number;
}

interface StreakStatus {
  has_active_streak: boolean;
  streak_count: number;
  valid_codes_count: number;
  codes: UserCode[];
}

interface ClaimResult {
  success: boolean;
  message: string;
  data?: {
    streak_position: number;
    coins_earned: number;
    multiplier: number;
  };
}

export const useDailyCodes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentCode, setCurrentCode] = useState<DailyCode | null>(null);
  const [streakStatus, setStreakStatus] = useState<StreakStatus | null>(null);
  const [claiming, setClaiming] = useState(false);

  // Buscar código atual
  const fetchCurrentCode = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('daily-codes', {
        body: { action: 'get_current_code' }
      });

      if (error) {
        console.error('[DAILY_CODES] Error fetching current code:', error);
        return;
      }

      if (data.success && data.data) {
        setCurrentCode(data.data);
      } else {
        setCurrentCode(null);
      }
    } catch (error) {
      console.error('[DAILY_CODES] Error:', error);
    }
  }, [user]);

  // Buscar status da streak
  const fetchStreakStatus = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('daily-codes', {
        body: { action: 'get_streak_status' }
      });

      if (error) {
        console.error('[DAILY_CODES] Error fetching streak:', error);
        return;
      }

      if (data.success) {
        setStreakStatus(data.data);
      }
    } catch (error) {
      console.error('[DAILY_CODES] Error:', error);
    }
  }, [user]);

  // Resgatar código
  const claimCode = useCallback(async (code: string): Promise<ClaimResult> => {
    if (!user || claiming) {
      return { success: false, message: 'Operação em andamento' };
    }

    setClaiming(true);

    try {
      const { data, error } = await supabase.functions.invoke('daily-codes', {
        body: { action: 'claim_code', code }
      });

      if (error) {
        console.error('[DAILY_CODES] Error claiming code:', error);
        return { success: false, message: 'Erro ao resgatar código' };
      }

      if (data.success) {
        // Atualizar dados após sucesso
        await Promise.all([
          fetchCurrentCode(),
          fetchStreakStatus()
        ]);
      }

      return data;
    } catch (error) {
      console.error('[DAILY_CODES] Error:', error);
      return { success: false, message: 'Erro interno' };
    } finally {
      setClaiming(false);
    }
  }, [user, claiming, fetchCurrentCode, fetchStreakStatus]);

  // Resgatar código automaticamente (Daily Bonus)
  const claimDailyBonus = useCallback(async (): Promise<ClaimResult> => {
    if (!user || claiming) {
      return { success: false, message: 'Operação em andamento' };
    }

    setClaiming(true);

    try {
      const { data, error } = await supabase.functions.invoke('daily-codes', {
        body: { action: 'claim_daily_bonus' }
      });

      if (error) {
        console.error('[DAILY_CODES] Error claiming daily bonus:', error);
        return { success: false, message: 'Erro ao resgatar recompensa diária' };
      }

      if (data.success) {
        // Atualizar dados após sucesso
        await Promise.all([
          fetchCurrentCode(),
          fetchStreakStatus()
        ]);
      }

      return data;
    } catch (error) {
      console.error('[DAILY_CODES] Error:', error);
      return { success: false, message: 'Erro interno' };
    } finally {
      setClaiming(false);
    }
  }, [user, claiming, fetchCurrentCode, fetchStreakStatus]);

  // Carregar dados iniciais
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      await Promise.all([
        fetchCurrentCode(),
        fetchStreakStatus()
      ]);
    } finally {
      setLoading(false);
    }
  }, [user, fetchCurrentCode, fetchStreakStatus]);

  // Calcular timer até próximo código (lógica melhorada)
  const getTimeUntilNextCode = useCallback(() => {
    const now = new Date();
    const today8PM = new Date();
    today8PM.setHours(20, 0, 0, 0);
    
    let targetTime: Date;
    
    // Antes das 20h: sempre mostra tempo até hoje às 20h
    if (now.getHours() < 20) {
      targetTime = today8PM;
    } else {
      // Depois das 20h: mostra tempo até amanhã às 20h
      // (o timer só aparece quando já resgatou, então faz sentido mostrar próximo dia)
      const tomorrow8PM = new Date();
      tomorrow8PM.setDate(tomorrow8PM.getDate() + 1);
      tomorrow8PM.setHours(20, 0, 0, 0);
      targetTime = tomorrow8PM;
    }
    
    const timeDiff = targetTime.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return {
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      seconds: Math.max(0, seconds),
      totalSeconds: Math.max(0, Math.floor(timeDiff / 1000))
    };
  }, []);

  // Carregar dados quando usuário logar
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Atualizar dados a cada 30 segundos
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, loadData]);

  return {
    loading,
    currentCode,
    streakStatus,
    claiming,
    claimCode,
    claimDailyBonus,
    refreshData: loadData,
    getTimeUntilNextCode
  };
};