-- Corrigir o trigger e promover usuário para admin
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Atualizar diretamente o usuário para admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'balmantalvaro@gmail.com';