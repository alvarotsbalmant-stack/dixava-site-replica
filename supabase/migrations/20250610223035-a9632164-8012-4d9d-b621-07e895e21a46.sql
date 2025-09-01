
-- Update existing pages with data from customPlatformPages.ts
UPDATE pages SET
  title = 'Xbox',
  description = 'Descubra o poder do Xbox: consoles de última geração, jogos exclusivos e Game Pass',
  theme = '{
    "primaryColor": "#107C10",
    "secondaryColor": "#3A3A3A",
    "accentColor": "#0E6B0E"
  }'::jsonb,
  meta_title = 'Xbox - Consoles, Jogos e Acessórios | UTI dos Games',
  meta_description = 'Explore o universo Xbox com consoles Series X|S, jogos exclusivos, Game Pass e acessórios oficiais. A melhor experiência gaming está aqui!',
  keywords = ARRAY['xbox', 'xbox series x', 'xbox series s', 'game pass', 'microsoft', 'consoles'],
  layout = 'wide',
  header_style = 'transparent',
  footer_style = 'default',
  updated_at = now()
WHERE slug = 'xbox';

UPDATE pages SET
  title = 'PlayStation',
  description = 'Entre no universo PlayStation: PS5, jogos exclusivos e experiências únicas',
  theme = '{
    "primaryColor": "#003791",
    "secondaryColor": "#0070D1",
    "accentColor": "#00439C"
  }'::jsonb,
  meta_title = 'PlayStation - PS5, Jogos Exclusivos e Acessórios | UTI dos Games',
  meta_description = 'Descubra o mundo PlayStation com PS5, jogos exclusivos incríveis, DualSense e muito mais. Jogue sem limites!',
  keywords = ARRAY['playstation', 'ps5', 'ps4', 'sony', 'dualsense', 'exclusivos'],
  layout = 'wide',
  header_style = 'transparent',
  footer_style = 'default',
  updated_at = now()
WHERE slug = 'playstation';

UPDATE pages SET
  title = 'Nintendo',
  description = 'O mundo mágico da Nintendo: Switch, jogos para toda família e diversão garantida',
  theme = '{
    "primaryColor": "#E60012",
    "secondaryColor": "#0066CC",
    "accentColor": "#FFCC00"
  }'::jsonb,
  meta_title = 'Nintendo - Switch, Jogos Familiares e Diversão | UTI dos Games',
  meta_description = 'Entre no universo Nintendo com Switch, jogos icônicos como Mario e Zelda, e diversão para toda a família!',
  keywords = ARRAY['nintendo', 'switch', 'mario', 'zelda', 'pokemon', 'familia'],
  layout = 'standard',
  header_style = 'colored',
  footer_style = 'extended',
  updated_at = now()
WHERE slug = 'nintendo';

UPDATE pages SET
  title = 'PC Gaming',
  description = 'O melhor do PC Gaming: componentes, periféricos e jogos para verdadeiros entusiastas',
  theme = '{
    "primaryColor": "#FF6600",
    "secondaryColor": "#333333",
    "accentColor": "#FF8533"
  }'::jsonb,
  meta_title = 'PC Gaming - Componentes, Periféricos e Jogos | UTI dos Games',
  meta_description = 'Descubra o mundo PC Gaming com componentes de alta performance, periféricos profissionais e os melhores jogos.',
  keywords = ARRAY['pc gaming', 'componentes', 'perifericos', 'steam', 'hardware'],
  layout = 'wide',
  header_style = 'default',
  footer_style = 'default',
  updated_at = now()
WHERE slug = 'pc-gaming';

UPDATE pages SET
  title = 'Xbox 360/PS2',
  description = 'Nostalgia em estado puro: jogos clássicos do Xbox 360 e PlayStation 2',
  theme = '{
    "primaryColor": "#8B4513",
    "secondaryColor": "#D2691E",
    "accentColor": "#CD853F"
  }'::jsonb,
  meta_title = 'Xbox 360 e PS2 - Jogos Clássicos e Nostalgia | UTI dos Games',
  meta_description = 'Reviva os clássicos com nossa seleção de jogos do Xbox 360 e PlayStation 2. Nostalgia garantida!',
  keywords = ARRAY['xbox 360', 'ps2', 'playstation 2', 'retro', 'classicos', 'nostalgia'],
  layout = 'standard',
  header_style = 'default',
  footer_style = 'default',
  updated_at = now()
WHERE slug = 'retro-gaming';

UPDATE pages SET
  title = 'Área Geek',
  description = 'Universo geek completo: colecionáveis, action figures, merchandise e cultura pop',
  theme = '{
    "primaryColor": "#9C27B0",
    "secondaryColor": "#673AB7",
    "accentColor": "#E91E63"
  }'::jsonb,
  meta_title = 'Área Geek - Colecionáveis, Action Figures e Merchandise | UTI dos Games',
  meta_description = 'Explore o universo geek com colecionáveis exclusivos, action figures, merchandise e muito mais da cultura pop!',
  keywords = ARRAY['geek', 'colecionaveis', 'action figures', 'merchandise', 'cultura pop', 'anime'],
  layout = 'wide',
  header_style = 'colored',
  footer_style = 'extended',
  updated_at = now()
WHERE slug = 'area-geek';
