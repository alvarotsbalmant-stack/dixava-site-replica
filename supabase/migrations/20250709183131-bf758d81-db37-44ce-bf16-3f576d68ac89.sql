-- Criar tabela de configurações globais do site
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Política para admins gerenciarem as configurações
CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Política para leitura pública das configurações
CREATE POLICY "Public can read site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO public.site_settings (setting_key, setting_value) VALUES
('site_info', '{
  "siteName": "UTI dos Games", 
  "siteSubtitle": "Sua loja de games favorita",
  "browserTitle": "UTI dos Games - Sua loja de games favorita",
  "selectedFont": "Inter",
  "logoUrl": "/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png"
}'),
('uti_pro_settings', '{
  "enabled": true
}')
ON CONFLICT (setting_key) DO NOTHING;