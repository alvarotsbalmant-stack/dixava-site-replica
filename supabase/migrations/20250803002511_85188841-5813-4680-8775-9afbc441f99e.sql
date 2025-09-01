-- Função para calcular o período de bonus atual baseado em 20h Brasília
CREATE OR REPLACE FUNCTION public.get_current_bonus_period_brasilia()
RETURNS TABLE(
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  can_claim BOOLEAN,
  next_reset TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  brasilia_now TIMESTAMP WITH TIME ZONE;
  period_start_calc TIMESTAMP WITH TIME ZONE;
  period_end_calc TIMESTAMP WITH TIME ZONE;
  next_reset_calc TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Converter para horário de Brasília (UTC-3)
  brasilia_now := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Se ainda não passou das 20h hoje, o período atual começou ontem às 20h
  IF EXTRACT(HOUR FROM brasilia_now) < 20 THEN
    period_start_calc := (DATE(brasilia_now) - 1) + TIME '20:00:00';
    period_end_calc := DATE(brasilia_now) + TIME '20:00:00';
    next_reset_calc := DATE(brasilia_now) + TIME '20:00:00';
  ELSE
    -- Se já passou das 20h hoje, o período atual começou hoje às 20h
    period_start_calc := DATE(brasilia_now) + TIME '20:00:00';
    period_end_calc := (DATE(brasilia_now) + 1) + TIME '20:00:00';
    next_reset_calc := (DATE(brasilia_now) + 1) + TIME '20:00:00';
  END IF;
  
  -- Converter de volta para UTC para armazenamento
  period_start_calc := period_start_calc AT TIME ZONE 'America/Sao_Paulo';
  period_end_calc := period_end_calc AT TIME ZONE 'America/Sao_Paulo';
  next_reset_calc := next_reset_calc AT TIME ZONE 'America/Sao_Paulo';
  
  RETURN QUERY SELECT 
    period_start_calc,
    period_end_calc,
    true::BOOLEAN as can_claim, -- Será verificado depois se já resgatou
    next_reset_calc;
END;
$function$;

-- Função para verificar se usuário pode resgatar bonus no período atual
CREATE OR REPLACE FUNCTION public.can_claim_daily_bonus_brasilia(p_user_id UUID)
RETURNS TABLE(
  can_claim BOOLEAN,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  next_reset TIMESTAMP WITH TIME ZONE,
  last_claim TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  period_info RECORD;
  last_claim_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Buscar período atual
  SELECT * INTO period_info FROM public.get_current_bonus_period_brasilia();
  
  -- Verificar último resgate do usuário
  SELECT last_performed_at INTO last_claim_time
  FROM daily_actions 
  WHERE user_id = p_user_id 
    AND action = 'daily_login'
    AND last_performed_at >= period_info.period_start
    AND last_performed_at < period_info.period_end
  ORDER BY last_performed_at DESC
  LIMIT 1;
  
  -- Retornar resultado
  RETURN QUERY SELECT 
    (last_claim_time IS NULL)::BOOLEAN as can_claim,
    period_info.period_start,
    period_info.period_end,
    period_info.next_reset,
    last_claim_time;
END;
$function$;

-- Função para processar login diário com horário de Brasília
CREATE OR REPLACE FUNCTION public.process_daily_login_brasilia(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  claim_info RECORD;
  v_streak user_streaks%ROWTYPE;
  v_new_streak INTEGER;
  v_new_multiplier NUMERIC;
  v_max_multiplier NUMERIC;
  v_increment NUMERIC;
  v_coins_result JSONB;
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
  
  -- Buscar configurações
  SELECT setting_value::NUMERIC INTO v_max_multiplier 
  FROM coin_system_config WHERE setting_key = 'max_streak_multiplier';
  
  SELECT setting_value::NUMERIC INTO v_increment 
  FROM coin_system_config WHERE setting_key = 'streak_multiplier_increment';
  
  v_max_multiplier := COALESCE(v_max_multiplier, 3.0);
  v_increment := COALESCE(v_increment, 0.1);
  
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
    v_new_multiplier := 1.0;
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
        v_new_streak := v_streak.current_streak + 1;
        v_new_multiplier := LEAST(1.0 + (v_new_streak - 1) * v_increment, v_max_multiplier);
      ELSE
        -- Quebrou o streak
        v_new_streak := 1;
        v_new_multiplier := 1.0;
      END IF;
    END;
    
    UPDATE user_streaks SET
      current_streak = v_new_streak,
      longest_streak = GREATEST(longest_streak, v_new_streak),
      last_login_date = CURRENT_DATE,
      streak_multiplier = v_new_multiplier,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Registrar ação diária
  INSERT INTO daily_actions (user_id, action, action_date, count, last_performed_at)
  VALUES (p_user_id, 'daily_login', CURRENT_DATE, 1, now())
  ON CONFLICT (user_id, action, action_date)
  DO UPDATE SET 
    count = daily_actions.count + 1,
    last_performed_at = now();
  
  -- Ganhar moedas pelo login diário
  SELECT public.earn_coins(p_user_id, 'daily_login') INTO v_coins_result;
  
  RETURN jsonb_build_object(
    'success', true,
    'streak', v_new_streak,
    'multiplier', v_new_multiplier,
    'coins_earned', (v_coins_result->>'amount')::INTEGER,
    'period_start', claim_info.period_start,
    'period_end', claim_info.period_end,
    'next_reset', claim_info.next_reset
  );
END;
$function$;