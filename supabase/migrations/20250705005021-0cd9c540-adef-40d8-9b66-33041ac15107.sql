-- Limpar tabela e criar um único registro inicial
DELETE FROM public.storage_stats;

-- Inserir um único registro para demonstração
INSERT INTO public.storage_stats (
  total_size_bytes, 
  total_images, 
  webp_images, 
  non_webp_images,
  last_updated
) VALUES (
  47395635, -- ~45.2 MB  
  127,
  85,
  42,
  now()
);