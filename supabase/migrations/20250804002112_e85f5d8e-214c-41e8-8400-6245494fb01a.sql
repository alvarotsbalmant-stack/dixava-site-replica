-- Insert base bonus amount configuration if it doesn't exist
INSERT INTO coin_system_config (setting_key, setting_value, description)
VALUES 
  ('base_bonus_amount', '10', 'Base amount of coins for daily bonus')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;