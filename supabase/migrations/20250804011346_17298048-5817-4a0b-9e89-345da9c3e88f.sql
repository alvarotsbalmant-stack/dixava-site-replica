-- Atualizar funções para usar novo sistema configurável
CREATE OR REPLACE FUNCTION public.process_daily_login_brasilia(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  claim_info RECORD;
  v_streak user_streaks%ROWTYPE;
  v_new_streak INTEGER;
  v_base_amount INTEGER;
  v_max_amount INTEGER;
  v_streak_days INTEGER;
  v_increment_type TEXT;
  v_fixed_increment INTEGER;
  v_final_amount INTEGER;
  period_info RECORD;
  last_period_start TIMESTAMP WITH TIME ZONE;
  last_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Verificar se pode resgatar
  SELECT * INTO claim_info FROM public.can_claim_daily_bonus_brasilia(p_user_id);
  
  IF NOT claim_info.can_claim THEN
    RETURN jsonb_build_object(
      'success', false, 
      'message', 'Bônus já resgatado neste período (20h às 20h)',
      'last_claim', claim_info.last_claim,
      'next_reset', claim_info.next_reset
    );
  END IF;
  
  -- Buscar configurações do daily bonus  
  SELECT (setting_value#>>'{}')::INTEGER INTO v_base_amount
  FROM coin_system_config WHERE setting_key = 'daily_bonus_base_amount';
  
  SELECT (setting_value#>>'{}')::INTEGER INTO v_max_amount
  FROM coin_system_config WHERE setting_key = 'daily_bonus_max_amount';
  
  SELECT (setting_value#>>'{}')::INTEGER INTO v_streak_days
  FROM coin_system_config WHERE setting_key = 'daily_bonus_streak_days';
  
  SELECT (setting_value#>>'{}') INTO v_increment_type
  FROM coin_system_config WHERE setting_key = 'daily_bonus_increment_type';
  
  SELECT (setting_value#>>'{}')::INTEGER INTO v_fixed_increment
  FROM coin_system_config WHERE setting_key = 'daily_bonus_fixed_increment';
  
  -- Valores padrão se configuração não existir
  v_base_amount := COALESCE(v_base_amount, 10);
  v_max_amount := COALESCE(v_max_amount, 100);
  v_streak_days := COALESCE(v_streak_days, 7);
  v_increment_type := COALESCE(v_increment_type, 'calculated');
  v_fixed_increment := COALESCE(v_fixed_increment, 10);
  
  -- Buscar streak atual
  SELECT * INTO v_streak FROM user_streaks WHERE user_id = p_user_id;
  
  -- Calcular período anterior para verificar continuidade
  SELECT * INTO period_info FROM public.get_current_bonus_period_brasilia();
  last_period_start := period_info.period_start - INTERVAL '1 day';
  last_period_end := period_info.period_start;
  
  IF NOT FOUND THEN
    -- Primeiro login
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_login_date, streak_multiplier)
    VALUES (p_user_id, 1, 1, CURRENT_DATE, 1.0);
    v_new_streak := 1;
  ELSE
    -- Verificar se fez login no período anterior
    DECLARE
      had_previous_login BOOLEAN;
    BEGIN
      SELECT EXISTS(
        SELECT 1 FROM daily_actions 
        WHERE user_id = p_user_id 
          AND action = 'daily_login'
          AND last_performed_at >= last_period_start
          AND last_performed_at < last_period_end
      ) INTO had_previous_login;
      
      IF had_previous_login THEN
        -- Continuou o streak
        v_new_streak := (v_streak.current_streak % v_streak_days) + 1;
        -- Se completou um ciclo, reinicia do 1
        IF v_new_streak = 1 AND v_streak.current_streak >= v_streak_days THEN
          v_new_streak := 1;
        END IF;
      ELSE
        -- Quebrou o streak
        v_new_streak := 1;
      END IF;
    END;
    
    UPDATE user_streaks SET
      current_streak = v_new_streak,
      longest_streak = GREATEST(longest_streak, v_new_streak),
      last_login_date = CURRENT_DATE,
      streak_multiplier = 1.0,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Calcular amount baseado no tipo de incremento
  IF v_increment_type = 'fixed' THEN
    v_final_amount := LEAST(v_base_amount + ((v_new_streak - 1) * v_fixed_increment), v_max_amount);
  ELSE
    -- Incremento calculado: distribui a diferença entre base e max ao longo dos dias
    IF v_streak_days > 1 THEN
      v_final_amount := v_base_amount + ROUND(((v_max_amount - v_base_amount) * (v_new_streak - 1)) / (v_streak_days - 1)::NUMERIC);
    ELSE
      v_final_amount := v_base_amount;
    END IF;
  END IF;
  
  -- Garantir que não exceda o máximo
  v_final_amount := LEAST(v_final_amount, v_max_amount);
  
  -- Registrar ação diária
  INSERT INTO daily_actions (user_id, action, action_date, count, last_performed_at)
  VALUES (p_user_id, 'daily_login', CURRENT_DATE, 1, now())
  ON CONFLICT (user_id, action, action_date)
  DO UPDATE SET 
    count = daily_actions.count + 1,
    last_performed_at = now();
  
  -- Criar transação
  INSERT INTO coin_transactions (user_id, amount, type, reason, description, metadata)
  VALUES (p_user_id, v_final_amount, 'earned', 'daily_login', 
          'Daily Bonus', jsonb_build_object('streak_day', v_new_streak, 'total_streak_days', v_streak_days, 'increment_type', v_increment_type));
  
  -- Atualizar saldo
  INSERT INTO uti_coins (user_id, balance, total_earned)
  VALUES (p_user_id, v_final_amount, v_final_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = uti_coins.balance + v_final_amount,
    total_earned = uti_coins.total_earned + v_final_amount,
    updated_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'streak_day', v_new_streak,
    'total_streak_days', v_streak_days,
    'coins_earned', v_final_amount,
    'period_start', claim_info.period_start,
    'period_end', claim_info.period_end,
    'next_reset', claim_info.next_reset
  );
END;
$function$;