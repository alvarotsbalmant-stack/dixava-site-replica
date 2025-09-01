-- Corrigir função process_daily_login_test para não usar earn_coins que tem limite diário
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
  v_base_amount INTEGER;
  v_final_amount INTEGER;
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
  
  SELECT (setting_value)::INTEGER INTO v_base_amount
  FROM coin_system_config WHERE setting_key = 'base_bonus_amount';
  
  v_max_multiplier := COALESCE(v_max_multiplier, 3.0);
  v_increment := COALESCE(v_increment, 0.1);
  v_base_amount := COALESCE(v_base_amount, 10);
  
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
  
  -- Calcular amount final com multiplicador
  v_final_amount := ROUND(v_base_amount * v_new_multiplier);
  
  -- Registrar ação diária com timestamp atual (sem limit checks no modo teste)
  INSERT INTO daily_actions (user_id, action, action_date, count, last_performed_at)
  VALUES (p_user_id, 'daily_login', CURRENT_DATE, 1, now())
  ON CONFLICT (user_id, action, action_date)
  DO UPDATE SET 
    count = daily_actions.count + 1,
    last_performed_at = now();
  
  -- Criar transação diretamente (bypass earn_coins limits)
  INSERT INTO coin_transactions (user_id, amount, type, reason, description, metadata)
  VALUES (p_user_id, v_final_amount, 'earned', 'daily_login', 
          'Login diário (modo teste)', jsonb_build_object('test_mode', true, 'streak', v_new_streak, 'multiplier', v_new_multiplier));
  
  -- Atualizar ou inserir saldo do usuário
  INSERT INTO uti_coins (user_id, balance, total_earned)
  VALUES (p_user_id, v_final_amount, v_final_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = uti_coins.balance + v_final_amount,
    total_earned = uti_coins.total_earned + v_final_amount,
    updated_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'streak', v_new_streak,
    'multiplier', v_new_multiplier,
    'coins_earned', v_final_amount,
    'period_start', claim_info.period_start,
    'period_end', claim_info.period_end,
    'next_reset', claim_info.next_reset,
    'test_mode', true
  );
END;
$function$;