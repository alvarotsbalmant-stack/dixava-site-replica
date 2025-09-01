-- Corrigir a função generate_admin_token para eliminar ambiguidade
CREATE OR REPLACE FUNCTION generate_admin_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token TEXT;
BEGIN
  -- Gerar token único de 32 caracteres
  new_token := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT || RANDOM()::TEXT) FROM 1 FOR 32));
  
  -- Verificar se já existe e gerar novo se necessário
  WHILE EXISTS (SELECT 1 FROM admin_login_links WHERE admin_login_links.token = new_token) LOOP
    new_token := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT || RANDOM()::TEXT) FROM 1 FOR 32));
  END LOOP;
  
  RETURN new_token;
END;
$$;