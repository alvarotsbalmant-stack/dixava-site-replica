-- Criar sistema de códigos diários para Daily Bonus
-- Tabela de códigos únicos gerados diariamente
CREATE TABLE IF NOT EXISTS daily_bonus_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  bonus_amount INTEGER NOT NULL,
  streak_position INTEGER NOT NULL DEFAULT 1, -- Posição no ciclo (1, 2, 3...)
  is_test_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de resgates de usuários (histórico permanente)
CREATE TABLE IF NOT EXISTS user_bonus_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code_id UUID REFERENCES daily_bonus_codes(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  streak_at_claim INTEGER NOT NULL,
  bonus_received INTEGER NOT NULL,
  
  UNIQUE(user_id, code_id) -- Impede resgate duplo do mesmo código
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE daily_bonus_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bonus_claims ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para daily_bonus_codes
CREATE POLICY "Admins can manage daily bonus codes" 
ON daily_bonus_codes FOR ALL 
USING (is_admin());

CREATE POLICY "Everyone can view active codes" 
ON daily_bonus_codes FOR SELECT 
USING (expires_at > NOW());

-- Políticas RLS para user_bonus_claims
CREATE POLICY "Admins can view all claims" 
ON user_bonus_claims FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can view their own claims" 
ON user_bonus_claims FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert claims" 
ON user_bonus_claims FOR INSERT 
WITH CHECK (auth.uid() = user_id OR is_admin());

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_daily_bonus_codes_expires_at ON daily_bonus_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_daily_bonus_codes_test_mode ON daily_bonus_codes(is_test_mode);
CREATE INDEX IF NOT EXISTS idx_user_bonus_claims_user_id ON user_bonus_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bonus_claims_claimed_at ON user_bonus_claims(claimed_at);

-- Função para gerar código único
CREATE OR REPLACE FUNCTION generate_unique_daily_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Gerar código com timestamp + random
    new_code := 'BONUS_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || 
                UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM daily_bonus_codes WHERE code = new_code) INTO code_exists;
    
    -- Se não existe, retornar o código
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Função para cleanup automático de códigos antigos (manter só 6 meses)
CREATE OR REPLACE FUNCTION cleanup_old_bonus_codes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Remove códigos expirados há mais de 6 meses
  DELETE FROM daily_bonus_codes 
  WHERE expires_at < NOW() - INTERVAL '6 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;