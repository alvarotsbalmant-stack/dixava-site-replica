
-- Adicionar novos campos JSONB na tabela products para configuração completa da página
ALTER TABLE public.products 
ADD COLUMN product_videos JSONB NULL,
ADD COLUMN product_faqs JSONB NULL,
ADD COLUMN product_highlights JSONB NULL,
ADD COLUMN reviews_config JSONB NULL,
ADD COLUMN trust_indicators JSONB NULL,
ADD COLUMN manual_related_products JSONB NULL,
ADD COLUMN breadcrumb_config JSONB NULL,
ADD COLUMN product_descriptions JSONB NULL,
ADD COLUMN delivery_config JSONB NULL,
ADD COLUMN display_config JSONB NULL;

-- Comentários para documentar a estrutura de cada campo
COMMENT ON COLUMN public.products.product_videos IS 'Array de objetos para vídeos do produto - estrutura: [{"id": "uuid", "title": "string", "url": "string", "thumbnail": "string", "duration": "string", "type": "youtube|vimeo|mp4", "order": number, "is_featured": boolean}]';

COMMENT ON COLUMN public.products.product_faqs IS 'Array de objetos para FAQ personalizado - estrutura: [{"id": "uuid", "question": "string", "answer": "string", "order": number, "is_visible": boolean, "category": "string"}]';

COMMENT ON COLUMN public.products.product_highlights IS 'Array de características principais - estrutura: [{"id": "uuid", "text": "string", "icon": "string", "order": number, "is_featured": boolean}]';

COMMENT ON COLUMN public.products.reviews_config IS 'Configurações de avaliações - estrutura: {"enabled": boolean, "show_rating": boolean, "show_count": boolean, "allow_reviews": boolean, "custom_rating": {"value": number, "count": number, "use_custom": boolean}}';

COMMENT ON COLUMN public.products.trust_indicators IS 'Garantias e indicadores de confiança - estrutura: [{"id": "uuid", "title": "string", "description": "string", "icon": "string", "color": "string", "order": number, "is_visible": boolean}]';

COMMENT ON COLUMN public.products.manual_related_products IS 'Produtos relacionados selecionados manualmente - estrutura: [{"product_id": "uuid", "relationship_type": "string", "order": number, "custom_title": "string"}]';

COMMENT ON COLUMN public.products.breadcrumb_config IS 'Configuração de navegação breadcrumb - estrutura: {"custom_path": [{"label": "string", "url": "string"}], "use_custom": boolean, "show_breadcrumb": boolean}';

COMMENT ON COLUMN public.products.product_descriptions IS 'Múltiplas descrições - estrutura: {"short": "string", "detailed": "string", "technical": "string", "marketing": "string"}';

COMMENT ON COLUMN public.products.delivery_config IS 'Configurações de entrega - estrutura: {"custom_shipping_time": "string", "shipping_regions": ["string"], "express_available": boolean, "pickup_locations": [{"name": "string", "address": "string", "hours": "string"}]}';

COMMENT ON COLUMN public.products.display_config IS 'Controles de exibição - estrutura: {"show_stock_counter": boolean, "show_view_counter": boolean, "custom_view_count": number, "show_urgency_banner": boolean, "urgency_text": "string", "show_social_proof": boolean, "social_proof_text": "string"}';

-- Atualizar o trigger de updated_at para incluir os novos campos
-- (O trigger já existe e funcionará automaticamente com os novos campos)

-- Atualizar a view view_product_with_tags para incluir os novos campos
DROP VIEW IF EXISTS public.view_product_with_tags;

CREATE VIEW public.view_product_with_tags AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.description as product_description,
  p.price as product_price,
  p.stock as product_stock,
  p.image as product_image,
  p.additional_images,
  p.sizes,
  p.colors,
  p.pro_price,
  p.list_price,
  p.badge_text,
  p.badge_color,
  p.badge_visible,
  p.specifications,
  p.technical_specs,
  p.product_features,
  p.shipping_weight,
  p.free_shipping,
  p.meta_title,
  p.meta_description,
  p.slug,
  p.is_active,
  p.is_featured,
  p.created_at,
  p.updated_at,
  -- Novos campos adicionados
  p.product_videos,
  p.product_faqs,
  p.product_highlights,
  p.reviews_config,
  p.trust_indicators,
  p.manual_related_products,
  p.breadcrumb_config,
  p.product_descriptions,
  p.delivery_config,
  p.display_config,
  -- Tags
  t.id as tag_id,
  t.name as tag_name
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.is_active = true;

-- Adicionar índices para melhorar performance nas consultas JSONB
CREATE INDEX IF NOT EXISTS idx_products_product_videos ON public.products USING GIN (product_videos);
CREATE INDEX IF NOT EXISTS idx_products_product_faqs ON public.products USING GIN (product_faqs);
CREATE INDEX IF NOT EXISTS idx_products_reviews_config ON public.products USING GIN (reviews_config);
CREATE INDEX IF NOT EXISTS idx_products_display_config ON public.products USING GIN (display_config);

-- Inserir dados de exemplo para demonstrar as estruturas (opcional)
-- Você pode descomentar essas linhas se quiser ver exemplos funcionais

/*
-- Exemplo de produto_videos
UPDATE public.products 
SET product_videos = '[
  {
    "id": "video-1",
    "title": "Trailer Oficial",
    "url": "https://youtube.com/watch?v=example",
    "thumbnail": "https://img.youtube.com/vi/example/maxresdefault.jpg",
    "duration": "2:30",
    "type": "youtube",
    "order": 1,
    "is_featured": true
  }
]'::jsonb
WHERE id = (SELECT id FROM public.products LIMIT 1);

-- Exemplo de reviews_config
UPDATE public.products 
SET reviews_config = '{
  "enabled": true,
  "show_rating": true,
  "show_count": true,
  "allow_reviews": true,
  "custom_rating": {
    "value": 4.8,
    "count": 127,
    "use_custom": true
  }
}'::jsonb
WHERE id = (SELECT id FROM public.products LIMIT 1);
*/
