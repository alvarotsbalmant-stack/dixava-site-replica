-- Criação da tabela promotional_ribbon_config para configurações da fita promocional
CREATE TABLE IF NOT EXISTS promotional_ribbon_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'desktop')),
    is_active BOOLEAN DEFAULT false,
    text TEXT NOT NULL DEFAULT '',
    background_color TEXT DEFAULT '#6B46C1',
    text_color TEXT DEFAULT '#FFFFFF',
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(device_type)
);

-- Inserir configurações padrão para mobile e desktop
INSERT INTO promotional_ribbon_config (device_type, is_active, text, background_color, text_color, link_url) VALUES
('mobile', false, '📱 Ofertas especiais no app!', '#6B46C1', '#FFFFFF', ''),
('desktop', false, '🎮 Frete Grátis acima de R$ 150 - Aproveite nossas ofertas especiais!', '#6B46C1', '#FFFFFF', '/categoria/ofertas')
ON CONFLICT (device_type) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE promotional_ribbon_config ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para exibir a fita no site)
CREATE POLICY "Allow public read access" ON promotional_ribbon_config
    FOR SELECT USING (true);

-- Política para permitir inserção/atualização apenas para usuários autenticados
CREATE POLICY "Allow authenticated users to insert/update" ON promotional_ribbon_config
    FOR ALL USING (auth.role() = 'authenticated');

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_promotional_ribbon_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_promotional_ribbon_config_updated_at
    BEFORE UPDATE ON promotional_ribbon_config
    FOR EACH ROW
    EXECUTE FUNCTION update_promotional_ribbon_config_updated_at();

