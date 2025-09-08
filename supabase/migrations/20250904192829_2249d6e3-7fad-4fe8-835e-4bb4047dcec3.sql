-- Update verify_order_code function to include UTI Coins balance
CREATE OR REPLACE FUNCTION public.verify_order_code(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_order_record public.order_verification_codes%ROWTYPE;
  v_user_profile user_profiles%ROWTYPE;
  v_uti_coins_balance INTEGER := 0;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Buscar código
  SELECT * INTO v_order_record 
  FROM public.order_verification_codes 
  WHERE code = p_code;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código não encontrado');
  END IF;
  
  -- Buscar dados do usuário
  SELECT * INTO v_user_profile
  FROM public.user_profiles
  WHERE id = v_order_record.user_id;
  
  -- Buscar saldo de UTI Coins do usuário
  IF v_order_record.user_id IS NOT NULL THEN
    SELECT COALESCE(balance, 0) INTO v_uti_coins_balance
    FROM public.uti_coins
    WHERE user_id = v_order_record.user_id;
  END IF;
  
  -- Verificar se expirou
  IF v_order_record.status = 'pending' AND NOW() > v_order_record.expires_at THEN
    -- Marcar como expirado
    UPDATE public.order_verification_codes 
    SET status = 'expired', updated_at = NOW()
    WHERE id = v_order_record.id;
    
    v_order_record.status := 'expired';
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'order_data', row_to_json(v_order_record),
    'user_data', row_to_json(v_user_profile),
    'uti_coins_balance', v_uti_coins_balance
  );
END;
$function$