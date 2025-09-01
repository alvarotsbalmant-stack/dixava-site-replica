-- Criar tabela para armazenar estatísticas de storage
CREATE TABLE IF NOT EXISTS public.storage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_size_bytes BIGINT NOT NULL DEFAULT 0,
  total_images INTEGER NOT NULL DEFAULT 0,
  webp_images INTEGER NOT NULL DEFAULT 0,
  non_webp_images INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.storage_stats ENABLE ROW LEVEL SECURITY;

-- Política para admins poderem ver e gerenciar
CREATE POLICY "Admins can manage storage stats" 
ON public.storage_stats 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Inserir registro inicial
INSERT INTO public.storage_stats (total_size_bytes, total_images, webp_images, non_webp_images)
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;