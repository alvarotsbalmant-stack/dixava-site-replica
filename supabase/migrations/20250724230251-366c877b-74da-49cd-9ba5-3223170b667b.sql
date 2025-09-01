-- Criar configuração separada para UTI COINS
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES (
  'uti_coins_settings',
  '{"enabled": true}'::jsonb,
  'Configurações do sistema UTI Coins (ativar/desativar)'
)
ON CONFLICT (setting_key) DO NOTHING;