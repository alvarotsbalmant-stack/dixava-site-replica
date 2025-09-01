-- Phase 4: Enable UTI Coins system and add debugging
-- Enable UTI Coins system
INSERT INTO coin_system_config (setting_key, setting_value, description)
VALUES ('system_enabled', 'true', 'Enable/disable the UTI Coins system')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = 'true',
  updated_at = now();

-- Add test coin rules if they don't exist
INSERT INTO coin_rules (action, amount, description, max_per_day, is_active)
VALUES 
  ('daily_login', 100, 'Login diário no sistema', 1, true),
  ('scroll_page', 5, 'Scroll em páginas do site', 10, true)
ON CONFLICT (action) DO UPDATE SET
  is_active = true,
  updated_at = now();

-- Initialize UTI Coins for admin user if not exists
INSERT INTO uti_coins (user_id, balance, total_earned, total_spent)
VALUES ('d42c9b5a-2c8f-4a9b-a916-59aa500213b2', 269063, 269063, 0)
ON CONFLICT (user_id) DO NOTHING;