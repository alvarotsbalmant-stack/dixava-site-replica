
-- Criar tabela navigation_items
CREATE TABLE navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon_url TEXT,
  icon_type VARCHAR(20) DEFAULT 'image' CHECK (icon_type IN ('image', 'emoji', 'icon')),
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#000000',
  hover_background_color VARCHAR(7),
  hover_text_color VARCHAR(7),
  link_url VARCHAR(500) NOT NULL,
  link_type VARCHAR(20) DEFAULT 'internal' CHECK (link_type IN ('internal', 'external')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_navigation_items_display_order ON navigation_items(display_order);
CREATE INDEX idx_navigation_items_visible_active ON navigation_items(is_visible, is_active);
CREATE UNIQUE INDEX idx_navigation_items_slug ON navigation_items(slug);

-- Habilitar RLS
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (todos podem ver itens visíveis)
CREATE POLICY "navigation_items_select_policy" ON navigation_items
  FOR SELECT USING (is_visible = true AND is_active = true);

-- Política para administradores
CREATE POLICY "navigation_items_admin_policy" ON navigation_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Inserir dados iniciais
INSERT INTO navigation_items (title, slug, icon_url, icon_type, background_color, text_color, hover_background_color, hover_text_color, link_url, display_order) VALUES
('Início', 'inicio', '🏠', 'emoji', '#6366f1', '#ffffff', '#4f46e5', '#ffffff', '/', 1),
('PlayStation', 'playstation', '🎮', 'emoji', '#0070f3', '#ffffff', '#0051cc', '#ffffff', '/playstation', 2),
('Nintendo', 'nintendo', '🎮', 'emoji', '#e60012', '#ffffff', '#cc000f', '#ffffff', '/nintendo', 3),
('Xbox', 'xbox', '🎮', 'emoji', '#107c10', '#ffffff', '#0e6b0e', '#ffffff', '/xbox', 4),
('PC Gaming', 'pc-gaming', '💻', 'emoji', '#7c3aed', '#ffffff', '#6d28d9', '#ffffff', '/pc-gaming', 5),
('Colecionáveis', 'colecionaveis', '🏆', 'emoji', '#f59e0b', '#ffffff', '#d97706', '#ffffff', '/colecionaveis', 6),
('Acessórios', 'acessorios', '🎧', 'emoji', '#8b5cf6', '#ffffff', '#7c3aed', '#ffffff', '/acessorios', 7),
('Ofertas', 'ofertas', '🏷️', 'emoji', '#ef4444', '#ffffff', '#dc2626', '#ffffff', '/ofertas', 8),
('UTI PRO', 'uti-pro', '⭐', 'emoji', '#10b981', '#ffffff', '#059669', '#ffffff', '/uti-pro', 9);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER trigger_navigation_items_updated_at
  BEFORE UPDATE ON navigation_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();
