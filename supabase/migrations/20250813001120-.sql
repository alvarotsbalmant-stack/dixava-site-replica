-- Criar código de teste para hoje
DO $$
DECLARE
  new_code TEXT;
  brasilia_now TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular horário atual em Brasília (GMT-3)
  brasilia_now := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Gerar código único
  new_code := generate_unique_daily_code();
  
  -- Inserir código de teste válido por 24h
  INSERT INTO daily_bonus_codes (
    code, 
    generated_at, 
    expires_at, 
    bonus_amount, 
    streak_position,
    is_test_mode
  ) VALUES (
    new_code,
    brasilia_now,
    brasilia_now + INTERVAL '24 hours',
    40, -- Valor base do sistema atual
    1,
    false
  );
  
  RAISE NOTICE 'Código criado: %', new_code;
END $$;