-- Atualizar função complete_order_verification para incluir eventos de analytics
CREATE OR REPLACE FUNCTION public.complete_order_verification(p_code text, p_admin_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_order_record public.order_verification_codes%ROWTYPE;
  v_item JSONB;
  v_coin_amount INTEGER := 20; -- UTI coins padrão por compra
  v_session_id TEXT;
  v_user_agent TEXT;
  v_total_amount NUMERIC;
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
  
  -- Marcar como completado
  UPDATE public.order_verification_codes 
  SET 
    status = 'completed',
    completed_at = NOW(),
    completed_by = p_admin_id,
    rewards_processed = true,
    rewards_given = jsonb_build_object('uti_coins', v_coin_amount),
    updated_at = NOW()
  WHERE id = v_order_record.id;
  
  -- Dar UTI coins ao usuário (se estiver logado)
  IF v_order_record.user_id IS NOT NULL THEN
    PERFORM public.earn_coins(
      v_order_record.user_id,
      'purchase_completed',
      v_coin_amount,
      'Compra finalizada - Código: ' || p_code
    );
  END IF;
  
  -- Atualizar estoque dos produtos
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order_record.items)
  LOOP
    UPDATE public.products 
    SET stock = GREATEST(0, stock - (v_item->>'quantity')::INTEGER),
        updated_at = NOW()
    WHERE id = (v_item->>'product_id')::UUID;
  END LOOP;
  
  -- NOVA FUNCIONALIDADE: Criar eventos de analytics
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
  
  -- Criar/atualizar sessão do usuário
  INSERT INTO public.user_sessions (
    session_id, 
    user_id, 
    ip_address, 
    user_agent, 
    started_at, 
    last_activity, 
    status
  ) VALUES (
    v_session_id,
    v_order_record.user_id,
    v_order_record.ip_address,
    v_user_agent,
    v_order_record.created_at,
    NOW(),
    'active'
  )
  ON CONFLICT (session_id) 
  DO UPDATE SET
    last_activity = NOW(),
    status = 'active';
  
  -- Criar eventos de purchase para cada item
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order_record.items)
  LOOP
    INSERT INTO public.customer_events (
      event_type,
      product_id,
      user_id,
      session_id,
      event_data,
      ip_address,
      user_agent,
      created_at
    ) VALUES (
      'purchase',
      (v_item->>'product_id')::UUID,
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
      v_order_record.ip_address,
      v_user_agent,
      NOW()
    );
  END LOOP;
  
  -- Criar evento de whatsapp_click se aplicável (assumindo que chegou via WhatsApp)
  -- Verificar se há indicadores de que veio via WhatsApp nos metadados
  IF (v_order_record.customer_info->>'source' = 'whatsapp') OR
     (v_order_record.browser_info->>'referrer' ILIKE '%whatsapp%') OR
     (v_order_record.browser_info->>'utm_source' = 'whatsapp') THEN
    
    INSERT INTO public.customer_events (
      event_type,
      user_id,
      session_id,
      event_data,
      ip_address,
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
      v_order_record.ip_address,
      v_user_agent,
      v_order_record.created_at -- Usar timestamp original da criação do pedido
    );
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pedido finalizado com sucesso',
    'coins_awarded', v_coin_amount,
    'order_id', v_order_record.id,
    'analytics_events_created', true
  );
END;
$function$;