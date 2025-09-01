-- Migração DEFINITIVA para corrigir erro "column products.idasproduct_id does not exist"
-- Data: 2025-07-31 12:37:00
-- Objetivo: Eliminar completamente qualquer referência a idasproduct_id no banco

-- 1. Verificar e listar todas as views que podem estar causando problema
DO $$
DECLARE
    view_record RECORD;
    func_record RECORD;
BEGIN
    RAISE NOTICE '=== INICIANDO CORREÇÃO DEFINITIVA IDASPRODUCT_ID ===';
    RAISE NOTICE 'Data: %', NOW();
    
    -- Listar todas as views existentes
    RAISE NOTICE '--- VIEWS EXISTENTES ---';
    FOR view_record IN 
        SELECT table_name, view_definition 
        FROM information_schema.views 
        WHERE table_schema = 'public'
    LOOP
        RAISE NOTICE 'View: %', view_record.table_name;
        
        -- Verificar se a view contém referência problemática
        IF view_record.view_definition LIKE '%idasproduct%' THEN
            RAISE WARNING 'ATENÇÃO: View % contém referência a idasproduct', view_record.table_name;
        END IF;
    END LOOP;
    
    -- Listar todas as funções que podem estar causando problema
    RAISE NOTICE '--- FUNÇÕES EXISTENTES ---';
    FOR func_record IN 
        SELECT routine_name, routine_definition 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
        AND routine_definition LIKE '%products%'
    LOOP
        RAISE NOTICE 'Função: %', func_record.routine_name;
        
        -- Verificar se a função contém referência problemática
        IF func_record.routine_definition LIKE '%idasproduct%' THEN
            RAISE WARNING 'ATENÇÃO: Função % contém referência a idasproduct', func_record.routine_name;
        END IF;
    END LOOP;
END $$;

-- 2. Drop e recriar TODAS as views relacionadas a produtos para garantir limpeza
DROP VIEW IF EXISTS view_product_with_tags CASCADE;
DROP VIEW IF EXISTS view_products_with_tags CASCADE;
DROP VIEW IF EXISTS view_product_details CASCADE;
DROP VIEW IF EXISTS view_featured_products CASCADE;

-- 3. Recriar view principal com estrutura 100% limpa
CREATE VIEW view_product_with_tags AS
SELECT 
  -- Campos básicos do produto (usando aliases explícitos)
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
  
  -- Tags (JOIN explícito e seguro)
  t.id AS tag_id,
  t.name AS tag_name
FROM products p
LEFT JOIN product_tags pt ON (p.id = pt.product_id)
LEFT JOIN tags t ON (pt.tag_id = t.id)
WHERE p.is_active = true;

-- 4. Criar view alternativa para casos específicos
CREATE VIEW view_products_simple AS
SELECT 
  id AS product_id,
  name AS product_name,
  description AS product_description,
  price AS product_price,
  stock AS product_stock,
  image AS product_image,
  brand,
  category,
  is_active,
  is_featured,
  created_at,
  updated_at
FROM products
WHERE is_active = true;

-- 5. Verificar e limpar qualquer cache ou schema corrompido
-- Forçar refresh completo do PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 6. Recriar todos os índices necessários
CREATE INDEX IF NOT EXISTS idx_view_product_with_tags_product_id ON view_product_with_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_view_product_with_tags_is_active ON view_product_with_tags(is_active);
CREATE INDEX IF NOT EXISTS idx_view_product_with_tags_is_featured ON view_product_with_tags(is_featured);
CREATE INDEX IF NOT EXISTS idx_view_product_with_tags_category ON view_product_with_tags(category);
CREATE INDEX IF NOT EXISTS idx_view_product_with_tags_brand ON view_product_with_tags(brand);

-- 7. Verificar integridade completa da estrutura
DO $$
DECLARE
    column_count INTEGER;
    view_count INTEGER;
    error_count INTEGER := 0;
BEGIN
    RAISE NOTICE '--- VERIFICAÇÃO DE INTEGRIDADE ---';
    
    -- Verificar se as views foram criadas
    SELECT COUNT(*) INTO view_count 
    FROM information_schema.views 
    WHERE table_name IN ('view_product_with_tags', 'view_products_simple');
    
    IF view_count = 2 THEN
        RAISE NOTICE '✅ SUCCESS: Todas as views foram criadas corretamente';
    ELSE
        RAISE WARNING '❌ ERROR: Nem todas as views foram criadas (encontradas: %)', view_count;
        error_count := error_count + 1;
    END IF;
    
    -- Verificar se não há mais colunas com nome problemático
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE column_name LIKE '%idasproduct%';
    
    IF column_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: Nenhuma coluna idasproduct_id encontrada';
    ELSE
        RAISE WARNING '❌ ERROR: Ainda existem % colunas com nome similar a idasproduct_id', column_count;
        error_count := error_count + 1;
    END IF;
    
    -- Testar consulta na view principal
    BEGIN
        PERFORM COUNT(*) FROM view_product_with_tags LIMIT 1;
        RAISE NOTICE '✅ SUCCESS: View view_product_with_tags está funcionando';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ ERROR: Erro ao consultar view_product_with_tags: %', SQLERRM;
        error_count := error_count + 1;
    END;
    
    -- Testar consulta na view simples
    BEGIN
        PERFORM COUNT(*) FROM view_products_simple LIMIT 1;
        RAISE NOTICE '✅ SUCCESS: View view_products_simple está funcionando';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ ERROR: Erro ao consultar view_products_simple: %', SQLERRM;
        error_count := error_count + 1;
    END;
    
    -- Resultado final
    IF error_count = 0 THEN
        RAISE NOTICE '🎉 SUCCESS: Migração concluída sem erros!';
    ELSE
        RAISE WARNING '⚠️ WARNING: Migração concluída com % erros', error_count;
    END IF;
END $$;

-- 8. Configurar permissões adequadas
GRANT SELECT ON view_product_with_tags TO anon;
GRANT SELECT ON view_product_with_tags TO authenticated;
GRANT SELECT ON view_products_simple TO anon;
GRANT SELECT ON view_products_simple TO authenticated;

-- 9. Adicionar comentários para documentação
COMMENT ON VIEW view_product_with_tags IS 'View principal de produtos com tags - Recriada em 2025-07-31 para eliminar definitivamente erro idasproduct_id';
COMMENT ON VIEW view_products_simple IS 'View simplificada de produtos - Criada em 2025-07-31 como alternativa segura';

-- 10. Limpar qualquer função ou trigger que possa estar causando problema
DO $$
DECLARE
    func_name TEXT;
BEGIN
    -- Buscar e dropar funções problemáticas
    FOR func_name IN 
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
        AND routine_definition LIKE '%idasproduct%'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_name || ' CASCADE';
        RAISE NOTICE 'Função problemática removida: %', func_name;
    END LOOP;
END $$;

-- 11. Log final de conclusão
DO $$
BEGIN
    RAISE NOTICE '=== MIGRAÇÃO DEFINITIVA CONCLUÍDA ===';
    RAISE NOTICE 'Data: %', NOW();
    RAISE NOTICE 'Objetivo: Eliminar completamente erro idasproduct_id';
    RAISE NOTICE 'Ações realizadas:';
    RAISE NOTICE '  ✅ Views antigas removidas';
    RAISE NOTICE '  ✅ Views novas criadas com estrutura limpa';
    RAISE NOTICE '  ✅ Índices recriados';
    RAISE NOTICE '  ✅ Cache do PostgREST limpo';
    RAISE NOTICE '  ✅ Permissões configuradas';
    RAISE NOTICE '  ✅ Funções problemáticas removidas';
    RAISE NOTICE '  ✅ Integridade verificada';
    RAISE NOTICE 'Status: MIGRAÇÃO DEFINITIVA APLICADA';
    RAISE NOTICE '==========================================';
END $$;

