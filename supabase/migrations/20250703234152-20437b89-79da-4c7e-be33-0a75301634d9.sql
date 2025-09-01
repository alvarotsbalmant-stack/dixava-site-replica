-- Criar tabela para plataformas configuráveis
CREATE TABLE public.platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  icon_emoji TEXT DEFAULT '🎮',
  color TEXT DEFAULT '#000000',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores
CREATE POLICY "Admins can manage platforms"
ON public.platforms
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Política para leitura pública
CREATE POLICY "Anyone can view active platforms"
ON public.platforms
FOR SELECT
USING (is_active = true);

-- Trigger para updated_at
CREATE TRIGGER update_platforms_updated_at
BEFORE UPDATE ON public.platforms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir plataformas padrão
INSERT INTO public.platforms (name, slug, icon_emoji, color, display_order) VALUES
('Xbox', 'xbox', '🎮', '#107C10', 1),
('PlayStation', 'playstation', '🎮', '#003791', 2),
('PC', 'pc', '💻', '#FF6B00', 3),
('Nintendo', 'nintendo', '🎮', '#E60012', 4),
('Mobile', 'mobile', '📱', '#34C759', 5);