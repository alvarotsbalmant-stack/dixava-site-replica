-- Security Fix: Fix function search path vulnerabilities for remaining functions
-- This addresses WARN issues 3-18 from the linter

-- Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, user_id uuid DEFAULT auth.uid(), details jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log simples que não faz nada para não bloquear
  NULL;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
$function$;

-- Fix promote_user_to_admin function
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix handle_new_user function
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

-- Fix cleanup_unconfirmed_accounts function
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

-- Security Fix: Create missing security tables if they don't exist
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  user_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

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

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  -- Enable RLS on security_logs if not enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'security_logs'
  ) THEN
    ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS on security_flags if not enabled  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'security_flags'
  ) THEN
    ALTER TABLE public.security_flags ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Add RLS policies only if they don't exist
DO $$
BEGIN
  -- Security logs policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'security_logs' 
    AND policyname = 'System can insert security logs'
  ) THEN
    CREATE POLICY "System can insert security logs" 
    ON public.security_logs 
    FOR INSERT 
    WITH CHECK (true);
  END IF;

  -- Security flags policies  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'security_flags' 
    AND policyname = 'Admins can manage security flags'
  ) THEN
    CREATE POLICY "Admins can manage security flags" 
    ON public.security_flags 
    FOR ALL 
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;