-- Atualizar função redeem_coin_product para usar códigos
CREATE OR REPLACE FUNCTION public.redeem_coin_product(p_user_id uuid, p_product_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  v_product coin_products%ROWTYPE;
  v_user_coins uti_coins%ROWTYPE;
  v_code_result JSONB;
BEGIN
  -- Buscar produto
  SELECT * INTO v_product FROM coin_products 
  WHERE id = p_product_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Produto não encontrado ou inativo');
  END IF;
  
  -- Verificar estoque
  IF v_product.stock IS NOT NULL AND v_product.stock <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Produto fora de estoque');
  END IF;
  
  -- Buscar saldo do usuário
  SELECT * INTO v_user_coins FROM uti_coins WHERE user_id = p_user_id;
  
  IF NOT FOUND OR v_user_coins.balance < v_product.cost THEN
    RETURN jsonb_build_object('success', false, 'message', 'Saldo insuficiente');
  END IF;
  
  -- Gerar código de resgate
  SELECT public.generate_redemption_code(p_user_id, p_product_id, v_product.cost) INTO v_code_result;
  
  IF NOT (v_code_result->>'success')::boolean THEN
    RETURN jsonb_build_object('success', false, 'message', 'Erro ao gerar código de resgate');
  END IF;
  
  -- Inserir resgate na tabela legacy
  INSERT INTO coin_redemptions (user_id, product_id, cost)
  VALUES (p_user_id, p_product_id, v_product.cost);
  
  -- Debitar moedas
  INSERT INTO coin_transactions (user_id, amount, type, reason, description)
  VALUES (p_user_id, v_product.cost, 'spent', 'product_redemption', 
          'Resgate: ' || v_product.name);
  
  -- Atualizar saldo
  UPDATE uti_coins SET
    balance = balance - v_product.cost,
    total_spent = total_spent + v_product.cost,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Decrementar estoque se aplicável
  IF v_product.stock IS NOT NULL THEN
    UPDATE coin_products SET stock = stock - 1 WHERE id = p_product_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Produto resgatado com sucesso!',
    'redemption_code', v_code_result->>'code',
    'product_name', v_product.name
  );
END;
$$;