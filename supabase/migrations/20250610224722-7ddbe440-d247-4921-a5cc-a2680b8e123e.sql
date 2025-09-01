
-- Step 1: Create missing pages (PC Gaming, Retro Gaming, Área Geek)
INSERT INTO pages (slug, title, description, theme, meta_title, meta_description, keywords, layout, header_style, footer_style, is_active)
VALUES 
  (
    'pc-gaming',
    'PC Gaming',
    'O melhor do PC Gaming: componentes, periféricos e jogos para verdadeiros entusiastas',
    '{
      "primaryColor": "#FF6600",
      "secondaryColor": "#333333",
      "accentColor": "#FF8533",
      "backgroundColor": "#FFFFFF",
      "textColor": "#333333",
      "fontFamily": "Inter, sans-serif",
      "borderRadius": "8px"
    }'::jsonb,
    'PC Gaming - Componentes, Periféricos e Jogos | UTI dos Games',
    'Descubra o mundo PC Gaming com componentes de alta performance, periféricos profissionais e os melhores jogos.',
    ARRAY['pc gaming', 'componentes', 'perifericos', 'steam', 'hardware'],
    'wide',
    'default',
    'default',
    true
  ),
  (
    'retro-gaming',
    'Xbox 360/PS2',
    'Nostalgia em estado puro: jogos clássicos do Xbox 360 e PlayStation 2',
    '{
      "primaryColor": "#8B4513",
      "secondaryColor": "#D2691E",
      "accentColor": "#CD853F",
      "backgroundColor": "#FFFFFF",
      "textColor": "#333333",
      "fontFamily": "Inter, sans-serif",
      "borderRadius": "8px"
    }'::jsonb,
    'Xbox 360 e PS2 - Jogos Clássicos e Nostalgia | UTI dos Games',
    'Reviva os clássicos com nossa seleção de jogos do Xbox 360 e PlayStation 2. Nostalgia garantida!',
    ARRAY['xbox 360', 'ps2', 'playstation 2', 'retro', 'classicos', 'nostalgia'],
    'standard',
    'default',
    'default',
    true
  ),
  (
    'area-geek',
    'Área Geek',
    'Universo geek completo: colecionáveis, action figures, merchandise e cultura pop',
    '{
      "primaryColor": "#9C27B0",
      "secondaryColor": "#673AB7",
      "accentColor": "#E91E63",
      "backgroundColor": "#FFFFFF",
      "textColor": "#333333",
      "fontFamily": "Inter, sans-serif",
      "borderRadius": "8px"
    }'::jsonb,
    'Área Geek - Colecionáveis, Action Figures e Merchandise | UTI dos Games',
    'Explore o universo geek com colecionáveis exclusivos, action figures, merchandise e muito mais da cultura pop!',
    ARRAY['geek', 'colecionaveis', 'action figures', 'merchandise', 'cultura pop', 'anime'],
    'wide',
    'colored',
    'extended',
    true
  );

-- Step 2: Remove any existing conflicting sections
DELETE FROM page_layout_items WHERE page_id IN (
  SELECT id FROM pages WHERE slug IN ('xbox', 'playstation', 'nintendo', 'pc-gaming', 'retro-gaming', 'area-geek')
);

-- Step 3: Insert all sections from customPlatformPages.ts
-- Xbox sections
INSERT INTO page_layout_items (page_id, section_key, title, display_order, is_visible, section_type, section_config)
SELECT 
  p.id,
  'xbox-hero',
  'Banner Principal Xbox',
  1,
  true,
  'banner',
  '{
    "type": "hero",
    "layout": "full-width",
    "title": "Xbox Series X|S",
    "subtitle": "Poder. Velocidade. Compatibilidade.",
    "description": "Experimente a próxima geração de jogos com carregamento ultrarrápido, mundos mais ricos e jogabilidade aprimorada.",
    "ctaText": "Explorar Consoles",
    "ctaLink": "/categoria/xbox-consoles",
    "backgroundType": "gradient",
    "contentPosition": "left",
    "textAlign": "left",
    "overlay": {
      "color": "rgba(0, 0, 0, 0.3)",
      "opacity": 0.3
    }
  }'::jsonb
FROM pages p WHERE p.slug = 'xbox'
UNION ALL
SELECT 
  p.id,
  'xbox-featured',
  'Produtos em Destaque',
  2,
  true,
  'products',
  '{
    "type": "featured",
    "title": "Destaques Xbox",
    "subtitle": "Os melhores produtos Xbox em oferta especial",
    "filter": {
      "tagIds": ["xbox", "microsoft"],
      "featured": true,
      "limit": 8
    },
    "columns": 4,
    "showPrices": true,
    "showBadges": true,
    "cardStyle": "detailed"
  }'::jsonb
FROM pages p WHERE p.slug = 'xbox'
UNION ALL
SELECT 
  p.id,
  'xbox-news',
  'Notícias Xbox',
  3,
  true,
  'news',
  '{
    "layout": "grid",
    "articles": [
      {
        "id": "xbox-news-1",
        "title": "Xbox Game Pass Ultimate: Novos Jogos em Janeiro",
        "category": "Game Pass",
        "excerpt": "Descubra os novos títulos que chegaram ao Xbox Game Pass Ultimate este mês, incluindo grandes lançamentos e indies incríveis.",
        "imageUrl": "/news/xbox-gamepass-january.jpg",
        "publishDate": "2025-01-15",
        "readTime": "3 min",
        "tags": ["Game Pass", "Lançamentos", "Xbox"],
        "link": "/noticias/xbox-gamepass-janeiro-2025"
      }
    ]
  }'::jsonb
FROM pages p WHERE p.slug = 'xbox'
UNION ALL
SELECT 
  p.id,
  'xbox-accessories',
  'Acessórios Xbox',
  4,
  true,
  'products',
  '{
    "type": "grid",
    "title": "Acessórios Oficiais",
    "subtitle": "Controles, headsets e mais para sua experiência Xbox",
    "filter": {
      "tagIds": ["xbox", "acessorio"],
      "limit": 6
    },
    "columns": 3,
    "showPrices": true,
    "showBadges": true,
    "cardStyle": "compact"
  }'::jsonb
FROM pages p WHERE p.slug = 'xbox';

-- PlayStation sections
INSERT INTO page_layout_items (page_id, section_key, title, display_order, is_visible, section_type, section_config)
SELECT 
  p.id,
  'ps-hero',
  'Banner Principal PlayStation',
  1,
  true,
  'banner',
  '{
    "type": "hero",
    "layout": "full-width",
    "title": "PlayStation 5",
    "subtitle": "Jogue Sem Limites",
    "description": "Experimente carregamento ultrarrápido com o SSD personalizado, feedback háptico mais profundo e áudio 3D imersivo.",
    "ctaText": "Descobrir PS5",
    "ctaLink": "/categoria/playstation-consoles",
    "backgroundType": "gradient",
    "contentPosition": "center",
    "textAlign": "center",
    "overlay": {
      "color": "rgba(0, 55, 145, 0.2)",
      "opacity": 0.2
    }
  }'::jsonb
FROM pages p WHERE p.slug = 'playstation'
UNION ALL
SELECT 
  p.id,
  'ps-exclusives',
  'Jogos Exclusivos',
  2,
  true,
  'products',
  '{
    "type": "carousel",
    "title": "Exclusivos PlayStation",
    "subtitle": "Experiências que só você encontra no PlayStation",
    "filter": {
      "tagIds": ["playstation", "exclusivo"],
      "limit": 10
    },
    "showPrices": true,
    "showBadges": true,
    "cardStyle": "detailed"
  }'::jsonb
FROM pages p WHERE p.slug = 'playstation'
UNION ALL
SELECT 
  p.id,
  'ps-news',
  'Notícias PlayStation',
  3,
  true,
  'news',
  '{
    "layout": "list",
    "articles": [
      {
        "id": "ps-news-1",
        "title": "God of War Ragnarök: DLC Valhalla Já Disponível",
        "category": "Exclusivos",
        "excerpt": "O aguardado DLC gratuito de God of War Ragnarök está disponível, trazendo novas aventuras com Kratos em Valhalla.",
        "imageUrl": "/news/god-of-war-valhalla.jpg",
        "publishDate": "2025-01-14",
        "readTime": "4 min",
        "tags": ["God of War", "DLC", "Exclusivo"],
        "link": "/noticias/god-of-war-ragnarok-valhalla"
      }
    ]
  }'::jsonb
FROM pages p WHERE p.slug = 'playstation';

-- Nintendo sections
INSERT INTO page_layout_items (page_id, section_key, title, display_order, is_visible, section_type, section_config)
SELECT 
  p.id,
  'nintendo-hero',
  'Banner Principal Nintendo',
  1,
  true,
  'banner',
  '{
    "type": "hero",
    "layout": "split",
    "title": "Nintendo Switch",
    "subtitle": "Diversão Para Todos, Em Qualquer Lugar",
    "description": "Jogue em casa ou em movimento com o console híbrido que revolucionou os games.",
    "ctaText": "Explorar Nintendo",
    "ctaLink": "/categoria/nintendo-consoles",
    "backgroundType": "gradient",
    "contentPosition": "left",
    "textAlign": "left"
  }'::jsonb
FROM pages p WHERE p.slug = 'nintendo'
UNION ALL
SELECT 
  p.id,
  'nintendo-family',
  'Jogos para Família',
  2,
  true,
  'products',
  '{
    "type": "grid",
    "title": "Diversão em Família",
    "subtitle": "Jogos perfeitos para jogar com toda a família",
    "filter": {
      "tagIds": ["nintendo", "familia"],
      "limit": 8
    },
    "columns": 4,
    "showPrices": true,
    "showBadges": true,
    "cardStyle": "detailed"
  }'::jsonb
FROM pages p WHERE p.slug = 'nintendo';

-- PC Gaming sections
INSERT INTO page_layout_items (page_id, section_key, title, display_order, is_visible, section_type, section_config)
SELECT 
  p.id,
  'pc-hero',
  'Banner Principal PC Gaming',
  1,
  true,
  'banner',
  '{
    "type": "hero",
    "layout": "overlay",
    "title": "PC Master Race",
    "subtitle": "Performance Sem Limites",
    "description": "Monte seu setup dos sonhos com os melhores componentes e periféricos para PC Gaming.",
    "ctaText": "Explorar Componentes",
    "ctaLink": "/categoria/pc-gaming",
    "backgroundType": "gradient",
    "contentPosition": "center",
    "textAlign": "center"
  }'::jsonb
FROM pages p WHERE p.slug = 'pc-gaming'
UNION ALL
SELECT 
  p.id,
  'pc-components',
  'Componentes',
  2,
  true,
  'products',
  '{
    "type": "grid",
    "title": "Componentes de Alta Performance",
    "subtitle": "Placas de vídeo, processadores e mais",
    "filter": {
      "tagIds": ["pc", "componente"],
      "limit": 6
    },
    "columns": 3,
    "showPrices": true,
    "showBadges": true,
    "cardStyle": "detailed"
  }'::jsonb
FROM pages p WHERE p.slug = 'pc-gaming';

-- Retro Gaming sections
INSERT INTO page_layout_items (page_id, section_key, title, display_order, is_visible, section_type, section_config)
SELECT 
  p.id,
  'retro-hero',
  'Banner Principal Retrô',
  1,
  true,
  'banner',
  '{
    "type": "hero",
    "layout": "full-width",
    "title": "Jogos Clássicos",
    "subtitle": "Xbox 360 & PlayStation 2",
    "description": "Reviva os momentos épicos com nossa coleção de jogos clássicos que marcaram uma geração.",
    "ctaText": "Ver Clássicos",
    "ctaLink": "/categoria/retro-gaming",
    "backgroundType": "gradient",
    "contentPosition": "center",
    "textAlign": "center"
  }'::jsonb
FROM pages p WHERE p.slug = 'retro-gaming'
UNION ALL
SELECT 
  p.id,
  'retro-classics',
  'Clássicos Atemporais',
  2,
  true,
  'products',
  '{
    "type": "grid",
    "title": "Clássicos Atemporais",
    "subtitle": "Os jogos que marcaram uma geração",
    "filter": {
      "tagIds": ["xbox360", "ps2", "classico"],
      "limit": 8
    },
    "columns": 4,
    "showPrices": true,
    "showBadges": true,
    "cardStyle": "compact"
  }'::jsonb
FROM pages p WHERE p.slug = 'retro-gaming';

-- Área Geek sections
INSERT INTO page_layout_items (page_id, section_key, title, display_order, is_visible, section_type, section_config)
SELECT 
  p.id,
  'geek-hero',
  'Banner Principal Geek',
  1,
  true,
  'banner',
  '{
    "type": "hero",
    "layout": "split",
    "title": "Área Geek",
    "subtitle": "Sua Paixão, Nossa Especialidade",
    "description": "Descubra colecionáveis únicos, action figures exclusivos e merchandise oficial dos seus universos favoritos.",
    "ctaText": "Explorar Colecionáveis",
    "ctaLink": "/categoria/area-geek",
    "backgroundType": "gradient",
    "contentPosition": "right",
    "textAlign": "right"
  }'::jsonb
FROM pages p WHERE p.slug = 'area-geek'
UNION ALL
SELECT 
  p.id,
  'geek-collectibles',
  'Colecionáveis',
  2,
  true,
  'products',
  '{
    "type": "featured",
    "title": "Colecionáveis Exclusivos",
    "subtitle": "Itens únicos para verdadeiros colecionadores",
    "filter": {
      "tagIds": ["geek", "colecionavel"],
      "featured": true,
      "limit": 6
    },
    "columns": 3,
    "showPrices": true,
    "showBadges": true,
    "cardStyle": "detailed"
  }'::jsonb
FROM pages p WHERE p.slug = 'area-geek';
