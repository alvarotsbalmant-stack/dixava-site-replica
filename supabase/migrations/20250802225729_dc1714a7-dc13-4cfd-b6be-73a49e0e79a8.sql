-- CORREÇÃO DOS PROBLEMAS DE SEGURANÇA

-- 1. Habilitar RLS na tabela usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas para a tabela usuarios
CREATE POLICY "Users can view own data in usuarios"
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own data in usuarios"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all in usuarios"
ON public.usuarios
FOR SELECT
USING (public.is_admin());

CREATE POLICY "System can insert in usuarios"
ON public.usuarios
FOR INSERT
WITH CHECK (true);

-- 3. Corrigir search_path nas funções existentes que criamos
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';