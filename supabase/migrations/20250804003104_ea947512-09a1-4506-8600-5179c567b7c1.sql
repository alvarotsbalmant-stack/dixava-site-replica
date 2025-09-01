-- Configuração para modo de teste do sistema de bônus diário
-- Adicionar configurações de teste para o sistema de bônus

INSERT INTO coin_system_config (setting_key, setting_value, description)
VALUES 
  ('test_mode_enabled', 'false', 'Enable test mode for daily bonus (60 seconds cooldown)'),
  ('test_cooldown_seconds', '60', 'Cooldown period in seconds for test mode'),
  ('production_reset_hour', '20', 'Hour of day (24h format) for production bonus reset (Brasilia time)')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- Função para verificar status do bônus no modo de teste (60 segundos)
CREATE OR REPLACE FUNCTION public.can_claim_daily_bonus_test(p_user_id uuid)
RETURNS TABLE(can_claim boolean, period_start timestamp with time zone, period_end timestamp with time zone, next_reset timestamp with time zone, last_claim timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  test_cooldown_seconds INTEGER;
  last_claim_time TIMESTAMP WITH TIME ZONE;
  next_reset_calc TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Buscar configuração de cooldown de teste
  SELECT (setting_value)::INTEGER INTO test_cooldown_seconds
  FROM coin_system_config 
  WHERE setting_key = 'test_cooldown_seconds';
  
  test_cooldown_seconds := COALESCE(test_cooldown_seconds, 60);
  
  -- Verificar último resgate do usuário
  SELECT last_performed_at INTO last_claim_time
  FROM daily_actions 
  WHERE user_id = p_user_id 
    AND action = 'daily_login'
  ORDER BY last_performed_at DESC
  LIMIT 1;
  
  -- Calcular próximo reset (último claim + cooldown)
  IF last_claim_time IS NOT NULL THEN
    next_reset_calc := last_claim_time + (test_cooldown_seconds || ' seconds')::INTERVAL;
  ELSE
    next_reset_calc := NOW(); -- Se nunca reclamou, pode reclamar agora
  END IF;
  
  -- Retornar resultado
  RETURN QUERY SELECT 
    (last_claim_time IS NULL OR NOW() >= next_reset_calc)::BOOLEAN as can_claim,
    COALESCE(last_claim_time, NOW() - INTERVAL '1 hour') as period_start,
    next_reset_calc as period_end,
    next_reset_calc as next_reset,
    last_claim_time;
END;
$function$;

-- Função para processar login diário no modo de teste
CREATE OR REPLACE FUNCTION public.process_daily_login_test(p_user_id uuid)
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
  test_cooldown_seconds INTEGER;
BEGIN
  -- Verificar se pode resgatar no modo de teste
  SELECT * INTO claim_info FROM public.can_claim_daily_bonus_test(p_user_id);
  
  IF NOT claim_info.can_claim THEN
    SELECT (setting_value)::INTEGER INTO test_cooldown_seconds
    FROM coin_system_config WHERE setting_key = 'test_cooldown_seconds';
    
    RETURN jsonb_build_object(
      'success', false, 
      'message', format('Aguarde %s segundos antes do próximo resgate (modo teste)', COALESCE(test_cooldown_seconds, 60)),
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
  
  IF NOT FOUND THEN
    -- Primeiro login
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_login_date, streak_multiplier)
    VALUES (p_user_id, 1, 1, CURRENT_DATE, 1.0);
    v_new_streak := 1;
    v_new_multiplier := 1.0;
  ELSE
    -- No modo de teste, sempre incrementa streak
    v_new_streak := v_streak.current_streak + 1;
    v_new_multiplier := LEAST(1.0 + (v_new_streak - 1) * v_increment, v_max_multiplier);
    
    UPDATE user_streaks SET
      current_streak = v_new_streak,
      longest_streak = GREATEST(longest_streak, v_new_streak),
      last_login_date = CURRENT_DATE,
      streak_multiplier = v_new_multiplier,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Registrar ação diária com timestamp atual
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
    'next_reset', claim_info.next_reset,
    'test_mode', true
  );
END;
$function$;