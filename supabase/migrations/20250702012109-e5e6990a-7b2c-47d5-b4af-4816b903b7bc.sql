-- Atualizar a view para incluir todos os campos necessários
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
  t.id as tag_id,
  t.name as tag_name
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.is_active = true;