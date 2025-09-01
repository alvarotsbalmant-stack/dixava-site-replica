-- Limpar códigos duplicados antigos, mantendo apenas o código de hoje
DELETE FROM daily_bonus_codes 
WHERE generated_at::date < CURRENT_DATE 
   OR (generated_at::date = CURRENT_DATE AND id != 'd0cb8e23-2021-4d32-847a-ee2ec52cd141');