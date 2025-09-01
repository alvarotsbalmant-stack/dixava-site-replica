-- Modificar a função validate_admin_token para retornar dados do usuário admin
CREATE OR REPLACE FUNCTION validate_admin_token(p_token TEXT, p_ip TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  link_record admin_login_links%ROWTYPE;
  admin_user_record RECORD;
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
  
  -- Buscar um usuário admin com dados completos
  SELECT 
    au.id as user_id,
    au.email,
    au.created_at,
    p.name,
    p.role
  INTO admin_user_record
  FROM auth.users au
  JOIN profiles p ON au.id = p.id
  WHERE p.role = 'admin'
    AND au.email_confirmed_at IS NOT NULL
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Nenhum usuário admin ativo encontrado');
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'admin_user_id', admin_user_record.user_id,
    'admin_email', admin_user_record.email,
    'admin_name', admin_user_record.name,
    'message', 'Token válido'
  );
END;
$$;