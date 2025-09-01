-- Phase 1: Database Cleanup (Constraint Fix)
-- Step 1: Migrate data from profiles to user_profiles with correct role mapping
INSERT INTO public.user_profiles (id, name, email, role, created_at)
SELECT 
  p.id,
  p.name,
  p.email,
  CASE 
    WHEN p.role = 'admin' THEN 'admin'
    WHEN p.role = 'cliente' THEN 'user'
    ELSE 'user'
  END as role,
  COALESCE(p.created_at, now()) as created_at
FROM public.profiles p
LEFT JOIN public.user_profiles up ON p.id = up.id
WHERE up.id IS NULL;

-- Step 2: Fix is_admin_user() function to use user_profiles instead of profiles
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$function$;

-- Step 3: Drop the old profiles table (this will automatically cascade to dependent views)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 4: Update any remaining functions that might reference the old table
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_profiles WHERE id = user_id;
$function$;