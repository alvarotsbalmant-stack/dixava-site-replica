-- Adicionar campos para configuração de preços UTI Pro
ALTER TABLE products 
ADD COLUMN uti_pro_enabled BOOLEAN DEFAULT false,
ADD COLUMN uti_pro_type VARCHAR(20) DEFAULT 'percentage' CHECK (uti_pro_type IN ('percentage', 'fixed')),
ADD COLUMN uti_pro_value NUMERIC DEFAULT 10.0,
ADD COLUMN uti_pro_custom_price NUMERIC DEFAULT NULL;

-- Comentários para documentação
COMMENT ON COLUMN products.uti_pro_enabled IS 'Se o preço UTI Pro está ativo para este produto';
COMMENT ON COLUMN products.uti_pro_type IS 'Tipo de desconto: percentage ou fixed';
COMMENT ON COLUMN products.uti_pro_value IS 'Valor da porcentagem de desconto (ex: 10.0 para 10%)';
COMMENT ON COLUMN products.uti_pro_custom_price IS 'Preço fixo UTI Pro (usado quando type = fixed)';

-- Atualizar view para incluir novos campos
DROP VIEW IF EXISTS view_product_with_tags;

CREATE VIEW view_product_with_tags AS
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
  -- Campos SKU existentes
  p.parent_product_id,
  p.is_master_product,
  p.product_type,
  p.sku_code,
  p.variant_attributes,
  p.sort_order,
  p.available_variants,
  p.master_slug,
  p.inherit_from_master,
  -- Campos expandidos existentes
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
  -- Novos campos UTI Pro configuráveis
  p.uti_pro_enabled,
  p.uti_pro_type,
  p.uti_pro_value,
  p.uti_pro_custom_price,
  -- Tags
  t.id as tag_id,
  t.name as tag_name
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.is_active = true;