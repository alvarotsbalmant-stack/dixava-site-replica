
-- First drop the existing view
DROP VIEW IF EXISTS view_product_with_tags;

-- Then create the new view with the badge columns
CREATE VIEW view_product_with_tags AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.description as product_description,
  p.price as product_price,
  p.image as product_image,
  p.stock as product_stock,
  p.badge_text,
  p.badge_color,
  p.badge_visible,
  pt.tag_id,
  t.name as tag_name
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id;
