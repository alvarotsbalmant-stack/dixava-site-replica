-- Reverter mudanças problemáticas e recriar view corretamente
-- Drop the current problematic view
DROP VIEW IF EXISTS view_product_with_tags CASCADE;

-- Recreate the view with the correct structure that was working before
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
    p.specifications,
    p.created_at,
    p.updated_at,
    p.is_active,
    p.is_featured,
    p.product_type,
    p.brand,
    p.category,
    p.platform,
    p.condition,
    p.promotional_price,
    p.discount_percentage,
    p.pix_discount_percentage,
    p.uti_pro_price,
    p.installment_options,
    p.rating_average,
    p.rating_count,
    p.slug,
    p.meta_title,
    p.meta_description,
    p.pro_price,
    p.pro_discount_percent,
    p.list_price,
    p.new_price,
    p.digital_price,
    p.discount_price,
    p.uti_pro_enabled,
    p.uti_pro_type,
    p.uti_pro_value,
    p.uti_pro_custom_price,
    p.parent_product_id,
    p.is_master_product,
    p.sku_code,
    p.variant_attributes,
    p.sort_order,
    p.available_variants,
    p.master_slug,
    p.inherit_from_master,
    p.additional_images,
    p.colors,
    p.sizes,
    p.technical_specs,
    p.product_features,
    p.shipping_weight,
    p.free_shipping,
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
    -- Tags relacionadas
    t.id as tag_id,
    t.name as tag_name
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.is_active = true;

-- Grant proper permissions
GRANT SELECT ON view_product_with_tags TO authenticated, anon, service_role;

-- Add comment for documentation
COMMENT ON VIEW view_product_with_tags IS 'Products view with tags - Reverted to working structure';