
-- Inserir a página Xbox4 na tabela pages
INSERT INTO public.pages (
  title,
  slug,
  description,
  is_active,
  theme,
  created_at,
  updated_at
) VALUES (
  'Xbox',
  'xbox4',
  'Página dedicada aos produtos e notícias do universo Xbox.',
  true,
  '{"primaryColor": "#107C10", "secondaryColor": "#3A3A3A"}'::jsonb,
  now(),
  now()
);

-- Inserir as seções da página Xbox4 na tabela page_layout_items
-- Primeiro, precisamos obter o ID da página Xbox4 que acabamos de criar
WITH xbox4_page AS (
  SELECT id FROM public.pages WHERE slug = 'xbox4'
)
INSERT INTO public.page_layout_items (
  page_id,
  section_key,
  title,
  display_order,
  is_visible,
  section_type,
  section_config,
  created_at,
  updated_at
) 
SELECT 
  xbox4_page.id,
  unnest(ARRAY['xbox4_hero_banner', 'xbox4_featured_products', 'xbox4_games_section', 'xbox4_accessories_section', 'xbox4_news_section']),
  unnest(ARRAY['Hero Xbox', 'Consoles Xbox', 'Jogos em Alta', 'Acessórios Xbox', 'Notícias & Trailers']),
  unnest(ARRAY[1, 2, 3, 4, 5]),
  true,
  unnest(ARRAY['hero', 'products', 'products', 'products', 'news']),
  unnest(ARRAY[
    '{"title": "POWER YOUR DREAMS", "subtitle": "Entre na próxima geração de jogos com Xbox Series X|S", "background_image": "/lovable-uploads/136bb734-dc02-4a5a-a4b8-300ce6d655b1.png", "primary_button_text": "EXPLORAR CONSOLES", "secondary_button_text": "VER JOGOS"}',
    '{"title": "CONSOLES XBOX", "subtitle": "Desempenho inigualável para a nova geração de jogos. Escolha o console Xbox perfeito para sua experiência.", "product_tags": ["xbox", "console"], "max_products": 2}',
    '{"title": "JOGOS EM ALTA", "subtitle": "Os títulos mais populares para Xbox. De aventuras épicas a competições intensas, encontre seu próximo jogo favorito.", "product_tags": ["xbox", "jogo"], "max_products": 3}',
    '{"title": "ACESSÓRIOS XBOX", "subtitle": "Eleve sua experiência de jogo com acessórios oficiais Xbox. Controles, headsets e muito mais para o seu setup.", "product_tags": ["xbox", "acessorio"], "max_products": 1}',
    '{"title": "NOTÍCIAS & TRAILERS", "subtitle": "Fique por dentro das últimas novidades, lançamentos e atualizações do universo Xbox.", "news_items": [{"title": "Halo Infinite: Nova Temporada", "description": "Descubra as novidades da nova temporada de Halo Infinite", "image": "", "type": "trailer"}, {"title": "Xbox Game Pass: Novos Jogos", "description": "Confira os novos títulos que chegaram ao Game Pass", "image": "", "type": "news"}, {"title": "Xbox Showcase 2025: O que esperar", "description": "Prepare-se para os grandes anúncios do Xbox Showcase", "image": "", "type": "event"}]}'
  ]::jsonb[]),
  now(),
  now()
FROM xbox4_page;

-- Consultar o UUID da página criada para referência
SELECT id, title, slug FROM public.pages WHERE slug = 'xbox4';
