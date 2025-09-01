-- Estrutura para armazenar configurações dinâmicas da loja
-- Baseado no relatório de dados hardcoded identificados

-- 1. Adicionar campo brand na tabela products para especificações
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand TEXT;

-- 2. Criar tabela para especificações dinâmicas de produtos
CREATE TABLE IF NOT EXISTS public.product_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- general, technical, storage, physical, etc.
  label VARCHAR(200) NOT NULL,
  value TEXT NOT NULL,
  highlight BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Criar tabela para FAQ dinâmicos por produto
CREATE TABLE IF NOT EXISTS public.product_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  helpful_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_product_specifications_product_id ON public.product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specifications_category ON public.product_specifications(category);
CREATE INDEX IF NOT EXISTS idx_product_faqs_product_id ON public.product_faqs(product_id);
CREATE INDEX IF NOT EXISTS idx_product_faqs_category ON public.product_faqs(category);

-- 5. Criar triggers para updated_at
CREATE OR REPLACE TRIGGER update_product_specifications_updated_at
  BEFORE UPDATE ON public.product_specifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_product_faqs_updated_at
  BEFORE UPDATE ON public.product_faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Habilitar RLS
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS para especificações
CREATE POLICY "Admins can manage all product specifications"
  ON public.product_specifications
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Everyone can view product specifications"
  ON public.product_specifications
  FOR SELECT
  USING (true);

-- 8. Criar políticas RLS para FAQs
CREATE POLICY "Admins can manage all product FAQs"
  ON public.product_faqs
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Everyone can view active product FAQs"
  ON public.product_faqs
  FOR SELECT
  USING (active = true);

-- 9. Inserir dados padrão para demonstração (especificações técnicas genéricas)
INSERT INTO public.product_specifications (product_id, category, label, value, highlight, order_index)
SELECT 
  p.id,
  'general',
  'Marca/Editora',
  COALESCE(p.brand, 'A definir'),
  false,
  1
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_specifications ps 
  WHERE ps.product_id = p.id AND ps.label = 'Marca/Editora'
)
LIMIT 10; -- Limitar para evitar muitos dados de teste

-- 10. Inserir FAQs padrão para alguns produtos
INSERT INTO public.product_faqs (product_id, question, answer, category, order_index)
SELECT 
  p.id,
  'Este produto é original?',
  'Sim, trabalhamos apenas com produtos 100% originais e lacrados de fábrica.',
  'garantia',
  1
FROM public.products p
WHERE p.is_active = true
LIMIT 5; -- Apenas alguns produtos para demonstração

INSERT INTO public.product_faqs (product_id, question, answer, category, order_index)
SELECT 
  p.id,
  'Qual o prazo de entrega?',
  'O prazo de entrega varia de 3 a 5 dias úteis para todo o Brasil, com frete grátis acima de R$ 99.',
  'entrega',
  2
FROM public.products p
WHERE p.is_active = true
LIMIT 5;