-- Desabilitar UTI PRO para teste
UPDATE site_settings 
SET setting_value = '{"enabled": false}'
WHERE setting_key = 'uti_pro_settings';