-- Primeiro, inserir o usuário que está faltando na tabela usuarios
INSERT INTO usuarios (
  id, 
  email, 
  nome, 
  papel, 
  status_assinatura, 
  desconto, 
  data_cadastro,
  created_at, 
  updated_at
)
VALUES (
  'd42c9b5a-2c8f-4a9b-a916-59aa500213b2',
  'admin@utidosgames.com',
  'Admin',
  'admin',
  'Ativo',
  0,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Criar função para sincronizar usuários automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (
    id,
    email,
    nome,
    papel,
    status_assinatura,
    desconto,
    data_cadastro,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    'user',
    'Ativo',
    0,
    NOW(),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();