-- FASE 1: CORREÇÕES CRÍTICAS (Corrigida)

-- 1. Criar tabela security_flags que está causando erros nas edge functions
CREATE TABLE IF NOT EXISTS public.security_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_flags ENABLE ROW LEVEL SECURITY;

-- Policies para security_flags
CREATE POLICY "Admins can manage security flags" 
ON public.security_flags FOR ALL 
USING (is_admin());

CREATE POLICY "System can insert security flags" 
ON public.security_flags FOR INSERT 
WITH CHECK (true);

-- 2. Corrigir duplicação de configurações - consolidar em coin_system_config
-- Migrar configurações do site_settings para coin_system_config se existirem
INSERT INTO public.coin_system_config (setting_key, setting_value, description)
SELECT 
  'system_enabled',
  CASE WHEN (ss.setting_value::jsonb->>'enabled')::boolean = true THEN 'true'::jsonb ELSE 'false'::jsonb END,
  'Sistema UTI Coins habilitado globalmente'
FROM public.site_settings ss 
WHERE ss.setting_key = 'uti_coins_settings'
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();

-- Configurações padrão essenciais
INSERT INTO public.coin_system_config (setting_key, setting_value, description) VALUES
  ('system_enabled', 'true', 'Sistema UTI Coins habilitado globalmente'),
  ('daily_login_amount', '50', 'Moedas por login diário'),
  ('scroll_amount', '2', 'Moedas por scroll da página'),
  ('max_scroll_per_day', '50', 'Máximo de scrolls recompensados por dia'),
  ('scroll_cooldown_minutes', '1', 'Cooldown entre scrolls em minutos'),
  ('max_streak_multiplier', '3.0', 'Multiplicador máximo de streak'),
  ('streak_multiplier_increment', '0.1', 'Incremento do multiplicador por dia de streak'),
  ('rate_limit_window_minutes', '60', 'Janela de rate limiting em minutos'),
  ('max_actions_per_window', '100', 'Máximo de ações por janela de rate limiting'),
  ('security_flag_threshold', '10', 'Limite de ações suspeitas antes de flag'),
  ('suspicious_action_window_minutes', '5', 'Janela para detectar ações suspeitas')
ON CONFLICT (setting_key) DO NOTHING;

-- 3. Criar trigger para inserir automaticamente saldo UTI Coins para novos usuários
-- (Usar user_profiles em vez de profiles)
CREATE OR REPLACE FUNCTION public.create_user_uti_coins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir saldo inicial de UTI Coins
  INSERT INTO public.uti_coins (user_id, balance, total_earned, total_spent)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que executa após inserção na tabela user_profiles
DROP TRIGGER IF EXISTS on_user_profile_created ON public.user_profiles;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_uti_coins();

-- 4. Corrigir regras de moedas para incluir cooldown
UPDATE public.coin_rules 
SET cooldown_minutes = 1 
WHERE action = 'scroll_page' AND cooldown_minutes = 0;

-- Inserir regras padrão se não existirem
INSERT INTO public.coin_rules (action, amount, description, max_per_day, cooldown_minutes, is_active) VALUES
  ('daily_login', 50, 'Login diário no sistema', 1, 1440, true),
  ('scroll_page', 2, 'Explorar conteúdo do site', 50, 1, true),
  ('view_product', 1, 'Visualizar página de produto', 20, 0, true),
  ('share_product', 5, 'Compartilhar produto', 5, 30, true)
ON CONFLICT (action) DO UPDATE SET
  amount = EXCLUDED.amount,
  description = EXCLUDED.description,
  max_per_day = EXCLUDED.max_per_day,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  is_active = EXCLUDED.is_active;

-- 5. Função para detectar atividade suspeita
CREATE OR REPLACE FUNCTION public.check_suspicious_activity(p_user_id UUID, p_action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_threshold INTEGER;
  v_window_minutes INTEGER;
  v_action_count INTEGER;
BEGIN
  -- Buscar configurações
  SELECT (setting_value)::INTEGER INTO v_threshold 
  FROM coin_system_config WHERE setting_key = 'security_flag_threshold';
  
  SELECT (setting_value)::INTEGER INTO v_window_minutes 
  FROM coin_system_config WHERE setting_key = 'suspicious_action_window_minutes';
  
  -- Valores padrão se não encontrados
  v_threshold := COALESCE(v_threshold, 10);
  v_window_minutes := COALESCE(v_window_minutes, 5);
  
  -- Contar ações na janela de tempo
  SELECT COUNT(*) INTO v_action_count
  FROM daily_actions 
  WHERE user_id = p_user_id 
    AND action = p_action
    AND last_performed_at > now() - (v_window_minutes || ' minutes')::INTERVAL;
  
  -- Flaggar se suspeito
  IF v_action_count >= v_threshold THEN
    INSERT INTO security_flags (user_id, flag_type, reason, metadata)
    VALUES (p_user_id, 'suspicious_activity', 
            format('Muitas ações %s em %s minutos', p_action, v_window_minutes),
            jsonb_build_object('action', p_action, 'count', v_action_count, 'threshold', v_threshold));
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- 6. Atualizar timestamps automaticamente
CREATE TRIGGER update_security_flags_updated_at
  BEFORE UPDATE ON public.security_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coin_system_config_updated_at
  BEFORE UPDATE ON public.coin_system_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_security_flags_user_id_resolved ON public.security_flags(user_id, resolved);
CREATE INDEX IF NOT EXISTS idx_daily_actions_user_action_date ON public.daily_actions(user_id, action, action_date);
CREATE INDEX IF NOT EXISTS idx_daily_actions_last_performed ON public.daily_actions(last_performed_at);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_created ON public.coin_transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_uti_coins_user_id ON public.uti_coins(user_id);

-- 8. Função para limpar dados antigos (manutenção)
CREATE OR REPLACE FUNCTION public.cleanup_uti_coins_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar logs de segurança antigos (mais de 30 dias)
  DELETE FROM security_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Limpar flags resolvidos antigos (mais de 90 dias)
  DELETE FROM security_flags 
  WHERE resolved = true AND resolved_at < NOW() - INTERVAL '90 days';
  
  -- Limpar ações diárias antigas (mais de 365 dias)
  DELETE FROM daily_actions 
  WHERE last_performed_at < NOW() - INTERVAL '365 days';
END;
$$;