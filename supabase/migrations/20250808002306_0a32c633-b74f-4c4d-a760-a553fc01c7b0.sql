-- Verificar se o email confirmation está habilitado
-- Esta migração apenas documenta que a confirmação de email deve estar habilitada no Supabase Auth

-- IMPORTANTE: Esta configuração deve ser feita no Dashboard do Supabase em:
-- Authentication > Settings > Email Templates > Confirm signup
-- Certifique-se de que "Enable email confirmations" está ATIVADO

-- Criar uma função para verificar status de confirmação de email (opcional)
CREATE OR REPLACE FUNCTION public.check_email_confirmation_status()
RETURNS TABLE(
  user_id uuid,
  email text,
  email_confirmed_at timestamptz,
  is_confirmed boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'auth', 'public'
AS $$
  SELECT 
    au.id as user_id,
    au.email,
    au.email_confirmed_at,
    (au.email_confirmed_at IS NOT NULL) as is_confirmed
  FROM auth.users au
  WHERE au.id = auth.uid();
$$;

-- Criar política para permitir que usuários vejam seu próprio status
GRANT EXECUTE ON FUNCTION public.check_email_confirmation_status() TO authenticated;