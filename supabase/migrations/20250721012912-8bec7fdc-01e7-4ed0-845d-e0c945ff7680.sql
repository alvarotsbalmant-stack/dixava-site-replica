-- Criar sistema completo de UTI COINS

-- Tabela para saldo de moedas dos usuários
CREATE TABLE public.uti_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela para transações de moedas
CREATE TABLE public.coin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent')),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para regras de ganho de moedas
CREATE TABLE public.coin_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  max_per_day INTEGER,
  max_per_month INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  cooldown_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para produtos resgatáveis com moedas
CREATE TABLE public.coin_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('discount', 'freebie', 'exclusive_access', 'physical_product')),
  product_data JSONB NOT NULL DEFAULT '{}',
  stock INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para resgates de produtos
CREATE TABLE public.coin_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES coin_products(id) ON DELETE CASCADE,
  cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'delivered')),
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Tabela para streaks de login diário
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  streak_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela para rastreamento de ações diárias
CREATE TABLE public.daily_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  last_performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, action, action_date)
);

-- Tabela para configurações do sistema de moedas
CREATE TABLE public.coin_system_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir regras padrão de moedas
INSERT INTO public.coin_rules (action, amount, description, max_per_day) VALUES
('daily_login', 10, 'Login diário', 1),
('scroll_page', 1, 'Scroll na página', 50),
('first_purchase', 200, 'Primeira compra', 1),
('purchase_bonus', 1, 'Bônus por compra (1 moeda por R$ gasto)', NULL),
('product_review', 25, 'Avaliação de produto', 5),
('social_share', 15, 'Compartilhamento nas redes sociais', 3),
('newsletter_signup', 50, 'Cadastro na newsletter', 1),
('profile_completion', 30, 'Completar perfil', 1);

-- Inserir configurações padrão do sistema
INSERT INTO public.coin_system_config (setting_key, setting_value, description) VALUES
('daily_login_base_coins', '10', 'Moedas base para login diário'),
('max_streak_multiplier', '3.0', 'Multiplicador máximo para streak'),
('streak_multiplier_increment', '0.1', 'Incremento do multiplicador por dia de streak'),
('scroll_cooldown_seconds', '30', 'Cooldown entre ganhos por scroll'),
('admin_manual_bonus_enabled', 'true', 'Permitir bônus manual do admin');

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.uti_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_system_config ENABLE ROW LEVEL SECURITY;

-- Políticas para uti_coins
CREATE POLICY "Users can view their own coins" ON public.uti_coins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own coins" ON public.uti_coins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coins" ON public.uti_coins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all coins" ON public.uti_coins
  FOR ALL USING (is_admin());

-- Políticas para coin_transactions
CREATE POLICY "Users can view their own transactions" ON public.coin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.coin_transactions
  FOR SELECT USING (is_admin());

CREATE POLICY "System can insert transactions" ON public.coin_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

-- Políticas para coin_rules
CREATE POLICY "Everyone can view active rules" ON public.coin_rules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all rules" ON public.coin_rules
  FOR ALL USING (is_admin());

-- Políticas para coin_products
CREATE POLICY "Everyone can view active products" ON public.coin_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all products" ON public.coin_products
  FOR ALL USING (is_admin());

-- Políticas para coin_redemptions
CREATE POLICY "Users can view their own redemptions" ON public.coin_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions" ON public.coin_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all redemptions" ON public.coin_redemptions
  FOR ALL USING (is_admin());

-- Políticas para user_streaks
CREATE POLICY "Users can view their own streaks" ON public.user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" ON public.user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON public.user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all streaks" ON public.user_streaks
  FOR ALL USING (is_admin());

-- Políticas para daily_actions
CREATE POLICY "Users can view their own actions" ON public.daily_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own actions" ON public.daily_actions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all actions" ON public.daily_actions
  FOR SELECT USING (is_admin());

-- Políticas para coin_system_config
CREATE POLICY "Everyone can view config" ON public.coin_system_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage config" ON public.coin_system_config
  FOR ALL USING (is_admin());

-- Triggers para updated_at
CREATE TRIGGER update_uti_coins_updated_at
  BEFORE UPDATE ON public.uti_coins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coin_rules_updated_at
  BEFORE UPDATE ON public.coin_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coin_products_updated_at
  BEFORE UPDATE ON public.coin_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coin_system_config_updated_at
  BEFORE UPDATE ON public.coin_system_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para processar ganho de moedas
CREATE OR REPLACE FUNCTION public.earn_coins(
  p_user_id UUID,
  p_action TEXT,
  p_amount INTEGER DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
BEGIN
  -- Buscar regra para a ação
  SELECT * INTO v_rule FROM coin_rules WHERE action = p_action AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ação não encontrada ou inativa');
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
      RETURN jsonb_build_object('success', false, 'message', 'Limite diário atingido para esta ação');
    END IF;
  END IF;
  
  -- Verificar cooldown
  IF v_rule.cooldown_minutes > 0 AND v_last_action IS NOT NULL THEN
    IF v_last_action + (v_rule.cooldown_minutes || ' minutes')::INTERVAL > now() THEN
      RETURN jsonb_build_object('success', false, 'message', 'Aguarde antes de realizar esta ação novamente');
    END IF;
  END IF;
  
  -- Aplicar multiplicador de streak para login diário
  IF p_action = 'daily_login' THEN
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
  VALUES (p_user_id, v_final_amount, 'earned', p_action, 
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
    'success', true, 
    'amount', v_final_amount,
    'multiplier', v_multiplier,
    'message', 'Moedas adicionadas com sucesso!'
  );
END;
$$;

-- Função para processar login diário e streak
CREATE OR REPLACE FUNCTION public.process_daily_login(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_streak user_streaks%ROWTYPE;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
  v_new_streak INTEGER;
  v_new_multiplier NUMERIC;
  v_max_multiplier NUMERIC;
  v_increment NUMERIC;
  v_coins_result JSONB;
BEGIN
  -- Buscar configurações
  SELECT setting_value::NUMERIC INTO v_max_multiplier 
  FROM coin_system_config WHERE setting_key = 'max_streak_multiplier';
  
  SELECT setting_value::NUMERIC INTO v_increment 
  FROM coin_system_config WHERE setting_key = 'streak_multiplier_increment';
  
  v_max_multiplier := COALESCE(v_max_multiplier, 3.0);
  v_increment := COALESCE(v_increment, 0.1);
  
  -- Buscar streak atual
  SELECT * INTO v_streak FROM user_streaks WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Primeiro login
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_login_date, streak_multiplier)
    VALUES (p_user_id, 1, 1, v_today, 1.0);
    v_new_streak := 1;
    v_new_multiplier := 1.0;
  ELSE
    IF v_streak.last_login_date = v_today THEN
      -- Já fez login hoje
      RETURN jsonb_build_object('success', false, 'message', 'Login já realizado hoje');
    ELSIF v_streak.last_login_date = v_yesterday THEN
      -- Continuou o streak
      v_new_streak := v_streak.current_streak + 1;
      v_new_multiplier := LEAST(1.0 + (v_new_streak - 1) * v_increment, v_max_multiplier);
    ELSE
      -- Quebrou o streak
      v_new_streak := 1;
      v_new_multiplier := 1.0;
    END IF;
    
    UPDATE user_streaks SET
      current_streak = v_new_streak,
      longest_streak = GREATEST(longest_streak, v_new_streak),
      last_login_date = v_today,
      streak_multiplier = v_new_multiplier,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Ganhar moedas pelo login diário
  SELECT public.earn_coins(p_user_id, 'daily_login') INTO v_coins_result;
  
  RETURN jsonb_build_object(
    'success', true,
    'streak', v_new_streak,
    'multiplier', v_new_multiplier,
    'coins_earned', (v_coins_result->>'amount')::INTEGER
  );
END;
$$;

-- Função para resgatar produto
CREATE OR REPLACE FUNCTION public.redeem_coin_product(
  p_user_id UUID,
  p_product_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product coin_products%ROWTYPE;
  v_user_coins uti_coins%ROWTYPE;
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
  
  -- Inserir resgate
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
  
  RETURN jsonb_build_object('success', true, 'message', 'Produto resgatado com sucesso!');
END;
$$;