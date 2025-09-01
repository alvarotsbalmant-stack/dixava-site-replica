-- PLANO DE CORREÇÃO DEFINITIVO
-- 1. Primeiro, vamos dropar a view problemática
DROP VIEW IF EXISTS public.view_product_with_tags;

-- 2. Recriar a view corretamente sem referências problemáticas
CREATE VIEW public.view_product_with_tags AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.description as product_description,
    p.image as product_image,
    p.additional_images,
    p.price as product_price,
    p.pro_price,
    p.list_price,
    p.new_price,
    p.digital_price,
    p.discount_price,
    p.stock as product_stock,
    p.sizes,
    p.colors,
    p.badge_text,
    p.badge_color,
    p.badge_visible,
    p.specifications,
    p.technical_specs,
    p.product_features,
    p.shipping_weight,
    p.free_shipping,
    p.is_active,
    p.is_featured,
    p.promotional_price,
    p.discount_percentage,
    p.pix_discount_percentage,
    p.uti_pro_price,
    p.installment_options,
    p.rating_average,
    p.rating_count,
    p.meta_title,
    p.meta_description,
    p.slug,
    p.brand,
    p.category,
    p.platform,
    p.condition,
    p.pro_discount_percent,
    p.uti_pro_enabled,
    p.uti_pro_value,
    p.uti_pro_type,
    p.uti_pro_custom_price,
    p.parent_product_id,
    p.product_type,
    p.sku_code,
    p.is_master_product,
    p.variant_attributes,
    p.sort_order,
    p.available_variants,
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
    p.master_slug,
    p.created_at,
    p.updated_at,
    t.id as tag_id,
    t.name as tag_name
FROM public.products p
LEFT JOIN public.product_tags pt ON p.id = pt.product_id
LEFT JOIN public.tags t ON pt.tag_id = t.id;

-- 3. Corrigir função problemática que usava idasproduct_id
CREATE OR REPLACE FUNCTION public.get_products_with_tags_corrected(
    include_admin boolean DEFAULT false,
    tag_filter uuid[] DEFAULT NULL,
    limit_count integer DEFAULT NULL
)
RETURNS TABLE(
    product_id uuid,
    product_name text,
    product_description text,
    product_image text,
    additional_images text[],
    product_price numeric,
    pro_price numeric,
    list_price numeric,
    new_price numeric,
    digital_price numeric,
    discount_price numeric,
    product_stock integer,
    sizes text[],
    colors text[],
    badge_text text,
    badge_color text,
    badge_visible boolean,
    specifications jsonb,
    technical_specs jsonb,
    product_features jsonb,
    shipping_weight numeric,
    free_shipping boolean,
    is_active boolean,
    is_featured boolean,
    promotional_price numeric,
    discount_percentage integer,
    pix_discount_percentage integer,
    uti_pro_price numeric,
    installment_options integer,
    rating_average numeric,
    rating_count integer,
    meta_title varchar,
    meta_description text,
    slug varchar,
    brand text,
    category text,
    platform text,
    condition text,
    pro_discount_percent integer,
    uti_pro_enabled boolean,
    uti_pro_value numeric,
    uti_pro_type varchar,
    uti_pro_custom_price numeric,
    parent_product_id uuid,
    product_type varchar,
    sku_code varchar,
    is_master_product boolean,
    variant_attributes jsonb,
    sort_order integer,
    available_variants jsonb,
    inherit_from_master jsonb,
    product_videos jsonb,
    product_faqs jsonb,
    product_highlights jsonb,
    reviews_config jsonb,
    trust_indicators jsonb,
    manual_related_products jsonb,
    breadcrumb_config jsonb,
    product_descriptions jsonb,
    delivery_config jsonb,
    display_config jsonb,
    master_slug varchar,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    tag_id uuid,
    tag_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.image,
        p.additional_images,
        p.price,
        p.pro_price,
        p.list_price,
        p.new_price,
        p.digital_price,
        p.discount_price,
        p.stock,
        p.sizes,
        p.colors,
        p.badge_text,
        p.badge_color,
        p.badge_visible,
        p.specifications,
        p.technical_specs,
        p.product_features,
        p.shipping_weight,
        p.free_shipping,
        p.is_active,
        p.is_featured,
        p.promotional_price,
        p.discount_percentage,
        p.pix_discount_percentage,
        p.uti_pro_price,
        p.installment_options,
        p.rating_average,
        p.rating_count,
        p.meta_title,
        p.meta_description,
        p.slug,
        p.brand,
        p.category,
        p.platform,
        p.condition,
        p.pro_discount_percent,
        p.uti_pro_enabled,
        p.uti_pro_value,
        p.uti_pro_type,
        p.uti_pro_custom_price,
        p.parent_product_id,
        p.product_type,
        p.sku_code,
        p.is_master_product,
        p.variant_attributes,
        p.sort_order,
        p.available_variants,
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
        p.master_slug,
        p.created_at,
        p.updated_at,
        t.id as tag_id,
        t.name as tag_name
    FROM public.products p
    LEFT JOIN public.product_tags pt ON p.id = pt.product_id
    LEFT JOIN public.tags t ON pt.tag_id = t.id
    WHERE 
        (include_admin = true OR p.product_type != 'master')
        AND (tag_filter IS NULL OR t.id = ANY(tag_filter))
        AND p.is_active = true
    ORDER BY p.created_at DESC
    LIMIT COALESCE(limit_count, 1000);
END;
$$;

-- 4. Função para validar integridade dos dados
CREATE OR REPLACE FUNCTION public.validate_product_integrity()
RETURNS TABLE(
    total_products bigint,
    products_with_tags bigint,
    products_without_tags bigint,
    orphaned_product_tags bigint,
    invalid_tag_references bigint,
    integrity_issues text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_products bigint;
    v_products_with_tags bigint;
    v_products_without_tags bigint;
    v_orphaned_product_tags bigint;
    v_invalid_tag_references bigint;
    v_issues text[] := '{}';
BEGIN
    -- Contar total de produtos
    SELECT COUNT(*) INTO v_total_products FROM public.products WHERE is_active = true;
    
    -- Contar produtos com tags
    SELECT COUNT(DISTINCT p.id) INTO v_products_with_tags 
    FROM public.products p
    INNER JOIN public.product_tags pt ON p.id = pt.product_id
    WHERE p.is_active = true;
    
    -- Contar produtos sem tags
    v_products_without_tags := v_total_products - v_products_with_tags;
    
    -- Contar product_tags órfãos (sem produto correspondente)
    SELECT COUNT(*) INTO v_orphaned_product_tags
    FROM public.product_tags pt
    LEFT JOIN public.products p ON pt.product_id = p.id
    WHERE p.id IS NULL;
    
    -- Contar referências inválidas de tags
    SELECT COUNT(*) INTO v_invalid_tag_references
    FROM public.product_tags pt
    LEFT JOIN public.tags t ON pt.tag_id = t.id
    WHERE t.id IS NULL;
    
    -- Adicionar issues se encontradas
    IF v_orphaned_product_tags > 0 THEN
        v_issues := v_issues || ('Produto órfãos nas tags: ' || v_orphaned_product_tags::text);
    END IF;
    
    IF v_invalid_tag_references > 0 THEN
        v_issues := v_issues || ('Referências inválidas de tags: ' || v_invalid_tag_references::text);
    END IF;
    
    IF v_products_without_tags > (v_total_products * 0.1) THEN
        v_issues := v_issues || ('Muitos produtos sem tags: ' || v_products_without_tags::text || ' de ' || v_total_products::text);
    END IF;
    
    RETURN QUERY SELECT 
        v_total_products,
        v_products_with_tags,
        v_products_without_tags,
        v_orphaned_product_tags,
        v_invalid_tag_references,
        v_issues;
END;
$$;

-- 5. Função para limpar dados órfãos
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_orphaned_product_tags integer;
    v_invalid_tag_refs integer;
BEGIN
    -- Verificar se é admin
    IF NOT public.is_admin() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
    END IF;
    
    -- Limpar product_tags órfãos
    DELETE FROM public.product_tags pt
    WHERE NOT EXISTS (
        SELECT 1 FROM public.products p 
        WHERE p.id = pt.product_id
    );
    
    GET DIAGNOSTICS v_orphaned_product_tags = ROW_COUNT;
    
    -- Limpar referências inválidas de tags
    DELETE FROM public.product_tags pt
    WHERE NOT EXISTS (
        SELECT 1 FROM public.tags t 
        WHERE t.id = pt.tag_id
    );
    
    GET DIAGNOSTICS v_invalid_tag_refs = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'orphaned_product_tags_removed', v_orphaned_product_tags,
        'invalid_tag_refs_removed', v_invalid_tag_refs,
        'message', 'Limpeza concluída com sucesso'
    );
END;
$$;

-- 6. Função de diagnóstico avançado
CREATE OR REPLACE FUNCTION public.diagnose_product_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
    v_integrity_data record;
    v_view_count bigint;
    v_direct_count bigint;
BEGIN
    -- Executar validação de integridade
    SELECT * INTO v_integrity_data FROM public.validate_product_integrity();
    
    -- Contar produtos via view
    SELECT COUNT(DISTINCT product_id) INTO v_view_count 
    FROM public.view_product_with_tags
    WHERE is_active = true;
    
    -- Contar produtos diretamente
    SELECT COUNT(*) INTO v_direct_count 
    FROM public.products 
    WHERE is_active = true;
    
    v_result := jsonb_build_object(
        'integrity_check', row_to_json(v_integrity_data),
        'view_product_count', v_view_count,
        'direct_product_count', v_direct_count,
        'count_mismatch', (v_view_count != v_direct_count),
        'timestamp', now()
    );
    
    RETURN v_result;
END;
$$;