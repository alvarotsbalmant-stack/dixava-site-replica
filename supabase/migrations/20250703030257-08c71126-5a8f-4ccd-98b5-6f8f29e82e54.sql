-- Implementação do Sistema de SKUs - Fase 1: Estrutura do Banco de Dados

-- 1. Adicionar campos à tabela products para sistema de SKUs
ALTER TABLE products ADD COLUMN parent_product_id UUID REFERENCES products(id);
ALTER TABLE products ADD COLUMN is_master_product BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN product_type VARCHAR(20) DEFAULT 'simple';
ALTER TABLE products ADD COLUMN sku_code VARCHAR(100);
ALTER TABLE products ADD COLUMN variant_attributes JSONB;
ALTER TABLE products ADD COLUMN sort_order INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN available_variants JSONB;
ALTER TABLE products ADD COLUMN master_slug VARCHAR(255);
ALTER TABLE products ADD COLUMN inherit_from_master JSONB;

-- Adicionar comentários para documentação
COMMENT ON COLUMN products.parent_product_id IS 'ID do produto mestre (para SKUs)';
COMMENT ON COLUMN products.is_master_product IS 'Indica se é um produto mestre';
COMMENT ON COLUMN products.product_type IS 'Tipo: simple, master ou sku';
COMMENT ON COLUMN products.sku_code IS 'Código único do SKU';
COMMENT ON COLUMN products.variant_attributes IS 'Atributos da variante (ex: {"platform": "Xbox"})';
COMMENT ON COLUMN products.sort_order IS 'Ordem de exibição dos SKUs';
COMMENT ON COLUMN products.available_variants IS 'Variantes disponíveis (para produtos mestres)';
COMMENT ON COLUMN products.master_slug IS 'Slug base para SEO';
COMMENT ON COLUMN products.inherit_from_master IS 'Configuração de herança de campos';

-- 2. Criar índices essenciais para performance
CREATE INDEX idx_products_parent_product_id ON products(parent_product_id);
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_master_listing ON products(product_type, is_active, is_featured) 
  WHERE product_type IN ('simple', 'master');
CREATE INDEX idx_products_sku_code ON products(sku_code) WHERE sku_code IS NOT NULL;
CREATE INDEX idx_products_sort_order ON products(parent_product_id, sort_order) 
  WHERE parent_product_id IS NOT NULL;

-- 3. Adicionar constraints para integridade dos dados
ALTER TABLE products ADD CONSTRAINT chk_product_type 
  CHECK (product_type IN ('simple', 'master', 'sku'));

ALTER TABLE products ADD CONSTRAINT chk_sku_has_parent 
  CHECK (
    (product_type = 'sku' AND parent_product_id IS NOT NULL) OR 
    (product_type != 'sku')
  );

ALTER TABLE products ADD CONSTRAINT chk_master_no_parent 
  CHECK (
    (product_type = 'master' AND parent_product_id IS NULL) OR 
    (product_type != 'master')
  );

ALTER TABLE products ADD CONSTRAINT uk_products_sku_code 
  UNIQUE (sku_code);

-- 4. Atualizar produtos existentes
UPDATE products SET product_type = 'simple' WHERE product_type IS NULL;
UPDATE products SET is_master_product = false WHERE is_master_product IS NULL;

-- 5. Atualizar view para incluir novos campos
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
  -- Novos campos SKU
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
  -- Tags
  t.id as tag_id,
  t.name as tag_name
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.is_active = true;