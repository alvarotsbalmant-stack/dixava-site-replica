
-- Adicionar colunas para badge de produto na tabela products
ALTER TABLE public.products 
ADD COLUMN badge_text text,
ADD COLUMN badge_color text,
ADD COLUMN badge_visible boolean DEFAULT false;
