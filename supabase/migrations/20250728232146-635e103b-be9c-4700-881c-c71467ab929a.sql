-- Corrigir a view para incluir os campos brand e category que estavam faltando
DROP VIEW IF EXISTS view_product_with_tags;

CREATE VIEW view_product_with_tags AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.brand,  -- Campo brand estava faltando
    p.category,  -- Campo category estava faltando
    p.description AS product_description,
    p.price AS product_price,
    p.stock AS product_stock,
    p.image AS product_image,
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
    p.parent_product_id,
    p.is_master_product,
    p.product_type,
    p.sku_code,
    p.variant_attributes,
    p.sort_order,
    p.available_variants,
    p.master_slug,
    p.inherit_from_master,
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
    p.uti_pro_enabled,
    p.uti_pro_type,
    p.uti_pro_value,
    p.uti_pro_custom_price,
    t.id AS tag_id,
    t.name AS tag_name
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.is_active = true;