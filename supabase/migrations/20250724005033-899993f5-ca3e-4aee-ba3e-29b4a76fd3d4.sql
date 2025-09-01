-- Testar desabilitação do sistema UTI Coins
UPDATE site_settings 
SET setting_value = '{"enabled": false}'
WHERE setting_key = 'uti_pro_settings';