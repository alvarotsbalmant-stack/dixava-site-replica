
-- Criar tabela prime_pages
CREATE TABLE prime_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela prime_page_layout
CREATE TABLE prime_page_layout (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES prime_pages(id) ON DELETE CASCADE,
  section_type VARCHAR(100) NOT NULL,
  section_key VARCHAR(255) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  section_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_prime_pages_slug ON prime_pages(slug);
CREATE INDEX idx_prime_pages_active ON prime_pages(is_active);
CREATE INDEX idx_prime_page_layout_page_id ON prime_page_layout(page_id);
CREATE INDEX idx_prime_page_layout_order ON prime_page_layout(page_id, display_order);

-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_prime_pages_updated_at 
BEFORE UPDATE ON prime_pages 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prime_page_layout_updated_at 
BEFORE UPDATE ON prime_page_layout 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE prime_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prime_page_layout ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura pública
CREATE POLICY "Allow public read access to active prime pages" 
ON prime_pages FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow public read access to visible prime page layout" 
ON prime_page_layout FOR SELECT 
USING (is_visible = true);

-- Políticas para admin
CREATE POLICY "Allow admin full access to prime pages" 
ON prime_pages FOR ALL 
USING (auth.uid() IS NOT NULL AND is_admin());

CREATE POLICY "Allow admin full access to prime page layout" 
ON prime_page_layout FOR ALL 
USING (auth.uid() IS NOT NULL AND is_admin());

-- Inserir dados de exemplo
INSERT INTO prime_pages (title, slug, description, meta_title, meta_description, is_active) VALUES
('Página de Teste Prime', 'teste-prime', 'Uma página de exemplo para testar o sistema Prime', 'Teste Prime - UTI dos Games', 'Página de teste do sistema Prime da UTI dos Games', true),
('Promoções Especiais', 'promocoes-especiais', 'Página dedicada às melhores promoções', 'Promoções Especiais - UTI dos Games', 'Confira as melhores promoções em games', true);

-- Layout de exemplo para a primeira página
INSERT INTO prime_page_layout (page_id, section_type, section_key, display_order, is_visible, section_config) 
SELECT 
  p.id,
  'banner_hero',
  'banner_hero_1',
  1,
  true,
  '{"title": "Bem-vindo à Página Prime", "subtitle": "Sistema configurável de páginas", "image": "/api/placeholder/1200/400"}'::jsonb
FROM prime_pages p WHERE p.slug = 'teste-prime';

-- Layout adicional para demonstração
INSERT INTO prime_page_layout (page_id, section_type, section_key, display_order, is_visible, section_config) 
SELECT 
  p.id,
  'product_grid',
  'products_featured_1',
  2,
  true,
  '{"title": "Produtos em Destaque", "max_items": 8, "layout": "grid"}'::jsonb
FROM prime_pages p WHERE p.slug = 'teste-prime';
