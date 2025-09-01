-- Remover configurações obsoletas que não são mais usadas
DELETE FROM coin_system_config WHERE setting_key IN (
  'max_streak_multiplier',
  'streak_multiplier_increment',
  'base_bonus_amount'
);