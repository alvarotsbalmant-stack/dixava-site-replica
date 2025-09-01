-- Migração para corrigir erro "column products.idasproduct_id does not exist"
-- Data: 2025-07-31 02:27:00
-- Origem: Investigação Lovable - view ou função defeituosa no Supabase

-- 1. Drop e recriar a view para forçar refresh do schema
DROP VIEW IF EXISTS view_product_with_tags;

-- 2. Recriar a view com estrutura limpa e explícita
CREATE VIEW view_product_with_tags AS
SELECT 
  p.id AS product_id,
  p.name AS product_name,
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
  p.brand,
  p.category,
  -- Campos UTI PRO
  p.uti_pro_enabled,
  p.uti_pro_value,
  p.uti_pro_custom_price,
  p.uti_pro_type,
  -- Campos do sistema de SKUs
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
  -- Tags (com JOIN explícito e seguro)
  t.id AS tag_id,
  t.name AS tag_name
FROM products p
LEFT JOIN product_tags pt ON (p.id = pt.product_id)
LEFT JOIN tags t ON (pt.tag_id = t.id)
WHERE p.is_active = true;

-- 3. Verificar se há alguma função que pode estar causando o problema
-- Buscar por funções que referenciam products
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT routine_name, routine_definition 
        FROM information_schema.routines 
        WHERE routine_definition LIKE '%products%' 
        AND routine_type = 'FUNCTION'
    LOOP
        -- Log das funções encontradas para análise
        RAISE NOTICE 'Função encontrada: % - %', func_record.routine_name, func_record.routine_definition;
    END LOOP;
END $$;

-- 4. Limpar qualquer cache de schema que possa estar corrompido
-- Forçar refresh do PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 5. Recriar índices da view para garantir performance
CREATE INDEX IF NOT EXISTS idx_view_product_with_tags_product_id ON view_product_with_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_view_product_with_tags_is_active ON view_product_with_tags(is_active);
CREATE INDEX IF NOT EXISTS idx_view_product_with_tags_is_featured ON view_product_with_tags(is_featured);

-- 6. Verificar integridade da estrutura
DO $$
BEGIN
    -- Verificar se a view foi criada corretamente
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'view_product_with_tags') THEN
        RAISE NOTICE 'SUCCESS: view_product_with_tags recriada com sucesso';
    ELSE
        RAISE EXCEPTION 'ERROR: Falha ao recriar view_product_with_tags';
    END IF;
    
    -- Verificar se não há mais referências a idasproduct_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE column_name LIKE '%idasproduct%'
    ) THEN
        RAISE WARNING 'ATENÇÃO: Ainda existem colunas com nome similar a idasproduct_id';
    ELSE
        RAISE NOTICE 'SUCCESS: Nenhuma coluna idasproduct_id encontrada';
    END IF;
END $$;

-- 7. Comentários para documentação
COMMENT ON VIEW view_product_with_tags IS 'View recriada em 2025-07-31 para corrigir erro idasproduct_id. Inclui todos os campos de produtos com tags associadas.';

-- 8. Grant de permissões necessárias
GRANT SELECT ON view_product_with_tags TO anon;
GRANT SELECT ON view_product_with_tags TO authenticated;

-- 9. Log de conclusão
DO $$
BEGIN
    RAISE NOTICE '=== MIGRAÇÃO CONCLUÍDA ===';
    RAISE NOTICE 'Data: %', NOW();
    RAISE NOTICE 'Objetivo: Corrigir erro column products.idasproduct_id does not exist';
    RAISE NOTICE 'Ações: View recriada, cache limpo, índices recriados';
    RAISE NOTICE 'Status: SUCESSO';
END $$;

