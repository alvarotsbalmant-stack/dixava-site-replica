-- Corrigir valores de configuração do daily bonus que estão com formato incorreto
-- Converter JSONB simples para valores diretos

UPDATE coin_system_config 
SET setting_value = '"10"'::jsonb
WHERE setting_key = 'daily_bonus_base_amount' AND setting_value::text = '10';

UPDATE coin_system_config 
SET setting_value = '"100"'::jsonb
WHERE setting_key = 'daily_bonus_max_amount' AND setting_value::text = '100';

UPDATE coin_system_config 
SET setting_value = '"7"'::jsonb
WHERE setting_key = 'daily_bonus_streak_days' AND setting_value::text = '7';

UPDATE coin_system_config 
SET setting_value = '"calculated"'::jsonb
WHERE setting_key = 'daily_bonus_increment_type' AND setting_value::text = 'calculated';

UPDATE coin_system_config 
SET setting_value = '"10"'::jsonb
WHERE setting_key = 'daily_bonus_fixed_increment' AND setting_value::text = '10';