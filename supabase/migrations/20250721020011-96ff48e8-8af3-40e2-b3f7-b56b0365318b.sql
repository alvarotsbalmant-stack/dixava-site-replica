-- Criar tabela para códigos de resgate únicos
CREATE TABLE IF NOT EXISTS public.redemption_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES coin_products(id),
  cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed')),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redeemed_by_admin UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar configuração para ativar/desativar sistema
INSERT INTO coin_system_config (setting_key, setting_value, description)
VALUES 
  ('system_enabled', '"true"', 'Ativar/desativar completamente o sistema UTI Coins')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS para redemption_codes
ALTER TABLE public.redemption_codes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own codes" 
ON public.redemption_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create codes" 
ON public.redemption_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all codes" 
ON public.redemption_codes 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update codes" 
ON public.redemption_codes 
FOR UPDATE 
USING (is_admin());

-- Trigger para updated_at
CREATE TRIGGER update_redemption_codes_updated_at
    BEFORE UPDATE ON public.redemption_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar código único de resgate
CREATE OR REPLACE FUNCTION public.generate_redemption_code(
  p_user_id UUID,
  p_product_id UUID,
  p_cost INTEGER
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_code_id UUID;
BEGIN
  -- Gerar código único (8 caracteres alfanuméricos)
  v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));
  
  -- Verificar se código já existe e gerar novo se necessário
  WHILE EXISTS (SELECT 1 FROM redemption_codes WHERE code = v_code) LOOP
    v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));
  END LOOP;
  
  -- Inserir código
  INSERT INTO redemption_codes (code, user_id, product_id, cost)
  VALUES (v_code, p_user_id, p_product_id, p_cost)
  RETURNING id INTO v_code_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'code', v_code,
    'code_id', v_code_id
  );
END;
$$;

-- Função para marcar código como resgatado
CREATE OR REPLACE FUNCTION public.redeem_code_admin(
  p_code TEXT,
  p_admin_id UUID
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_redemption redemption_codes%ROWTYPE;
  v_product coin_products%ROWTYPE;
  v_user profiles%ROWTYPE;
BEGIN
  -- Verificar se admin tem permissão
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Buscar código
  SELECT * INTO v_redemption FROM redemption_codes WHERE code = p_code;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código não encontrado');
  END IF;
  
  IF v_redemption.status = 'redeemed' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código já foi resgatado');
  END IF;
  
  -- Buscar dados do produto
  SELECT * INTO v_product FROM coin_products WHERE id = v_redemption.product_id;
  
  -- Buscar dados do usuário
  SELECT * INTO v_user FROM profiles WHERE id = v_redemption.user_id;
  
  -- Marcar como resgatado
  UPDATE redemption_codes 
  SET 
    status = 'redeemed',
    redeemed_at = NOW(),
    redeemed_by_admin = p_admin_id
  WHERE code = p_code;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Código resgatado com sucesso',
    'redemption_data', jsonb_build_object(
      'code', v_redemption.code,
      'product_name', v_product.name,
      'user_name', v_user.name,
      'user_email', v_user.email,
      'cost', v_redemption.cost,
      'created_at', v_redemption.created_at,
      'redeemed_at', NOW()
    )
  );
END;
$$;

-- Função para verificar dados do código (para admin)
CREATE OR REPLACE FUNCTION public.verify_redemption_code(
  p_code TEXT
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Verificar se admin tem permissão
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  SELECT jsonb_build_object(
    'success', true,
    'code_data', jsonb_build_object(
      'code', rc.code,
      'status', rc.status,
      'cost', rc.cost,
      'created_at', rc.created_at,
      'redeemed_at', rc.redeemed_at,
      'product_name', cp.name,
      'product_type', cp.product_type,
      'user_name', p.name,
      'user_email', p.email,
      'redeemed_by_admin', admin_p.name
    )
  ) INTO v_result
  FROM redemption_codes rc
  JOIN coin_products cp ON rc.product_id = cp.id
  JOIN profiles p ON rc.user_id = p.id
  LEFT JOIN profiles admin_p ON rc.redeemed_by_admin = admin_p.id
  WHERE rc.code = p_code;
  
  IF v_result IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Código não encontrado');
  END IF;
  
  RETURN v_result;
END;
$$;