-- Verificar e garantir que todos os campos SKU estão corretos na tabela products
-- Adicionar campos que possam estar faltando e garantir defaults corretos

-- Verificar se o campo product_type tem o constraint correto
ALTER TABLE public.products 
ALTER COLUMN product_type SET DEFAULT 'simple';

-- Adicionar constraint para product_type se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'products_product_type_check'
    ) THEN
        ALTER TABLE public.products 
        ADD CONSTRAINT products_product_type_check 
        CHECK (product_type IN ('simple', 'master', 'sku'));
    END IF;
END $$;

-- Garantir que is_master_product tem default correto
ALTER TABLE public.products 
ALTER COLUMN is_master_product SET DEFAULT false;

-- Garantir que sort_order tem default correto
ALTER TABLE public.products 
ALTER COLUMN sort_order SET DEFAULT 0;

-- Garantir que available_variants é inicializado corretamente
UPDATE public.products 
SET available_variants = '{}'::jsonb 
WHERE available_variants IS NULL AND product_type = 'master';

-- Garantir que variant_attributes é inicializado corretamente
UPDATE public.products 
SET variant_attributes = '{}'::jsonb 
WHERE variant_attributes IS NULL AND product_type = 'sku';

-- Criar índices para melhorar performance das consultas SKU
CREATE INDEX IF NOT EXISTS idx_products_parent_product_id ON public.products(parent_product_id);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_is_master_product ON public.products(is_master_product);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products(sort_order);

-- Atualizar a view para garantir que todos os campos SKU estão incluídos
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
  -- Campos SKU necessários
  p.parent_product_id,
  p.is_master_product,
  p.product_type,
  p.sku_code,
  p.variant_attributes,
  p.sort_order,
  p.available_variants,
  p.master_slug,
  p.inherit_from_master,
  -- Novos campos expandidos
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