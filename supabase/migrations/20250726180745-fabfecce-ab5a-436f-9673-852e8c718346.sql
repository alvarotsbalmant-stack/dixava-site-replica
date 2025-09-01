-- Criar tabela para links de login administrativo temporário
CREATE TABLE public.admin_login_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  used_by_ip TEXT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.admin_login_links ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage admin login links"
ON public.admin_login_links
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Permitir acesso público para verificar tokens (apenas para validação)
CREATE POLICY "Public can read active tokens for validation"
ON public.admin_login_links
FOR SELECT
USING (is_active = true AND expires_at > NOW());

-- Função para gerar token único
CREATE OR REPLACE FUNCTION generate_admin_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
BEGIN
  -- Gerar token único de 32 caracteres
  token := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT || RANDOM()::TEXT) FROM 1 FOR 32));
  
  -- Verificar se já existe e gerar novo se necessário
  WHILE EXISTS (SELECT 1 FROM admin_login_links WHERE token = token) LOOP
    token := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT || RANDOM()::TEXT) FROM 1 FOR 32));
  END LOOP;
  
  RETURN token;
END;
$$;

-- Função para criar link de admin
CREATE OR REPLACE FUNCTION create_admin_link(duration_minutes INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
  link_id UUID;
BEGIN
  -- Verificar se é admin
  IF NOT is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Gerar token e calcular expiração
  token := generate_admin_token();
  expires_at := NOW() + (duration_minutes || ' minutes')::INTERVAL;
  
  -- Inserir o link
  INSERT INTO admin_login_links (token, created_by, expires_at)
  VALUES (token, auth.uid(), expires_at)
  RETURNING id INTO link_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'token', token,
    'expires_at', expires_at,
    'link_id', link_id,
    'url', '/admin-login/' || token
  );
END;
$$;

-- Função para validar e processar login automático
CREATE OR REPLACE FUNCTION validate_admin_token(p_token TEXT, p_ip TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  link_record admin_login_links%ROWTYPE;
  admin_user auth.users%ROWTYPE;
BEGIN
  -- Buscar o token
  SELECT * INTO link_record 
  FROM admin_login_links 
  WHERE token = p_token 
    AND is_active = true 
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Link inválido ou expirado');
  END IF;
  
  -- Marcar como usado
  UPDATE admin_login_links 
  SET used_at = NOW(), used_by_ip = p_ip
  WHERE id = link_record.id;
  
  -- Buscar um usuário admin para fazer login
  SELECT au.* INTO admin_user
  FROM auth.users au
  JOIN profiles p ON au.id = p.id
  WHERE p.role = 'admin'
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Nenhum usuário admin encontrado');
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'admin_user_id', admin_user.id,
    'admin_email', admin_user.email,
    'message', 'Token válido'
  );
END;
$$;