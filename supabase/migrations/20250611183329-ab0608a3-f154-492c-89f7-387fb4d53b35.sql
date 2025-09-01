
-- Inserir a página Xbox3 na tabela pages
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
  'xbox3',
  'Página dedicada aos produtos Xbox - consoles, jogos e acessórios',
  true,
  '{"primaryColor": "#107C10", "secondaryColor": "#3A3A3A"}',
  now(),
  now()
);

-- Inserir as seções da página Xbox3 na tabela page_layout_items
-- Primeiro, precisamos obter o ID da página Xbox3 que acabamos de criar
WITH xbox_page AS (
  SELECT id FROM public.pages WHERE slug = 'xbox3'
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
  xbox_page.id,
  unnest(ARRAY['xbox3_hero', 'xbox3_featured', 'xbox3_news', 'xbox3_accessories']),
  unnest(ARRAY['Hero Xbox', 'Produtos em Destaque', 'Notícias Xbox', 'Acessórios Xbox']),
  unnest(ARRAY[1, 2, 3, 4]),
  true,
  unnest(ARRAY['hero', 'products', 'news', 'products']),
  unnest(ARRAY[
    '{"type": "hero", "title": "Xbox", "subtitle": "A nova geração de jogos está aqui", "backgroundImage": "/lovable-uploads/136bb734-dc02-4a5a-a4b8-300ce6d655b1.png", "ctaText": "Explorar Xbox", "ctaLink": "/xbox"}',
    '{"type": "products", "title": "Produtos em Destaque", "subtitle": "Os melhores jogos e consoles Xbox", "filter": {"tagIds": ["28047409-2ad5-4cea-bde3-803d42e49fc6"]}, "maxProducts": 8, "showViewAll": true}',
    '{"type": "news", "title": "Últimas Notícias", "subtitle": "Fique por dentro das novidades do mundo Xbox", "category": "xbox", "maxArticles": 6}',
    '{"type": "products", "title": "Acessórios Xbox", "subtitle": "Controles, headsets e mais acessórios", "filter": {"tagIds": ["43f59a81-8dd1-460b-be1e-a0187e743075"]}, "maxProducts": 8, "showViewAll": true}'
  ]::jsonb[]),
  now(),
  now()
FROM xbox_page;
