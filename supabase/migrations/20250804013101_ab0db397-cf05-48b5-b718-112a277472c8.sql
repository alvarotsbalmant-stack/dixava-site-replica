-- Configurar modo teste com cooldown de 10 segundos
UPDATE coin_system_config 
SET setting_value = '"10"'::jsonb
WHERE setting_key = 'test_cooldown_seconds';

-- Se não existir, criar a configuração
INSERT INTO coin_system_config (setting_key, setting_value, description)
VALUES ('test_cooldown_seconds', '"10"'::jsonb, 'Cooldown em segundos para modo teste do daily bonus')
ON CONFLICT (setting_key) 
DO UPDATE SET setting_value = '"10"'::jsonb;