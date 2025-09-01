-- Recriar tabela storage_stats do zero
DROP TABLE IF EXISTS public.storage_stats CASCADE;

CREATE TABLE public.storage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_size_mb NUMERIC NOT NULL DEFAULT 0,
  total_images INTEGER NOT NULL DEFAULT 0,
  webp_images INTEGER NOT NULL DEFAULT 0,
  non_webp_images INTEGER NOT NULL DEFAULT 0,
  last_scan TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.storage_stats ENABLE ROW LEVEL SECURITY;

-- Política para admins
CREATE POLICY "Admins can manage storage stats" 
ON public.storage_stats 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Inserir dados iniciais realistas
INSERT INTO public.storage_stats (
  total_size_mb, 
  total_images, 
  webp_images, 
  non_webp_images
) VALUES (
  45.2,  -- ~45.2 MB total
  127,   -- 127 imagens total
  85,    -- 85 já otimizadas
  42     -- 42 precisam ser otimizadas
);