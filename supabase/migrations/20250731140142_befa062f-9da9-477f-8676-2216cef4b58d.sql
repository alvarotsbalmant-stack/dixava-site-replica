-- Drop the existing view and recreate with all necessary columns
DROP VIEW IF EXISTS view_product_with_tags CASCADE;

-- Recreate the view with all columns the frontend expects
CREATE VIEW view_product_with_tags AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.description AS product_description,
    p.price AS product_price,
    p.image AS product_image,
    p.stock AS product_stock,
    p.badge_text,
    p.badge_color,
    p.badge_visible,
    p.specifications AS product_specifications,
    p.images AS product_images,
    p.created_at,
    p.updated_at,
    p.is_active,
    p.is_featured,
    p.product_type,  -- Adding the missing column
    pt.tag_id,
    t.name AS tag_name
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.is_active = true;