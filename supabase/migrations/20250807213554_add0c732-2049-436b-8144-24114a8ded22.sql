-- Criar tabela para armazenar códigos de pedidos
CREATE TABLE public.order_verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  
  -- Informações do pedido
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  customer_info JSONB NOT NULL,
  shipping_info JSONB,
  discount_info JSONB,
  
  -- Metadados
  ip_address INET,
  user_agent TEXT,
  browser_info JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  
  -- Recompensas e benefícios
  rewards_given JSONB DEFAULT '{}',
  rewards_processed BOOLEAN DEFAULT FALSE,
  
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.order_verification_codes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Admins can view all codes" ON public.order_verification_codes
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can view their own codes" ON public.order_verification_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert codes" ON public.order_verification_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update codes" ON public.order_verification_codes
  FOR UPDATE USING (is_admin());

-- Índices para performance
CREATE INDEX idx_order_codes_code ON public.order_verification_codes(code);
CREATE INDEX idx_order_codes_status ON public.order_verification_codes(status);
CREATE INDEX idx_order_codes_user_id ON public.order_verification_codes(user_id);
CREATE INDEX idx_order_codes_expires_at ON public.order_verification_codes(expires_at);
CREATE INDEX idx_order_codes_created_at ON public.order_verification_codes(created_at);

-- Trigger para updated_at
CREATE TRIGGER update_order_verification_codes_updated_at
  BEFORE UPDATE ON public.order_verification_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar código único de 25 dígitos
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Gerar código de 25 dígitos
    new_code := LPAD(FLOOR(RANDOM() * 10^25)::TEXT, 25, '0');
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM public.order_verification_codes WHERE code = new_code) 
    INTO code_exists;
    
    -- Se não existe, retornar o código
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Função para criar código de verificação
CREATE OR REPLACE FUNCTION public.create_order_verification_code(
  p_user_id UUID,
  p_items JSONB,
  p_total_amount NUMERIC,
  p_customer_info JSONB,
  p_shipping_info JSONB DEFAULT NULL,
  p_discount_info JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_browser_info JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_code_id UUID;
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
  
  RETURN jsonb_build_object(
    'success', true,
    'code', v_code,
    'code_id', v_code_id,
    'expires_at', NOW() + INTERVAL '24 hours'
  );
END;
$$;

-- Função para verificar código
CREATE OR REPLACE FUNCTION public.verify_order_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_record public.order_verification_codes%ROWTYPE;
  v_user_profile profiles%ROWTYPE;
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
  FROM public.profiles
  WHERE id = v_order_record.user_id;
  
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
    'user_data', row_to_json(v_user_profile)
  );
END;
$$;

-- Função para completar pedido
CREATE OR REPLACE FUNCTION public.complete_order_verification(
  p_code TEXT,
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_record public.order_verification_codes%ROWTYPE;
  v_item JSONB;
  v_coin_amount INTEGER := 20; -- UTI coins padrão por compra
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
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Pedido finalizado com sucesso',
    'coins_awarded', v_coin_amount,
    'order_id', v_order_record.id
  );
END;
$$;

-- Função para expirar códigos automaticamente
CREATE OR REPLACE FUNCTION public.expire_old_order_codes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expired_count INTEGER;
BEGIN
  UPDATE public.order_verification_codes 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
    AND expires_at < NOW();
  
  GET DIAGNOSTICS v_expired_count = ROW_COUNT;
  
  RETURN v_expired_count;
END;
$$;