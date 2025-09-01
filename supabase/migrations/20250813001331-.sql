-- Inserir código na tabela correta (daily_codes) que a edge function está usando
DO $$
DECLARE
  new_code TEXT;
  brasilia_now TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular horário atual em Brasília (GMT-3)
  brasilia_now := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Gerar código único de 4 dígitos
  new_code := generate_unique_4digit_code();
  
  -- Inserir código na tabela que a edge function usa
  INSERT INTO daily_codes (
    code, 
    created_at, 
    claimable_until, 
    valid_until
  ) VALUES (
    new_code,
    brasilia_now,
    brasilia_now + INTERVAL '24 hours', -- 24h para resgatar
    brasilia_now + INTERVAL '48 hours'  -- 48h para manter streak
  );
  
  RAISE NOTICE 'Código do dia criado: %', new_code;
END $$;