-- Corrigir o cron job para 20h Brasília (23h UTC)
SELECT cron.unschedule('generate-daily-bonus-code');

-- Criar novo cron job no horário correto - 23h UTC = 20h Brasília
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

-- Gerar código para hoje manualmente
INSERT INTO daily_bonus_codes (
  code, 
  generated_at, 
  expires_at, 
  bonus_amount, 
  streak_position, 
  is_test_mode
)
SELECT 
  'BONUS_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  NOW(),
  NOW() + INTERVAL '1 day', -- Válido até amanhã
  10, -- Valor base
  1,  -- Posição inicial
  false
WHERE NOT EXISTS (
  SELECT 1 FROM daily_bonus_codes 
  WHERE expires_at > NOW()
    AND generated_at::date = CURRENT_DATE
);

-- Restaurar/criar streak do usuário eb6eb6e9-b9a5-400f-9440-e7f165bb84f3
INSERT INTO user_streaks (
  user_id, 
  current_streak, 
  longest_streak, 
  last_login_date, 
  streak_multiplier
) VALUES (
  'eb6eb6e9-b9a5-400f-9440-e7f165bb84f3'::uuid,
  0, -- Começar do zero
  0,
  NULL, -- Resetar data de último login
  1.0
) ON CONFLICT (user_id) 
DO UPDATE SET
  current_streak = 0,
  last_login_date = NULL,
  streak_multiplier = 1.0,
  updated_at = NOW();