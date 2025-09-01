-- Reabilitar UTI PRO para estado original
UPDATE site_settings 
SET setting_value = '{"enabled": true}'
WHERE setting_key = 'uti_pro_settings';