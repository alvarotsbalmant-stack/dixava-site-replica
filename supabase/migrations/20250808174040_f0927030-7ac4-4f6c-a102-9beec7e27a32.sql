-- Criar função para atualizar saldo de usuário
CREATE OR REPLACE FUNCTION update_user_balance(p_user_id UUID, p_amount INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Atualizar ou inserir saldo do usuário
  INSERT INTO uti_coins (user_id, balance, total_earned, updated_at)
  VALUES (p_user_id, p_amount, p_amount, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = uti_coins.balance + p_amount,
    total_earned = uti_coins.total_earned + p_amount,
    updated_at = NOW();
END;
$$;

-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configurar cron job para gerar códigos diários às 20h (Brasília) = 23h UTC
SELECT cron.schedule(
  'generate-daily-bonus-code',
  '0 23 * * *', -- 23h UTC = 20h Brasília
  $$
  SELECT net.http_post(
    url:='https://pmxnfpnnvtuuiedoxuxc.supabase.co/functions/v1/secure-coin-actions',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteG5mcG5udnR1dWllZG94dXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTY3MTYsImV4cCI6MjA2MzY3MjcxNn0.mc3shTLqOg_Iifd1TVXg49SdVITdmsTENw5e3_TJmi4"}'::jsonb,
    body:='{"action": "generate_daily_code"}'::jsonb
  ) as request_id;
  $$
);

-- Configurar cron job para cleanup semanal (toda segunda às 2h UTC)
SELECT cron.schedule(
  'cleanup-old-bonus-codes',
  '0 2 * * 1', -- Segunda às 2h UTC
  $$
  SELECT net.http_post(
    url:='https://pmxnfpnnvtuuiedoxuxc.supabase.co/functions/v1/secure-coin-actions',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBteG5mcG5udnR1dWllZG94dXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTY3MTYsImV4cCI6MjA2MzY3MjcxNn0.mc3shTLqOg_Iifd1TVXg49SdVITdmsTENw5e3_TJmi4"}'::jsonb,
    body:='{"action": "cleanup_old_codes"}'::jsonb
  ) as request_id;
  $$
);

-- Gerar primeiro código para começar o sistema
INSERT INTO daily_bonus_codes (
  code, 
  generated_at, 
  expires_at, 
  bonus_amount, 
  streak_position, 
  is_test_mode
)
SELECT 
  'INITIAL_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  NOW(),
  NOW() + INTERVAL '10 seconds', -- Código inicial de teste por 10 segundos
  10,
  1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM daily_bonus_codes 
  WHERE expires_at > NOW()
);