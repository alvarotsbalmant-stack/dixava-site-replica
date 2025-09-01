-- Implementação do Sistema de Códigos Diários com Streak de 48h

-- 1. Criar tabela global de códigos diários
CREATE TABLE IF NOT EXISTS daily_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(4) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    claimable_until TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 2. Criar tabela pessoal de códigos do usuário
CREATE TABLE IF NOT EXISTS user_daily_codes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    code VARCHAR(4) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_valid BOOLEAN DEFAULT true,
    streak_position INTEGER NOT NULL,
    
    UNIQUE(user_id, code) -- Impede resgate duplo do mesmo código
);

-- 3. Habilitar RLS nas novas tabelas
ALTER TABLE daily_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_codes ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para daily_codes
CREATE POLICY "Everyone can view current codes" 
ON daily_codes FOR SELECT 
USING (true);

CREATE POLICY "System can insert codes" 
ON daily_codes FOR INSERT 
WITH CHECK (true);

-- 5. Políticas RLS para user_daily_codes
CREATE POLICY "Users can view their own codes" 
ON user_daily_codes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own codes" 
ON user_daily_codes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all user codes" 
ON user_daily_codes FOR SELECT 
USING (is_admin());

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_daily_codes_claimable ON daily_codes(claimable_until) WHERE claimable_until > NOW();
CREATE INDEX IF NOT EXISTS idx_daily_codes_valid ON daily_codes(valid_until) WHERE valid_until > NOW();
CREATE INDEX IF NOT EXISTS idx_user_codes_valid ON user_daily_codes(user_id, expires_at) WHERE expires_at > NOW();
CREATE INDEX IF NOT EXISTS idx_user_codes_streak ON user_daily_codes(user_id, streak_position);
CREATE INDEX IF NOT EXISTS idx_daily_codes_code ON daily_codes(code);

-- 7. Função para gerar código único de 4 dígitos
CREATE OR REPLACE FUNCTION generate_unique_4digit_code()
RETURNS VARCHAR(4)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code VARCHAR(4);
  code_exists BOOLEAN;
  attempts INTEGER := 0;
  max_attempts INTEGER := 100;
BEGIN
  LOOP
    -- Gerar código de 4 dígitos (1000-9999)
    new_code := LPAD((FLOOR(RANDOM() * 9000) + 1000)::TEXT, 4, '0');
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM daily_codes WHERE code = new_code) INTO code_exists;
    
    -- Incrementar tentativas
    attempts := attempts + 1;
    
    -- Se não existe ou atingiu máximo de tentativas, retornar
    IF NOT code_exists OR attempts >= max_attempts THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- 8. Função para gerar código diário automaticamente
CREATE OR REPLACE FUNCTION generate_daily_code()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code VARCHAR(4);
  claimable_until TIMESTAMP WITH TIME ZONE;
  valid_until TIMESTAMP WITH TIME ZONE;
  brasilia_now TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular horário atual em Brasília (GMT-3)
  brasilia_now := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Calcular janelas de tempo
  claimable_until := brasilia_now + INTERVAL '24 hours'; -- 24h para resgatar
  valid_until := brasilia_now + INTERVAL '48 hours';     -- 48h para manter streak
  
  -- Gerar código único
  new_code := generate_unique_4digit_code();
  
  -- Inserir código na tabela global
  INSERT INTO daily_codes (code, created_at, claimable_until, valid_until)
  VALUES (new_code, brasilia_now, claimable_until, valid_until);
  
  RETURN jsonb_build_object(
    'success', true,
    'code', new_code,
    'created_at', brasilia_now,
    'claimable_until', claimable_until,
    'valid_until', valid_until,
    'message', 'Código diário gerado com sucesso'
  );
END;
$$;

-- 9. Função para verificar se código pode ser resgatado
CREATE OR REPLACE FUNCTION can_claim_code(p_code VARCHAR(4))
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claimable_until TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT dc.claimable_until INTO claimable_until
  FROM daily_codes dc
  WHERE dc.code = p_code;
  
  IF claimable_until IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN NOW() <= claimable_until;
END;
$$;

-- 10. Função para verificar validade do código
CREATE OR REPLACE FUNCTION is_code_valid(p_code VARCHAR(4))
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  valid_until TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT dc.valid_until INTO valid_until
  FROM daily_codes dc
  WHERE dc.code = p_code;
  
  IF valid_until IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN NOW() <= valid_until;
END;
$$;

-- 11. Função para limpeza automática de códigos antigos
CREATE OR REPLACE FUNCTION cleanup_old_daily_codes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Remove códigos globais com mais de 7 dias
  DELETE FROM daily_codes 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Remove códigos pessoais expirados há mais de 30 dias
  DELETE FROM user_daily_codes 
  WHERE expires_at < NOW() - INTERVAL '30 days';
  
  RETURN deleted_count;
END;
$$;

-- 12. Configurar cron job para gerar código às 20h Brasília (23h UTC)
SELECT cron.schedule(
  'generate-daily-code-8pm-brasilia',
  '0 23 * * *', -- 23h UTC = 20h Brasília
  $$
  SELECT generate_daily_code();
  $$
);

-- 13. Configurar cron job para limpeza semanal
SELECT cron.schedule(
  'cleanup-old-daily-codes',
  '0 2 * * 0', -- Domingo às 2h UTC
  $$
  SELECT cleanup_old_daily_codes();
  $$
);