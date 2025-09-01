-- Adicionar configurações para o sistema de daily bonus configurável
INSERT INTO coin_system_config (setting_key, setting_value, description) VALUES
  ('daily_bonus_base_amount', '"10"', 'Valor base do daily bonus (primeiro dia)'),
  ('daily_bonus_max_amount', '"100"', 'Valor máximo do daily bonus'),
  ('daily_bonus_streak_days', '"7"', 'Número de dias para completar um ciclo de streak'),
  ('daily_bonus_increment_type', '"calculated"', 'Tipo de incremento: fixed ou calculated'),
  ('daily_bonus_fixed_increment', '"10"', 'Incremento fixo por dia (se increment_type = fixed)')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = now();