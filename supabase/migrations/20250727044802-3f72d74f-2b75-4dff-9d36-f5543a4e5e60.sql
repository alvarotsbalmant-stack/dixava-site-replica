-- Phase 1 Critical Security Fixes

-- 1. Fix Privilege Escalation: Restrict profiles table RLS policies
DROP POLICY IF EXISTS "Allow authenticated users to update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to delete from profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert into profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to select from profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_policy" ON public.profiles;

-- Create secure RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = OLD.role); -- Prevent role escalation

CREATE POLICY "System can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id AND role = 'cliente'); -- Only allow cliente role on insert

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (is_admin());

-- 2. Secure database functions with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.email,
    'cliente'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Only admins can promote users
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Access denied: Only admins can promote users';
  END IF;
  
  -- Validate email format
  IF user_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. Enhance session security
CREATE OR REPLACE FUNCTION public.cleanup_old_invalidated_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Remove sessions invalidated more than 24 hours ago
  DELETE FROM public.invalidated_sessions 
  WHERE invalidated_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- 4. Add input validation for admin token functions
CREATE OR REPLACE FUNCTION public.validate_admin_token(p_token text, p_ip text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  link_record admin_login_links%ROWTYPE;
  admin_user_record RECORD;
BEGIN
  -- Validate input
  IF p_token IS NULL OR LENGTH(p_token) != 32 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid token format');
  END IF;
  
  -- Rate limiting check
  IF EXISTS (
    SELECT 1 FROM admin_login_links 
    WHERE used_by_ip = p_ip 
    AND used_at > NOW() - INTERVAL '1 minute'
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Too many attempts. Please wait.');
  END IF;
  
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