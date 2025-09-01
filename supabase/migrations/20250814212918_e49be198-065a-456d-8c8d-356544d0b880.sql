-- Adicionar novos campos para personalização dos service cards
ALTER TABLE public.service_cards 
ADD COLUMN background_image_url TEXT,
ADD COLUMN shadow_color TEXT DEFAULT '#ef4444',
ADD COLUMN shadow_enabled BOOLEAN DEFAULT true,
ADD COLUMN icon_filter_enabled BOOLEAN DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN public.service_cards.background_image_url IS 'URL da imagem de fundo personalizada do card';
COMMENT ON COLUMN public.service_cards.shadow_color IS 'Cor personalizada para o efeito sombra (formato hex)';
COMMENT ON COLUMN public.service_cards.shadow_enabled IS 'Controla se o efeito sombra está ativo';
COMMENT ON COLUMN public.service_cards.icon_filter_enabled IS 'Controla se deve aplicar filtro branco no ícone';