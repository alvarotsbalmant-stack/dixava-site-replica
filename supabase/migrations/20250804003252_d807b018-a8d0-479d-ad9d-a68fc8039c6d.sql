-- Ativar modo de teste para daily bonus
UPDATE coin_system_config 
SET setting_value = 'true' 
WHERE setting_key = 'test_mode_enabled';