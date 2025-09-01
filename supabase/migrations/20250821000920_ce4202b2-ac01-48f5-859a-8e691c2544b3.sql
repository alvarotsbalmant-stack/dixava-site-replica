-- Verificar se a tabela special_sections existe
DO $$
BEGIN
    -- Criar tabela special_sections se não existir
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'special_sections') THEN
        CREATE TABLE public.special_sections (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            title text NOT NULL,
            description text,
            is_active boolean DEFAULT true,
            background_type text DEFAULT 'color',
            background_value text,
            background_image_position text DEFAULT 'center',
            carousel_title_color text DEFAULT '#ffffff',
            view_all_button_bg_color text DEFAULT '#1f2937',
            view_all_button_text_color text DEFAULT '#ffffff',
            scrollbar_color text DEFAULT '#1f2937',
            scrollbar_hover_color text DEFAULT '#111827',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.special_sections ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Everyone can view active special sections" ON public.special_sections
            FOR SELECT USING (is_active = true);
            
        CREATE POLICY "Admins can manage special sections" ON public.special_sections
            FOR ALL USING (is_admin());
    ELSE
        -- Adicionar colunas de cor se não existirem
        ALTER TABLE public.special_sections 
        ADD COLUMN IF NOT EXISTS carousel_title_color text DEFAULT '#ffffff',
        ADD COLUMN IF NOT EXISTS view_all_button_bg_color text DEFAULT '#1f2937',
        ADD COLUMN IF NOT EXISTS view_all_button_text_color text DEFAULT '#ffffff',
        ADD COLUMN IF NOT EXISTS scrollbar_color text DEFAULT '#1f2937',
        ADD COLUMN IF NOT EXISTS scrollbar_hover_color text DEFAULT '#111827';
    END IF;
END $$;