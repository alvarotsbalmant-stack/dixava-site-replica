-- Corrigir contagem dupla de WhatsApp clicks removendo evento geral duplicado
DROP FUNCTION IF EXISTS public.create_order_verification_code(uuid, jsonb, numeric, jsonb, jsonb, jsonb, inet, text, jsonb);

CREATE OR REPLACE FUNCTION public.create_order_verification_code(
  p_user_id uuid, 
  p_items jsonb, 
  p_total_amount numeric, 
  p_customer_info jsonb, 
  p_shipping_info jsonb DEFAULT NULL::jsonb, 
  p_discount_info jsonb DEFAULT NULL::jsonb, 
  p_ip_address inet DEFAULT NULL::inet, 
  p_user_agent text DEFAULT NULL::text, 
  p_browser_info jsonb DEFAULT NULL::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_code TEXT;
  v_code_id UUID;
  v_session_id TEXT;
  v_user_agent TEXT;
  v_unique_products UUID[];
  v_product_id UUID;
BEGIN
  -- Gerar código único
  v_code := public.generate_order_code();
  
  -- Inserir registro
  INSERT INTO public.order_verification_codes (
    code, user_id, items, total_amount, customer_info, 
    shipping_info, discount_info, ip_address, user_agent, browser_info
  ) VALUES (
    v_code, p_user_id, p_items, p_total_amount, p_customer_info,
    p_shipping_info, p_discount_info, p_ip_address, p_user_agent, p_browser_info
  ) RETURNING id INTO v_code_id;
  
  -- CRIAR EVENTOS DE ANALYTICS PARA WHATSAPP
  -- Gerar session_id único para este pedido
  v_session_id := COALESCE(
    p_browser_info->>'session_id', 
    'whatsapp_order_' || v_code_id::text
  );
  
  -- Obter user_agent dos metadados
  v_user_agent := COALESCE(
    p_user_agent,
    p_browser_info->>'userAgent',
    p_customer_info->>'browser',
    'WhatsApp Order'
  );
  
  -- Extrair produtos únicos do pedido (sem considerar quantidade)
  SELECT ARRAY_AGG(DISTINCT (item_value->>'product_id')::UUID)
  INTO v_unique_products
  FROM jsonb_array_elements(p_items) AS item_value;
  
  -- Criar evento de whatsapp_click APENAS para cada produto único (removendo evento geral duplicado)
  FOREACH v_product_id IN ARRAY v_unique_products
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
      'whatsapp_click',
      v_product_id,
      p_user_id,
      v_session_id,
      jsonb_build_object(
        'source', 'order_code_generation',
        'order_code', v_code,
        'total_amount', p_total_amount,
        'unique_products_count', array_length(v_unique_products, 1),
        'context', 'cart_checkout',
        'product_name', (
          SELECT item_value->>'product_name'
          FROM jsonb_array_elements(p_items) AS item_value
          WHERE (item_value->>'product_id')::UUID = v_product_id
          LIMIT 1
        )
      ),
      v_user_agent,
      NOW()
    );
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'code', v_code,
    'code_id', v_code_id,
    'expires_at', NOW() + INTERVAL '24 hours',
    'whatsapp_events_created', array_length(v_unique_products, 1)
  );
END;
$function$;