
-- 1. CAMPOS DE PREÇO AVANÇADOS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS promotional_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER,
ADD COLUMN IF NOT EXISTS pix_discount_percentage INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS uti_pro_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS installment_options INTEGER DEFAULT 12;

-- 2. SISTEMA DE AVALIAÇÕES
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS rating_average DECIMAL(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_enabled BOOLEAN DEFAULT true;

-- 3. ESPECIFICAÇÕES TÉCNICAS CONFIGURÁVEIS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS technical_specs JSONB,
ADD COLUMN IF NOT EXISTS product_features JSONB;

-- 4. INFORMAÇÕES DE ENTREGA
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS shipping_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS shipping_dimensions JSONB,
ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shipping_time_min INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS shipping_time_max INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS store_pickup_available BOOLEAN DEFAULT true;

-- 5. PRODUTOS RELACIONADOS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS related_products JSONB,
ADD COLUMN IF NOT EXISTS related_products_auto BOOLEAN DEFAULT true;

-- 6. SEO E METADADOS
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- 7. CONFIGURAÇÕES DE VISIBILIDADE
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS show_stock BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_rating BOOLEAN DEFAULT true;

-- 8. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

-- 9. EXEMPLO DE DADOS PARA TESTE (Fixed syntax)
UPDATE products 
SET 
    technical_specs = '{
        "basic_info": {
            "platform": "PlayStation 5",
            "genre": "Ação/Aventura",
            "developer": "Naughty Dog",
            "publisher": "Sony Interactive Entertainment"
        },
        "technical_requirements": {
            "storage_space": "50 GB",
            "players": "1 jogador",
            "languages": "Português, Inglês"
        }
    }'::jsonb,
    product_features = '[
        {
            "text": "Produto original e lacrado",
            "icon": "shield-check",
            "order": 1
        },
        {
            "text": "Garantia da loja UTI dos Games", 
            "icon": "award",
            "order": 2
        }
    ]'::jsonb,
    promotional_price = 179.90,
    discount_percentage = 10,
    pix_discount_percentage = 5,
    uti_pro_price = 169.90,
    rating_average = 4.8,
    rating_count = 127,
    shipping_weight = 0.5,
    shipping_dimensions = '{"height": 15, "width": 12, "depth": 2}'::jsonb,
    store_pickup_available = true,
    meta_title = 'The Last of Us Parte I - PS4 | UTI dos Games',
    meta_description = 'Compre The Last of Us Parte I para PS4 na UTI dos Games. Melhor preço, entrega rápida e garantia. Produto original e lacrado.',
    slug = 'the-last-of-us-parte-i-ps4'
WHERE name ILIKE '%The Last of Us%' 
AND id = (SELECT id FROM products WHERE name ILIKE '%The Last of Us%' ORDER BY created_at DESC LIMIT 1);
