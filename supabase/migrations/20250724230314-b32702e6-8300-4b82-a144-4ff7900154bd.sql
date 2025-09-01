-- Criar configuração separada para UTI COINS
INSERT INTO site_settings (setting_key, setting_value)
VALUES (
  'uti_coins_settings',
  '{"enabled": true}'::jsonb
)
ON CONFLICT (setting_key) DO NOTHING;