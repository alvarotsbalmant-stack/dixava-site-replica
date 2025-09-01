-- Fase 1: Adicionar coluna icon na tabela product_specifications
ALTER TABLE product_specifications ADD COLUMN icon text;

-- Adicionar comentário explicativo
COMMENT ON COLUMN product_specifications.icon IS 'Ícone da especificação (emoji, lucide icon name, ou URL)';

-- Criar índice para melhor performance nas consultas por categoria
CREATE INDEX IF NOT EXISTS idx_product_specifications_category ON product_specifications(category);
CREATE INDEX IF NOT EXISTS idx_product_specifications_product_category ON product_specifications(product_id, category);