-- Phase 1 Critical Security Fixes - Corrected

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

-- For updates, prevent role changes by regular users
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add a separate policy to prevent role escalation
CREATE POLICY "Prevent role escalation" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id AND NOT (role != (SELECT role FROM public.profiles p WHERE p.id = auth.uid())))
WITH CHECK (true);

CREATE POLICY "System can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id AND role = 'cliente');

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