
-- Criar tabela para favoritos dos usuários
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Criar tabela para pedidos dos usuários
CREATE TABLE IF NOT EXISTS public.user_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para itens dos pedidos
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES user_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para economias dos usuários
CREATE TABLE IF NOT EXISTS public.user_savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES user_orders(id) ON DELETE CASCADE,
  savings_amount DECIMAL(10,2) NOT NULL,
  savings_type TEXT NOT NULL, -- 'promotion', 'uti_pro', 'both'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_savings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_favorites
CREATE POLICY "Users can view their own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para user_orders
CREATE POLICY "Users can view their own orders" ON public.user_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.user_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para order_items
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_orders WHERE user_orders.id = order_items.order_id AND user_orders.user_id = auth.uid()
  ));

-- Políticas RLS para user_savings
CREATE POLICY "Users can view their own savings" ON public.user_savings
  FOR SELECT USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at em user_orders
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_orders_updated_at BEFORE UPDATE ON user_orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Inserir alguns dados de exemplo para demonstração
INSERT INTO public.user_orders (user_id, order_number, total_amount, status, created_at) VALUES
  ('2facfeca-849e-407f-b4e6-6a5f08c83f42', 'UTI-2024-001', 299.99, 'delivered', now() - interval '30 days'),
  ('2facfeca-849e-407f-b4e6-6a5f08c83f42', 'UTI-2024-002', 149.99, 'delivered', now() - interval '15 days'),
  ('2facfeca-849e-407f-b4e6-6a5f08c83f42', 'UTI-2024-003', 199.99, 'processing', now() - interval '2 days')
ON CONFLICT (order_number) DO NOTHING;

-- Inserir economias de exemplo
INSERT INTO public.user_savings (user_id, savings_amount, savings_type, created_at) VALUES
  ('2facfeca-849e-407f-b4e6-6a5f08c83f42', 50.00, 'promotion', now() - interval '30 days'),
  ('2facfeca-849e-407f-b4e6-6a5f08c83f42', 25.50, 'uti_pro', now() - interval '15 days'),
  ('2facfeca-849e-407f-b4e6-6a5f08c83f42', 15.00, 'both', now() - interval '2 days')
ON CONFLICT DO NOTHING;
