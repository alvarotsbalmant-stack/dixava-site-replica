-- Criar tabelas de segurança para monitoramento
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  suspicious BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  flag_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_action ON public.security_logs(action);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON public.security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_suspicious ON public.security_logs(suspicious) WHERE suspicious = true;

CREATE INDEX IF NOT EXISTS idx_security_flags_user_id ON public.security_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_security_flags_type ON public.security_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_security_flags_unresolved ON public.security_flags(resolved) WHERE resolved = false;

-- RLS para security_logs - apenas admins podem ver todos os logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all security logs" ON public.security_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can view their own security logs" ON public.security_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert security logs" ON public.security_logs
  FOR INSERT WITH CHECK (true);

-- RLS para security_flags - apenas admins podem gerenciar
ALTER TABLE public.security_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security flags" ON public.security_flags
  FOR ALL USING (is_admin());

CREATE POLICY "System can insert security flags" ON public.security_flags
  FOR INSERT WITH CHECK (true);

-- Criar função para limpar logs antigos (manter apenas 30 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove logs de mais de 30 dias
  DELETE FROM public.security_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Remove flags resolvidos de mais de 90 dias
  DELETE FROM public.security_flags 
  WHERE resolved = true AND resolved_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Criar função para verificar usuários suspeitos
CREATE OR REPLACE FUNCTION public.is_user_flagged(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.security_flags 
    WHERE user_id = p_user_id 
      AND resolved = false 
      AND created_at > NOW() - INTERVAL '24 hours'
  );
$$;

-- Atualizar a função earn_coins para verificar flags de segurança
CREATE OR REPLACE FUNCTION public.earn_coins(p_user_id uuid, p_action text, p_amount integer DEFAULT NULL::integer, p_description text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
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
  v_is_flagged BOOLEAN;
BEGIN
  -- Verificar se usuário está flagged por atividade suspeita
  SELECT public.is_user_flagged(p_user_id) INTO v_is_flagged;
  
  IF v_is_flagged THEN
    RETURN jsonb_build_object('success', false, 'message', 'Conta temporariamente restrita por atividade suspeita');
  END IF;

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