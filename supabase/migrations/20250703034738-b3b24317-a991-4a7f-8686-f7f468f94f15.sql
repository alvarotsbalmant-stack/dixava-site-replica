-- Criar um produto mestre de teste para Forza Horizon 5
INSERT INTO public.products (
  id,
  name, 
  description, 
  price, 
  image,
  product_type,
  is_master_product,
  is_active,
  stock,
  available_variants,
  slug,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Forza Horizon 5',
  'Explore um mundo vibrante e em constante evolução nas terras mexicanas. Lidere expedições aventurosas no mundo aberto social mais grandioso de todos os tempos.',
  299.99,
  '/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png',
  'master',
  true,
  true,
  0,
  '{"platforms": ["xbox", "playstation"]}',
  'forza-horizon-5-master',
  now(),
  now()
);

-- Obter o ID do produto mestre recém criado
WITH master_product AS (
  SELECT id FROM public.products 
  WHERE slug = 'forza-horizon-5-master' 
  LIMIT 1
)
-- Criar SKU para Xbox
INSERT INTO public.products (
  id,
  name,
  description, 
  price,
  image,
  product_type,
  is_master_product,
  is_active,
  stock,
  parent_product_id,
  variant_attributes,
  sku_code,
  sort_order,
  slug,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'Forza Horizon 5 - Xbox',
  'Explore um mundo vibrante e em constante evolução nas terras mexicanas. Lidere expedições aventurosas no mundo aberto social mais grandioso de todos os tempos.',
  299.99,
  '/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png',
  'sku',
  false,
  true,
  15,
  master_product.id,
  '{"platform": "xbox"}',
  'FH5-XBOX-001',
  0,
  'forza-horizon-5-xbox',
  now(),
  now()
FROM master_product;

-- Criar SKU para PlayStation
WITH master_product AS (
  SELECT id FROM public.products 
  WHERE slug = 'forza-horizon-5-master' 
  LIMIT 1
)
INSERT INTO public.products (
  id,
  name,
  description, 
  price,
  image,
  product_type,
  is_master_product,
  is_active,
  stock,
  parent_product_id,
  variant_attributes,
  sku_code,
  sort_order,
  slug,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'Forza Horizon 5 - PlayStation',
  'Explore um mundo vibrante e em constante evolução nas terras mexicanas. Lidere expedições aventuresas no mundo aberto social mais grandioso de todos os tempos.',
  349.99,
  '/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png',
  'sku',
  false,
  true,
  8,
  master_product.id,
  '{"platform": "playstation"}',
  'FH5-PS-001',
  1,
  'forza-horizon-5-playstation',
  now(),
  now()
FROM master_product;