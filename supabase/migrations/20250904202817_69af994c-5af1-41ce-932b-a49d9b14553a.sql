-- Verificar e criar função earn_coins se não existir
DO $$
BEGIN
  -- Verificar se a função earn_coins existe
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'earn_coins' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
    -- Criar função earn_coins se não existir
    RAISE NOTICE 'Função earn_coins não encontrada, criando...';
    
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.earn_coins(
      p_user_id UUID,
      p_action TEXT,
      p_amount INTEGER DEFAULT NULL,
      p_description TEXT DEFAULT NULL,
      p_metadata JSONB DEFAULT ''{}'
    ) RETURNS JSONB
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO ''public''
    AS $function$
    DECLARE
      v_rule coin_rules%ROWTYPE;
      v_final_amount INTEGER;
      v_daily_count INTEGER;
      v_last_action TIMESTAMP WITH TIME ZONE;
      v_can_earn BOOLEAN := true;
      v_reason TEXT;
      v_user_coins uti_coins%ROWTYPE;
      v_streak user_streaks%ROWTYPE;
      v_multiplier NUMERIC := 1.0;
      v_is_flagged BOOLEAN;
    BEGIN
      -- Verificar se usuário está flagged por atividade suspeita
      SELECT public.is_user_flagged(p_user_id) INTO v_is_flagged;
      
      IF v_is_flagged THEN
        RETURN jsonb_build_object(''success'', false, ''message'', ''Conta temporariamente restrita por atividade suspeita'');
      END IF;

      -- Buscar regra para a ação
      SELECT * INTO v_rule FROM coin_rules WHERE action = p_action AND is_active = true;
      
      IF NOT FOUND THEN
        RETURN jsonb_build_object(''success'', false, ''message'', ''Ação não encontrada ou inativa'');
      END IF;
      
      -- Usar amount da regra se não foi especificado
      v_final_amount := COALESCE(p_amount, v_rule.amount);
      
      -- Verificar limite diário se existir
      IF v_rule.max_per_day IS NOT NULL THEN
        SELECT count, last_performed_at INTO v_daily_count, v_last_action
        FROM daily_actions 
        WHERE user_id = p_user_id 
          AND action = p_action 
          AND action_date = CURRENT_DATE;
        
        IF v_daily_count >= v_rule.max_per_day THEN
          RETURN jsonb_build_object(''success'', false, ''message'', ''Limite diário atingido para esta ação'');
        END IF;
      END IF;
      
      -- Verificar cooldown
      IF v_rule.cooldown_minutes > 0 AND v_last_action IS NOT NULL THEN
        IF v_last_action + (v_rule.cooldown_minutes || '' minutes'')::INTERVAL > now() THEN
          RETURN jsonb_build_object(''success'', false, ''message'', ''Aguarde antes de realizar esta ação novamente'');
        END IF;
      END IF;
      
      -- Aplicar multiplicador de streak para login diário
      IF p_action = ''daily_login'' THEN
        SELECT * INTO v_streak FROM user_streaks WHERE user_id = p_user_id;
        IF FOUND THEN
          v_multiplier := v_streak.streak_multiplier;
          v_final_amount := ROUND(v_final_amount * v_multiplier);
        END IF;
      END IF;
      
      -- Inserir ou atualizar ação diária
      INSERT INTO daily_actions (user_id, action, action_date, count, last_performed_at)
      VALUES (p_user_id, p_action, CURRENT_DATE, 1, now())
      ON CONFLICT (user_id, action, action_date)
      DO UPDATE SET 
        count = daily_actions.count + 1,
        last_performed_at = now();
      
      -- Inserir transação
      INSERT INTO coin_transactions (user_id, amount, type, reason, description, metadata)
      VALUES (p_user_id, v_final_amount, ''earned'', p_action, 
              COALESCE(p_description, v_rule.description), p_metadata);
      
      -- Atualizar ou inserir saldo do usuário
      INSERT INTO uti_coins (user_id, balance, total_earned)
      VALUES (p_user_id, v_final_amount, v_final_amount)
      ON CONFLICT (user_id)
      DO UPDATE SET
        balance = uti_coins.balance + v_final_amount,
        total_earned = uti_coins.total_earned + v_final_amount,
        updated_at = now();
      
      RETURN jsonb_build_object(
        ''success'', true, 
        ''amount'', v_final_amount,
        ''multiplier'', v_multiplier,
        ''message'', ''Moedas adicionadas com sucesso!''
      );
    END;
    $function$';
    
  ELSE
    RAISE NOTICE 'Função earn_coins já existe';
  END IF;
END
$$;

-- Testar a função earn_coins diretamente
DO $$
DECLARE
  test_result JSONB;
BEGIN
  -- Testar com um usuário que sabemos que existe
  SELECT public.earn_coins(
    '2facfeca-849e-407f-b4e6-6a5f08c83f42'::UUID,
    'purchase_completed',
    20,
    'Teste de compra finalizada - admin',
    '{"test": true}'::JSONB
  ) INTO test_result;
  
  RAISE NOTICE 'Resultado teste earn_coins: %', test_result;
END
$$;