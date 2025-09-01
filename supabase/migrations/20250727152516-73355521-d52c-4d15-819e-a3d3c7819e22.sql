-- Fix Security Definer Functions - Add SET search_path TO 'public' to all functions
-- This addresses the Function Search Path Mutable warnings

-- 1. Fix trigger_set_timestamp function
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2. Fix update_updated_at_column function  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- 3. Fix update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- 4. Fix auto_update_uti_pro_enabled function
CREATE OR REPLACE FUNCTION public.auto_update_uti_pro_enabled()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Ativar UTI PRO se há valor de desconto, preço customizado ou pro_price
  NEW.uti_pro_enabled := (
    (NEW.uti_pro_value IS NOT NULL AND NEW.uti_pro_value > 0) OR
    (NEW.uti_pro_custom_price IS NOT NULL AND NEW.uti_pro_custom_price > 0) OR
    (NEW.pro_price IS NOT NULL AND NEW.pro_price > 0)
  );
  
  RETURN NEW;
END;
$function$;

-- 5. Fix sync_usuarios_with_profiles function
CREATE OR REPLACE FUNCTION public.sync_usuarios_with_profiles()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.usuarios (id, nome, email, created_at)
    VALUES (NEW.id, NEW.name, NEW.email, NEW.created_at)
    ON CONFLICT (id) DO UPDATE SET
      nome = EXCLUDED.nome,
      email = EXCLUDED.email,
      updated_at = now();
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.usuarios 
    SET nome = NEW.name, email = NEW.email, updated_at = now()
    WHERE id = NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.usuarios WHERE id = OLD.id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 6. Fix cleanup_unconfirmed_accounts function
CREATE OR REPLACE FUNCTION public.cleanup_unconfirmed_accounts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  -- Log da operação
  RAISE LOG 'Cleanup trigger fired for email: %', NEW.email;
  
  -- Se o novo usuário não tem email confirmado, deletar qualquer conta anterior não confirmada com o mesmo email
  IF NEW.email_confirmed_at IS NULL THEN
    -- Deletar usuários antigos não confirmados com o mesmo email (mas não o que está sendo inserido)
    DELETE FROM auth.users 
    WHERE email = NEW.email 
    AND email_confirmed_at IS NULL 
    AND id != NEW.id
    AND created_at < NEW.created_at;
    
    -- Obter número de linhas deletadas
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN
      RAISE LOG 'Deleted % unconfirmed accounts for email: %', v_count, NEW.email;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro, apenas loga mas não falha a operação
  RAISE LOG 'Error in cleanup_unconfirmed_accounts: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- 7. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Create special_section_elements table if it doesn't exist (addressing RLS Enabled No Policy)
CREATE TABLE IF NOT EXISTS public.special_section_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL,
  element_type text NOT NULL,
  element_config jsonb DEFAULT '{}',
  display_order integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on special_section_elements
ALTER TABLE public.special_section_elements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for special_section_elements
CREATE POLICY "Public can view visible special section elements"
ON public.special_section_elements
FOR SELECT
USING (is_visible = true);

CREATE POLICY "Admins can manage special section elements"
ON public.special_section_elements
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create update trigger for special_section_elements
CREATE TRIGGER update_special_section_elements_updated_at
  BEFORE UPDATE ON public.special_section_elements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add enhanced security logging table for admin operations
CREATE TABLE IF NOT EXISTS public.admin_security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_security_logs
ALTER TABLE public.admin_security_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_security_logs
CREATE POLICY "Admins can view all admin security logs"
ON public.admin_security_logs
FOR SELECT
USING (is_admin());

CREATE POLICY "System can insert admin security logs"
ON public.admin_security_logs
FOR INSERT
WITH CHECK (true);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type text,
  p_resource_type text DEFAULT NULL,
  p_resource_id text DEFAULT NULL,
  p_details jsonb DEFAULT '{}',
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only log if user is admin
  IF NOT is_admin() THEN
    RETURN;
  END IF;
  
  INSERT INTO public.admin_security_logs (
    admin_user_id,
    action_type,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  )
  VALUES (
    auth.uid(),
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  );
END;
$function$;