-- 1. CRIAR TABELA DE CATEGORIAS
CREATE TABLE specification_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- nome técnico (ex: 'general', 'technical')
  label VARCHAR(100) NOT NULL, -- nome exibido (ex: 'Informações Gerais')
  icon VARCHAR(10) DEFAULT '📄', -- emoji ou código do ícone
  color VARCHAR(7) DEFAULT '#6B7280', -- cor hex para a categoria
  description TEXT, -- descrição da categoria
  is_active BOOLEAN DEFAULT true, -- ativa/inativa
  order_index INTEGER DEFAULT 0, -- ordem de exibição
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. CRIAR SISTEMA DE TEMPLATES
-- Tabela principal de templates
CREATE TABLE specification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- nome técnico (ex: 'console_ps5')
  label VARCHAR(100) NOT NULL, -- nome exibido (ex: 'Console PlayStation 5')
  description TEXT, -- descrição do template
  product_type VARCHAR(50) NOT NULL, -- tipo de produto (console, game, accessory)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Itens dos templates
CREATE TABLE specification_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES specification_templates(id) ON DELETE CASCADE,
  category_name VARCHAR(50) NOT NULL, -- referência ao name da categoria
  label VARCHAR(100) NOT NULL, -- nome da especificação
  default_value VARCHAR(255) DEFAULT '', -- valor padrão
  is_required BOOLEAN DEFAULT false, -- campo obrigatório
  highlight BOOLEAN DEFAULT false, -- destacar na visualização
  order_index INTEGER DEFAULT 0, -- ordem dentro da categoria
  validation_rules JSONB DEFAULT '{}', -- regras de validação (futuro)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. INSERIR CATEGORIAS EXISTENTES (MIGRAÇÃO)
INSERT INTO specification_categories (name, label, icon, color, order_index) VALUES
('general', 'Informações Gerais', '📋', '#6B7280', 1),
('technical', 'Especificações Técnicas', '⚙️', '#3B82F6', 2),
('storage', 'Armazenamento e Instalação', '💾', '#8B5CF6', 3),
('multiplayer', 'Recursos Online', '🌐', '#10B981', 4),
('physical', 'Informações Físicas', '📦', '#F59E0B', 5),
('compatibility', 'Compatibilidade', '🔗', '#EF4444', 6),
('performance', 'Performance', '⚡', '#06B6D4', 7),
('audio', 'Áudio e Vídeo', '🎵', '#EC4899', 8);

-- 4. INSERIR TEMPLATES EXISTENTES
INSERT INTO specification_templates (name, label, description, product_type) VALUES
('console_template', 'Console Geral', 'Template para consoles de videogame', 'console'),
('game_template', 'Jogo Geral', 'Template para jogos digitais e físicos', 'game'),
('accessory_template', 'Acessório Geral', 'Template para acessórios de gaming', 'accessory');

-- 5. INSERIR ITENS DO TEMPLATE DE CONSOLE
INSERT INTO specification_template_items (template_id, category_name, label, default_value, highlight, order_index) 
SELECT 
  (SELECT id FROM specification_templates WHERE name = 'console_template'),
  'general', 'Plataforma', '', true, 1
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'console_template'),
  'general', 'Modelo', '', true, 2
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'console_template'),
  'general', 'Cor', '', false, 3
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'console_template'),
  'general', 'Condição', 'Novo', false, 4
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'console_template'),
  'technical', 'Processador', '', false, 1
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'console_template'),
  'technical', 'Memória RAM', '', false, 2
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'console_template'),
  'technical', 'Armazenamento', '', true, 3
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'console_template'),
  'technical', 'Resolução Máxima', '4K', false, 4;

-- 6. INSERIR ITENS DO TEMPLATE DE JOGO
INSERT INTO specification_template_items (template_id, category_name, label, default_value, highlight, order_index) 
SELECT 
  (SELECT id FROM specification_templates WHERE name = 'game_template'),
  'general', 'Plataforma', '', true, 1
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'game_template'),
  'general', 'Gênero', '', true, 2
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'game_template'),
  'general', 'Classificação', '', false, 3
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'game_template'),
  'general', 'Desenvolvedor', '', false, 4
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'game_template'),
  'general', 'Data de Lançamento', '', false, 5
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'game_template'),
  'storage', 'Idiomas', '', false, 1
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'game_template'),
  'storage', 'Espaço Necessário', '', true, 2
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'game_template'),
  'multiplayer', 'Modos de Jogo', '', false, 1
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'game_template'),
  'multiplayer', 'Jogadores Online', '', false, 2;

-- 7. INSERIR ITENS DO TEMPLATE DE ACESSÓRIO
INSERT INTO specification_template_items (template_id, category_name, label, default_value, highlight, order_index) 
SELECT 
  (SELECT id FROM specification_templates WHERE name = 'accessory_template'),
  'general', 'Tipo', '', true, 1
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'accessory_template'),
  'general', 'Cor', '', false, 2
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'accessory_template'),
  'general', 'Garantia', '1 ano', false, 3
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'accessory_template'),
  'compatibility', 'Compatibilidade', '', true, 1
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'accessory_template'),
  'technical', 'Conectividade', '', false, 1
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'accessory_template'),
  'physical', 'Material', '', false, 1
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'accessory_template'),
  'physical', 'Dimensões', '', false, 2
UNION ALL SELECT 
  (SELECT id FROM specification_templates WHERE name = 'accessory_template'),
  'physical', 'Peso', '', false, 3;

-- 8. ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_specification_categories_active ON specification_categories(is_active);
CREATE INDEX idx_specification_categories_order ON specification_categories(order_index);
CREATE INDEX idx_specification_templates_type ON specification_templates(product_type);
CREATE INDEX idx_specification_templates_active ON specification_templates(is_active);
CREATE INDEX idx_specification_template_items_template ON specification_template_items(template_id);
CREATE INDEX idx_specification_template_items_category ON specification_template_items(category_name);
CREATE INDEX idx_specification_template_items_order ON specification_template_items(template_id, order_index);

-- 9. HABILITAR RLS NAS NOVAS TABELAS
ALTER TABLE specification_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE specification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE specification_template_items ENABLE ROW LEVEL SECURITY;

-- 10. POLÍTICAS PARA LEITURA PÚBLICA
CREATE POLICY "Allow public read access to specification_categories" ON specification_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to specification_templates" ON specification_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to specification_template_items" ON specification_template_items
  FOR SELECT USING (true);

-- 11. POLÍTICAS PARA ADMINS
CREATE POLICY "Allow admin full access to specification_categories" ON specification_categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Allow admin full access to specification_templates" ON specification_templates
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Allow admin full access to specification_template_items" ON specification_template_items
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 12. TRIGGER PARA ATUALIZAR updated_at
CREATE TRIGGER update_specification_categories_updated_at
  BEFORE UPDATE ON specification_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specification_templates_updated_at
  BEFORE UPDATE ON specification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();