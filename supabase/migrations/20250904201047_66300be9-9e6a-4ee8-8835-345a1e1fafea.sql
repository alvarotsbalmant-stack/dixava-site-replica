-- Fix complete_order_verification function cashback calculation bug
CREATE OR REPLACE FUNCTION public.complete_order_verification(p_code text, p_admin_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_order_record public.order_verification_codes%ROWTYPE;
  v_item JSONB;
  v_coin_amount INTEGER := 20; -- UTI coins padrão por compra
  v_cashback_amount INTEGER := 0; -- UTI coins de cashback
  v_total_cashback NUMERIC := 0; -- Total em reais de cashback
  v_session_id TEXT;
  v_user_agent TEXT;
  v_total_amount NUMERIC;
  v_product_cashback NUMERIC;
  v_product_id UUID;
  v_item_total NUMERIC;
  v_product_exists BOOLEAN;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Buscar e bloquear código
  SELECT * INTO v_order_record 
  FROM public.order_verification_codes 
  WHERE code = p_code 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código não encontrado');
  END IF;
  
  -- Verificar se já foi processado
  IF v_order_record.status = 'completed' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Pedido já foi finalizado');
  END IF;
  
  -- Verificar se expirou
  IF NOW() > v_order_record.expires_at THEN
    UPDATE public.order_verification_codes 
    SET status = 'expired', updated_at = NOW()
    WHERE id = v_order_record.id;
    
    RETURN jsonb_build_object('success', false, 'message', 'Código expirado');
  END IF;
  
  -- CALCULAR CASHBACK EM UTI COINS - CORREÇÃO DO BUG
  -- Iterar pelos itens do pedido para calcular cashback
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order_record.items)
  LOOP
    -- Extrair informações do item
    v_item_total := (v_item->>'total')::NUMERIC;
    
    -- Verificar se o item tem product_id
    IF v_item ? 'product_id' AND v_item->>'product_id' IS NOT NULL AND v_item->>'product_id' != '' THEN
      v_product_id := (v_item->>'product_id')::UUID;
      
      -- Buscar porcentagem de cashback do produto
      SELECT uti_coins_cashback_percentage, TRUE 
      INTO v_product_cashback, v_product_exists
      FROM public.products 
      WHERE id = v_product_id;
      
      -- Log para debug
      RAISE NOTICE 'Product ID: %, Cashback: %, Item Total: %, Product Exists: %', 
        v_product_id, v_product_cashback, v_item_total, v_product_exists;
      
    ELSE
      -- Tentar buscar por nome do produto se não tiver ID
      v_product_exists := FALSE;
      v_product_cashback := NULL;
      
      IF v_item ? 'product_name' AND v_item->>'product_name' IS NOT NULL THEN
        SELECT uti_coins_cashback_percentage, TRUE 
        INTO v_product_cashback, v_product_exists
        FROM public.products 
        WHERE name = v_item->>'product_name'
        LIMIT 1;
        
        -- Log para debug
        RAISE NOTICE 'Product Name: %, Cashback: %, Item Total: %, Product Exists: %', 
          v_item->>'product_name', v_product_cashback, v_item_total, v_product_exists;
      END IF;
    END IF;
    
    -- Se o produto existe e tem cashback configurado
    IF v_product_exists AND v_product_cashback IS NOT NULL AND v_product_cashback > 0 THEN
      -- Calcular cashback em reais: total do item * porcentagem
      v_total_cashback := v_total_cashback + (v_item_total * v_product_cashback / 100);
      
      -- Log para debug
      RAISE NOTICE 'Cashback calculado para item: % reais (total acumulado: %)', 
        (v_item_total * v_product_cashback / 100), v_total_cashback;
    END IF;
  END LOOP;
  
  -- Converter cashback de reais para UTI Coins (1 real = 100 UTI Coins)
  v_cashback_amount := ROUND(v_total_cashback * 100);
  
  -- Total de UTI Coins = padrão + cashback
  v_coin_amount := v_coin_amount + v_cashback_amount;
  
  -- Log final para debug
  RAISE NOTICE 'CASHBACK FINAL - Reais: %, UTI Coins: %, Total Coins: %', 
    v_total_cashback, v_cashback_amount, v_coin_amount;
  
  -- Marcar como completado
  UPDATE public.order_verification_codes 
  SET 
    status = 'completed',
    completed_at = NOW(),
    completed_by = p_admin_id,
    rewards_processed = true,
    rewards_given = jsonb_build_object(
      'uti_coins', v_coin_amount,
      'default_coins', 20,
      'cashback_coins', v_cashback_amount,
      'cashback_reais', v_total_cashback
    ),
    updated_at = NOW()
  WHERE id = v_order_record.id;
  
  -- Dar UTI coins ao usuário (se estiver logado)
  IF v_order_record.user_id IS NOT NULL THEN
    -- Dar coins padrão de compra
    PERFORM public.earn_coins(
      v_order_record.user_id,
      'purchase_completed',
      20,
      'Compra finalizada - Código: ' || p_code
    );
    
    -- Dar cashback em UTI Coins se houver
    IF v_cashback_amount > 0 THEN
      PERFORM public.earn_coins(
        v_order_record.user_id,
        'cashback_purchase',
        v_cashback_amount,
        format('Cashback da compra (%.2f%% = R$ %.2f) - Código: %s', 
               v_product_cashback, 
               v_total_cashback, 
               p_code),
        jsonb_build_object(
          'cashback_reais', v_total_cashback,
          'cashback_coins', v_cashback_amount,
          'order_code', p_code
        )
      );
    END IF;
  END IF;
  
  -- Continue with the rest of the function...
  -- Atualizar estoque dos produtos
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order_record.items)
  LOOP
    IF v_item ? 'product_id' AND v_item->>'product_id' IS NOT NULL AND v_item->>'product_id' != '' THEN
      UPDATE public.products 
      SET stock = GREATEST(0, stock - (v_item->>'quantity')::INTEGER),
          updated_at = NOW()
      WHERE id = (v_item->>'product_id')::UUID;
    END IF;
  END LOOP;
  
  -- CRIAR EVENTOS DE ANALYTICS
  -- Gerar session_id único para este pedido se não existir
  v_session_id := COALESCE(
    v_order_record.browser_info->>'session_id', 
    'order_' || v_order_record.id::text
  );
  
  -- Obter user_agent dos metadados
  v_user_agent := COALESCE(
    v_order_record.user_agent,
    v_order_record.browser_info->>'userAgent',
    'Unknown'
  );
  
  -- Criar/atualizar sessão do usuário (usando apenas colunas existentes)
  INSERT INTO public.user_sessions (
    session_id, 
    user_id, 
    started_at,
    duration_seconds,
    page_views,
    events_count,
    device_type,
    browser,
    converted,
    purchase_value
  ) VALUES (
    v_session_id,
    v_order_record.user_id,
    v_order_record.created_at,
    EXTRACT(EPOCH FROM (NOW() - v_order_record.created_at))::INTEGER,
    1,
    1,
    COALESCE(v_order_record.browser_info->>'device_type', 'unknown'),
    COALESCE(v_order_record.browser_info->>'browser', v_user_agent),
    true,
    v_order_record.total_amount
  )
  ON CONFLICT (session_id) 
  DO UPDATE SET
    duration_seconds = EXTRACT(EPOCH FROM (NOW() - user_sessions.started_at))::INTEGER,
    events_count = COALESCE(user_sessions.events_count, 0) + 1,
    converted = true,
    purchase_value = COALESCE(user_sessions.purchase_value, 0) + v_order_record.total_amount;
  
  -- Criar eventos de purchase para cada item
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order_record.items)
  LOOP
    INSERT INTO public.customer_events (
      event_type,
      product_id,
      user_id,
      session_id,
      event_data,
      user_agent,
      created_at
    ) VALUES (
      'purchase',
      CASE WHEN v_item ? 'product_id' AND v_item->>'product_id' IS NOT NULL 
           THEN (v_item->>'product_id')::UUID 
           ELSE NULL END,
      v_order_record.user_id,
      v_session_id,
      jsonb_build_object(
        'product_name', v_item->>'product_name',
        'quantity', (v_item->>'quantity')::INTEGER,
        'price', (v_item->>'price')::NUMERIC,
        'size', v_item->>'size',
        'color', v_item->>'color',
        'value', (v_item->>'total')::NUMERIC,
        'order_code', p_code,
        'verified_by_admin', p_admin_id
      ),
      v_user_agent,
      NOW()
    );
  END LOOP;
  
  -- Criar evento de whatsapp_click se aplicável
  IF (v_order_record.customer_info->>'source' = 'whatsapp') OR
     (v_order_record.browser_info->>'referrer' ILIKE '%whatsapp%') OR
     (v_order_record.browser_info->>'utm_source' = 'whatsapp') THEN
    
    INSERT INTO public.customer_events (
      event_type,
      user_id,
      session_id,
      event_data,
      user_agent,
      created_at
    ) VALUES (
      'whatsapp_click',
      v_order_record.user_id,
      v_session_id,
      jsonb_build_object(
        'source', 'order_completion',
        'order_code', p_code,
        'total_amount', v_order_record.total_amount
      ),
      v_user_agent,
      v_order_record.created_at
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pedido finalizado com sucesso',
    'coins_awarded', v_coin_amount,
    'default_coins', 20,
    'cashback_coins', v_cashback_amount,
    'cashback_reais', v_total_cashback,
    'order_id', v_order_record.id,
    'analytics_events_created', true,
    'revenue_added', v_order_record.total_amount
  );
END;
$function$;