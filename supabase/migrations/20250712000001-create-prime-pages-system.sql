-- Migração para criar o sistema de Páginas Prime
-- Data: 2025-07-12
-- Descrição: Sistema completo de páginas configuráveis pelo painel admin

-- Tabela para armazenar as páginas Prime
CREATE TABLE IF NOT EXISTS prime_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar o layout de cada página Prime
CREATE TABLE IF NOT EXISTS prime_page_layout (
    id SERIAL PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES prime_pages(id) ON DELETE CASCADE,
    section_key VARCHAR(255) NOT NULL,
    section_type VARCHAR(100) NOT NULL, -- 'banner', 'product_section', 'special_section', etc.
    section_config JSONB DEFAULT '{}', -- Configurações específicas da seção
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_prime_pages_slug ON prime_pages(slug);
CREATE INDEX IF NOT EXISTS idx_prime_pages_active ON prime_pages(is_active);
CREATE INDEX IF NOT EXISTS idx_prime_page_layout_page_id ON prime_page_layout(page_id);
CREATE INDEX IF NOT EXISTS idx_prime_page_layout_order ON prime_page_layout(page_id, display_order);
CREATE INDEX IF NOT EXISTS idx_prime_page_layout_visible ON prime_page_layout(is_visible);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_prime_pages_updated_at ON prime_pages;
CREATE TRIGGER update_prime_pages_updated_at
    BEFORE UPDATE ON prime_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prime_page_layout_updated_at ON prime_page_layout;
CREATE TRIGGER update_prime_page_layout_updated_at
    BEFORE UPDATE ON prime_page_layout
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas páginas de exemplo para teste
INSERT INTO prime_pages (title, slug, description, meta_title, meta_description) VALUES
('Página de Teste', 'teste-prime', 'Página de teste para o sistema Prime', 'Teste Prime - UTI dos Games', 'Página de teste do sistema Prime'),
('Promoções Especiais', 'promocoes-especiais', 'Página dedicada às melhores promoções', 'Promoções Especiais - UTI dos Games', 'Confira as melhores promoções em games')
ON CONFLICT (slug) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE prime_pages IS 'Tabela para armazenar páginas Prime configuráveis';
COMMENT ON TABLE prime_page_layout IS 'Tabela para armazenar o layout e seções de cada página Prime';
COMMENT ON COLUMN prime_page_layout.section_type IS 'Tipo da seção: banner, product_section, special_section, hero_banner, etc.';
COMMENT ON COLUMN prime_page_layout.section_config IS 'Configurações específicas da seção em formato JSON';

