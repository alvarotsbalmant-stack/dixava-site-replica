-- Adicionar campo de cashback em UTI Coins na tabela products
ALTER TABLE public.products 
ADD COLUMN uti_coins_cashback_percentage NUMERIC(5,2) DEFAULT 0.00;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.products.uti_coins_cashback_percentage IS 'Porcentagem de cashback em UTI Coins que o cliente receberá ao comprar este produto (0.00 a 100.00)';

-- Adicionar constraint para garantir que a porcentagem seja válida (0% a 100%)
ALTER TABLE public.products 
ADD CONSTRAINT uti_coins_cashback_percentage_valid 
CHECK (uti_coins_cashback_percentage >= 0 AND uti_coins_cashback_percentage <= 100);