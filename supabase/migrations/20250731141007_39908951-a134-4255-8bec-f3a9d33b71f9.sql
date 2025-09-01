-- Comprehensive fix for idasproduct_id error
-- This migration will clean up any remnants causing the error

-- First, let's check if there are any triggers or functions that might be causing this
-- Drop and recreate the view completely
DROP VIEW IF EXISTS view_product_with_tags CASCADE;

-- Create a completely new and robust view without any problematic references
CREATE VIEW view_product_with_tags AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image,
    p.images,
    p.stock,
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
    COALESCE(
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), 
        ARRAY[]::text[]
    ) as tags,
    COALESCE(
        ARRAY_AGG(DISTINCT t.id) FILTER (WHERE t.id IS NOT NULL), 
        ARRAY[]::uuid[]
    ) as tag_ids
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.description, p.price, p.image, p.images, p.stock, 
         p.badge_text, p.badge_color, p.badge_visible, p.specifications, 
         p.created_at, p.updated_at, p.is_active, p.is_featured, p.product_type,
         p.brand, p.category, p.platform, p.condition, p.promotional_price,
         p.discount_percentage, p.pix_discount_percentage, p.uti_pro_price,
         p.installment_options, p.rating_average, p.rating_count, p.slug,
         p.meta_title, p.meta_description, p.pro_price, p.pro_discount_percent,
         p.list_price, p.new_price, p.digital_price, p.discount_price,
         p.uti_pro_enabled, p.uti_pro_type, p.uti_pro_value, p.uti_pro_custom_price;

-- Grant proper permissions
GRANT SELECT ON view_product_with_tags TO authenticated, anon, service_role;

-- Add a comment for documentation
COMMENT ON VIEW view_product_with_tags IS 'Comprehensive products view with tags aggregated - Fixed for idasproduct_id issue';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON products(is_active, is_featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_tags_lookup ON product_tags(product_id, tag_id);