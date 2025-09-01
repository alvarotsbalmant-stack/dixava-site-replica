
-- Phase 1: Fix Critical Authentication Issues (Corrected Version)

-- 1. Create the missing profiles table with proper structure (if not exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'cliente',
  is_pro_member BOOLEAN DEFAULT false,
  pro_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check user roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- 4. Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- 5. Create trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
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
    CASE 
      WHEN NEW.email = 'admin@utidosgames.com' THEN 'admin'
      ELSE 'cliente'
    END
  );
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Update existing admin authentication functions to use profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 7. Enable RLS on critical admin tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_layout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies if they exist, then create admin-only policies for sensitive tables
DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Only admins can manage pages" ON public.pages;
DROP POLICY IF EXISTS "Anyone can view active pages" ON public.pages;
DROP POLICY IF EXISTS "Only admins can manage page layouts" ON public.page_layout_items;
DROP POLICY IF EXISTS "Anyone can view page layouts" ON public.page_layout_items;
DROP POLICY IF EXISTS "Only admins can manage banners" ON public.banners;
DROP POLICY IF EXISTS "Anyone can view active banners" ON public.banners;
DROP POLICY IF EXISTS "Only admins can manage tags" ON public.tags;
DROP POLICY IF EXISTS "Anyone can view tags" ON public.tags;

-- Create admin-only policies for sensitive tables
CREATE POLICY "Only admins can manage products"
  ON public.products
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view active products"
  ON public.products
  FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can manage pages"
  ON public.pages
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view active pages"
  ON public.pages
  FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can manage page layouts"
  ON public.page_layout_items
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view page layouts"
  ON public.page_layout_items
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage banners"
  ON public.banners
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view active banners"
  ON public.banners
  FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Only admins can manage tags"
  ON public.tags
  FOR ALL
  USING (public.is_admin());

CREATE POLICY "Anyone can view tags"
  ON public.tags
  FOR SELECT
  USING (true);

-- 9. Create initial admin user if needed (replace with your admin email)
-- Note: This may fail if user already exists, but that's okay
DO $$
BEGIN
  -- Only insert if user doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@utidosgames.com') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'admin@utidosgames.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END $$;
