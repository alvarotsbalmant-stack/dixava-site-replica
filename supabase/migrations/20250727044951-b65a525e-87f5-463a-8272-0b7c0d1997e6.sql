-- Fix remaining database function search_path issues

-- Update all remaining functions to have proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_subscriptions 
    WHERE user_subscriptions.user_id = has_active_subscription.user_id
      AND status = 'active' 
      AND end_date > now()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_active_subscription(user_id uuid)
RETURNS TABLE(subscription_id uuid, plan_name text, discount_percentage integer, end_date timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    us.id,
    sp.name,
    sp.discount_percentage,
    us.end_date
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = get_active_subscription.user_id
    AND us.status = 'active' 
    AND us.end_date > now()
  ORDER BY us.end_date DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_admin_users()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.auto_update_uti_pro_enabled()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Ativar UTI PRO se há valor de desconto, preço customizado ou pro_price
  NEW.uti_pro_enabled := (
    (NEW.uti_pro_value IS NOT NULL AND NEW.uti_pro_value > 0) OR
    (NEW.uti_pro_custom_price IS NOT NULL AND NEW.uti_pro_custom_price > 0) OR
    (NEW.pro_price IS NOT NULL AND NEW.pro_price > 0)
  );
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.adicionar_meses_assinatura(user_id uuid, meses integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  nova_data_expiracao TIMESTAMP WITH TIME ZONE;
  data_base TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Buscar data base (data de expiração atual ou data atual se não há assinatura)
  SELECT COALESCE(data_expiracao, now()) INTO data_base
  FROM public.usuarios
  WHERE id = user_id;
  
  -- Se a data base é no passado, usar data atual
  IF data_base < now() THEN
    data_base := now();
  END IF;
  
  -- Calcular nova data de expiração
  nova_data_expiracao := data_base + (meses || ' months')::INTERVAL;
  
  -- Atualizar usuário
  UPDATE public.usuarios
  SET 
    status_assinatura = 'Ativo',
    data_expiracao = nova_data_expiracao,
    updated_at = now()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_total_savings(p_user_id uuid)
RETURNS TABLE(total_savings numeric, promotion_savings numeric, uti_pro_savings numeric, total_purchases integer)
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(savings_amount), 0) as total_savings,
        COALESCE(SUM(CASE WHEN savings_type IN ('promotion', 'both') THEN savings_amount ELSE 0 END), 0) as promotion_savings,
        COALESCE(SUM(CASE WHEN savings_type IN ('uti_pro', 'both') THEN savings_amount ELSE 0 END), 0) as uti_pro_savings,
        COUNT(*)::INTEGER as total_purchases
    FROM user_savings 
    WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_email_confirmed()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN (
    SELECT email_confirmed_at IS NOT NULL 
    FROM auth.users 
    WHERE id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.remover_meses_assinatura(user_id uuid, meses integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  nova_data_expiracao TIMESTAMP WITH TIME ZONE;
  data_atual TIMESTAMP WITH TIME ZONE := now();
BEGIN
  -- Calcular nova data de expiração
  SELECT data_expiracao - (meses || ' months')::INTERVAL INTO nova_data_expiracao
  FROM public.usuarios
  WHERE id = user_id AND data_expiracao IS NOT NULL;
  
  -- Se não há data de expiração, retornar false
  IF nova_data_expiracao IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Se nova data seria no passado, expirar a assinatura
  IF nova_data_expiracao <= data_atual THEN
    UPDATE public.usuarios
    SET 
      status_assinatura = 'Expirado',
      data_expiracao = NULL,
      updated_at = now()
    WHERE id = user_id;
  ELSE
    -- Atualizar com nova data
    UPDATE public.usuarios
    SET 
      data_expiracao = nova_data_expiracao,
      updated_at = now()
    WHERE id = user_id;
  END IF;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancelar_assinatura(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.usuarios
  SET 
    status_assinatura = 'Expirado',
    data_expiracao = NULL,
    updated_at = now()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_pro_code(p_code_id uuid, p_user_id uuid, p_end_date timestamp with time zone)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Iniciar transação implícita
  
  -- Marcar código como usado
  UPDATE pro_codes 
  SET used_by = p_user_id,
      used_at = NOW()
  WHERE id = p_code_id;
  
  -- Verificar se a atualização foi bem-sucedida
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Erro ao processar código');
  END IF;
  
  -- Atualizar ou inserir na tabela user_subscriptions
  INSERT INTO user_subscriptions (user_id, plan_id, end_date, status, start_date)
  SELECT p_user_id, sp.id, p_end_date, 'active', NOW()
  FROM subscription_plans sp 
  WHERE sp.name LIKE '%UTI PRO%' 
  LIMIT 1
  ON CONFLICT (user_id) DO UPDATE SET
    end_date = p_end_date,
    status = 'active',
    start_date = NOW();
  
  -- Atualizar perfil do usuário
  UPDATE profiles 
  SET is_pro_member = TRUE,
      pro_expires_at = p_end_date
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Código resgatado com sucesso!');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'Erro interno: ' || SQLERRM);
END;
$$;