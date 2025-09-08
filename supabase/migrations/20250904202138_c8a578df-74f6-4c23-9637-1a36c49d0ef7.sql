-- Corrigir erro no format() da função complete_order_verification
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
        'Cashback da compra (' || v_product_cashback::TEXT || '% = R$ ' || v_total_cashback::TEXT || ') - Código: ' || p_code,
        jsonb_build_object(
          'cashback_reais', v_total_cashback,
          'cashback_coins', v_cashback_amount,
          'order_code', p_code
        )
      );
    END IF;
  END IF;
  
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
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pedido finalizado com sucesso',
    'coins_awarded', v_coin_amount,
    'default_coins', 20,
    'cashback_coins', v_cashback_amount,
    'cashback_reais', v_total_cashback,
    'order_id', v_order_record.id
  );
END;
$function$;