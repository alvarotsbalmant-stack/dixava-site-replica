-- FASE 1: LIMPEZA TOTAL DO SISTEMA ATUAL

-- Remover triggers problemáticos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS sync_usuarios_profiles ON public.profiles;

-- Remover funções problemáticas relacionadas ao login
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.sync_usuarios_with_profiles() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_unconfirmed_accounts() CASCADE;

-- Remover tabelas problemáticas do sistema de login antigo
DROP TABLE IF EXISTS public.invalidated_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_login_links CASCADE;
DROP TABLE IF EXISTS public.admin_security_logs CASCADE;
DROP TABLE IF EXISTS public.security_flags CASCADE;

-- Limpar tabela usuarios (manter apenas estrutura mínima)
TRUNCATE public.usuarios CASCADE;

-- Recriar tabela usuarios com estrutura simplificada
DROP TABLE IF EXISTS public.usuarios CASCADE;
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FASE 2: NOVA ARQUITETURA SIMPLES

-- Criar tabela user_profiles limpa e simples
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger simples para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Função simples para criar perfil automaticamente
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- Função simples para verificar se é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies simples
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
USING (public.is_admin());

-- Admins podem atualizar qualquer perfil
CREATE POLICY "Admins can update all profiles"
ON public.user_profiles
FOR UPDATE
USING (public.is_admin());

-- Sistema pode inserir perfis
CREATE POLICY "System can insert profiles"
ON public.user_profiles
FOR INSERT
WITH CHECK (true);

-- Criar primeiro usuário admin se não existir
DO $$
BEGIN
  -- Inserir admin na tabela user_profiles se não existir
  INSERT INTO public.user_profiles (id, name, email, role)
  VALUES (
    'd42c9b5a-2c8f-4a9b-a916-59aa500213b2',
    'Admin',
    'admin@utidosgames.com',
    'admin'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    email = 'admin@utidosgames.com',
    name = 'Admin';
END $$;