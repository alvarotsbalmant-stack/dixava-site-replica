-- Criação da tabela promotional_ribbon_config para configurações da fita promocional
-- Gerado pela IA do Supabase

CREATE TABLE IF NOT EXISTS public.promotional_ribbon_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_type TEXT NOT NULL UNIQUE CHECK (device_type IN ('mobile', 'desktop')),
    is_active BOOLEAN DEFAULT false,
    text TEXT NOT NULL DEFAULT '',
    background_color TEXT DEFAULT '#6B46C1',
    text_color TEXT DEFAULT '#FFFFFF',
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.promotional_ribbon_config ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Allow public read access" ON public.promotional_ribbon_config
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated users to insert/update" ON public.promotional_ribbon_config
FOR INSERT, UPDATE
TO authenticated
USING (true);

-- Insert Default Records
INSERT INTO public.promotional_ribbon_config (device_type, is_active, text, background_color, text_color, link_url)
VALUES
    ('mobile', false, '📱 Ofertas especiais no app!', '#6B46C1', '#FFFFFF', NULL),
    ('desktop', false, '🎮 Frete Grátis acima de R$ 150 - Aproveite nossas ofertas especiais!', '#6B46C1', '#FFFFFF', '/categoria/ofertas')
ON CONFLICT (device_type) DO NOTHING; -- Prevents duplicate entries

-- Create Trigger Function to Update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.promotional_ribbon_config
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

