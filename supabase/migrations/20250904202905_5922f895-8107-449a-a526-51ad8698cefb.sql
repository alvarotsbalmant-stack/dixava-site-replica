-- Criar regras necessárias para o sistema de recompensas de compras
INSERT INTO public.coin_rules (action, amount, description, is_active, max_per_day, cooldown_minutes)
VALUES 
  ('purchase_completed', 20, 'Recompensa por finalização de compra', true, NULL, 0),
  ('cashback_purchase', 0, 'Cashback da compra em UTI Coins', true, NULL, 0)
ON CONFLICT (action) DO UPDATE SET
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();