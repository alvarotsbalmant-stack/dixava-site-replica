
-- Criar bucket para navigation-icons
INSERT INTO storage.buckets (id, name, public) 
VALUES ('navigation-icons', 'navigation-icons', true);

-- Criar políticas para o bucket navigation-icons
-- Política para permitir SELECT (leitura pública)
CREATE POLICY "Public read access for navigation-icons" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'navigation-icons');

-- Política para permitir INSERT (upload público)
CREATE POLICY "Public upload access for navigation-icons" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'navigation-icons');

-- Política para permitir UPDATE (atualização pública)
CREATE POLICY "Public update access for navigation-icons" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'navigation-icons');

-- Política para permitir DELETE (exclusão pública)
CREATE POLICY "Public delete access for navigation-icons" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'navigation-icons');

-- Adicionar campos para linha de hover configurável na tabela navigation_items
ALTER TABLE navigation_items 
ADD COLUMN line_color VARCHAR(7) DEFAULT '#ffffff',
ADD COLUMN line_height INTEGER DEFAULT 2,
ADD COLUMN line_animation_duration DECIMAL(3,1) DEFAULT 0.3,
ADD COLUMN show_line BOOLEAN DEFAULT true;
