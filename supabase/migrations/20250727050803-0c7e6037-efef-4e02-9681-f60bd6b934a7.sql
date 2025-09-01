-- Security Fix 1: Fix function search path vulnerabilities for all security definer functions
-- This addresses WARN issues 3-18 from the linter

-- Fix has_admin_users function
CREATE OR REPLACE FUNCTION public.has_admin_users()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE role = 'admin'
  );
$function$;

-- Fix is_admin_user function
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$function$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$function$;

-- Fix is_user_admin function
CREATE OR REPLACE FUNCTION public.is_user_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$function$;

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id;
$function$;

-- Fix has_active_subscription function
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_subscriptions 
    WHERE user_subscriptions.user_id = has_active_subscription.user_id
      AND status = 'active' 
      AND end_date > now()
  );
$function$;

-- Fix get_active_subscription function
CREATE OR REPLACE FUNCTION public.get_active_subscription(user_id uuid)
 RETURNS TABLE(subscription_id uuid, plan_name text, discount_percentage integer, end_date timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    us.id,
    sp.name,
    sp.discount_percentage,
    us.end_date
  FROM public.user_subscriptions us
  JOIN public.subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = get_active_subscription.user_id
    AND us.status = 'active' 
    AND us.end_date > now()
  ORDER BY us.end_date DESC
  LIMIT 1;
$function$;

-- Fix is_user_flagged function
CREATE OR REPLACE FUNCTION public.is_user_flagged(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.security_flags 
    WHERE user_id = p_user_id 
      AND resolved = false 
      AND created_at > NOW() - INTERVAL '24 hours'
  );
$function$;

-- Fix is_email_confirmed function
CREATE OR REPLACE FUNCTION public.is_email_confirmed()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT email_confirmed_at IS NOT NULL 
    FROM auth.users 
    WHERE id = auth.uid()
  );
END;
$function$;

-- Security Fix 2: Secure admin auto-login by removing hardcoded credentials
-- Update validate_admin_token function to be more secure
CREATE OR REPLACE FUNCTION public.validate_admin_token(p_token text, p_ip text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  link_record admin_login_links%ROWTYPE;
  admin_user_record RECORD;
BEGIN
  -- Validate input parameters
  IF p_token IS NULL OR p_token = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Token is required');
  END IF;
  
  -- Buscar o token
  SELECT * INTO link_record 
  FROM admin_login_links 
  WHERE token = p_token 
    AND is_active = true 
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    -- Log failed attempt for security monitoring
    INSERT INTO security_logs (event_type, user_id, details) 
    VALUES ('invalid_admin_token', NULL, jsonb_build_object('token_prefix', LEFT(p_token, 8), 'ip', p_ip))
    ON CONFLICT DO NOTHING;
    
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
  
  -- Log successful admin access
  INSERT INTO security_logs (event_type, user_id, details) 
  VALUES ('admin_token_validated', admin_user_record.user_id, jsonb_build_object('ip', p_ip))
  ON CONFLICT DO NOTHING;
  
  RETURN jsonb_build_object(
    'success', true,
    'admin_user_id', admin_user_record.user_id,
    'admin_email', admin_user_record.email,
    'admin_name', admin_user_record.name,
    'message', 'Token válido'
  );
END;
$function$;

-- Security Fix 3: Add RLS policies for tables without them (addresses INFO issue 1)
-- First, ensure security_logs table exists with proper structure
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security_logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for security_logs
CREATE POLICY "Admins can view all security logs" 
ON public.security_logs 
FOR SELECT 
USING (is_admin());

CREATE POLICY "System can insert security logs" 
ON public.security_logs 
FOR INSERT 
WITH CHECK (true);

-- Security Fix 4: Create security_flags table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.security_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  flag_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  description text,
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on security_flags
ALTER TABLE public.security_flags ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for security_flags
CREATE POLICY "Admins can manage security flags" 
ON public.security_flags 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Security Fix 5: Enhanced admin link generation with rate limiting
CREATE OR REPLACE FUNCTION public.create_admin_link_secure(duration_minutes integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  token TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
  link_id UUID;
  recent_links INTEGER;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado');
  END IF;
  
  -- Validar duração
  IF duration_minutes < 5 OR duration_minutes > 1440 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Duração deve ser entre 5 e 1440 minutos');
  END IF;
  
  -- Rate limiting: Check recent link creation
  SELECT COUNT(*) INTO recent_links
  FROM admin_login_links
  WHERE created_by = auth.uid()
    AND created_at > NOW() - INTERVAL '1 hour';
    
  IF recent_links >= 5 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Limite de links por hora excedido');
  END IF;
  
  -- Gerar token e calcular expiração
  token := public.generate_admin_token();
  expires_at := NOW() + (duration_minutes || ' minutes')::INTERVAL;
  
  -- Inserir o link
  INSERT INTO public.admin_login_links (token, created_by, expires_at)
  VALUES (token, auth.uid(), expires_at)
  RETURNING id INTO link_id;
  
  -- Log creation
  INSERT INTO security_logs (event_type, user_id, details) 
  VALUES ('admin_link_created', auth.uid(), jsonb_build_object('link_id', link_id, 'duration_minutes', duration_minutes))
  ON CONFLICT DO NOTHING;
  
  -- Retornar apenas informações necessárias (SEM o token completo)
  RETURN jsonb_build_object(
    'success', true,
    'link_id', link_id,
    'expires_at', expires_at,
    'message', 'Link criado com sucesso'
  );
END;
$function$;