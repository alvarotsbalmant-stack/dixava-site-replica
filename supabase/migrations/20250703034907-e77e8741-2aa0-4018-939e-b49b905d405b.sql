-- Adicionar os novos produtos SKU do Forza Horizon 5 à seção "Produtos em Destaque"
INSERT INTO product_section_items (section_id, item_id, item_type, display_order)
SELECT 
    'e18a6d7d-8513-4558-872e-51ae6ec6997e' as section_id,
    id as item_id,
    'product' as item_type,
    (SELECT COUNT(*) FROM product_section_items WHERE section_id = 'e18a6d7d-8513-4558-872e-51ae6ec6997e') + ROW_NUMBER() OVER (ORDER BY created_at) - 1 as display_order
FROM products 
WHERE name LIKE '%Forza Horizon 5%' AND product_type = 'sku';