-- Criar tabela para configurações de templates de email
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'confirmation', 'welcome', 'reset_password', 'marketing', 'follow_up'
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb, -- Array de variáveis disponíveis
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações gerais de email
CREATE TABLE public.email_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_name TEXT NOT NULL DEFAULT 'Sua Empresa',
  from_email TEXT NOT NULL DEFAULT 'noreply@suaempresa.com',
  reply_to TEXT,
  logo_url TEXT,
  company_address TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT DEFAULT '#f8fafc',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.email_config (from_name, from_email) 
VALUES ('Sua Empresa', 'noreply@suaempresa.com');

-- Inserir templates padrão
INSERT INTO public.email_templates (type, name, subject, html_content, text_content, variables) VALUES
('confirmation', 'Email de Confirmação', 'Confirme sua conta', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        {{#if logo_url}}
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="{{logo_url}}" alt="{{from_name}}" style="max-width: 200px; height: auto;">
        </div>
        {{/if}}
        
        <h1 style="color: {{primary_color}}; text-align: center; margin-bottom: 30px;">
            Confirme sua conta
        </h1>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Olá! Clique no botão abaixo para confirmar sua conta e começar a usar nossa plataforma.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="{{confirmation_url}}" 
               style="background-color: {{primary_color}}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Confirmar Conta
            </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            Se você não criou uma conta, pode ignorar este email com segurança.
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{from_name}} {{#if company_address}}- {{company_address}}{{/if}}
            </p>
        </div>
    </div>
</body>
</html>',
'Confirme sua conta

Olá! Clique no link abaixo para confirmar sua conta:

{{confirmation_url}}

Se você não criou uma conta, pode ignorar este email.

--
{{from_name}}',
'["confirmation_url", "from_name", "logo_url", "primary_color", "company_address"]'::jsonb),

('welcome', 'Email de Boas-vindas', 'Bem-vindo(a) à {{from_name}}!', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        {{#if logo_url}}
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="{{logo_url}}" alt="{{from_name}}" style="max-width: 200px; height: auto;">
        </div>
        {{/if}}
        
        <h1 style="color: {{primary_color}}; text-align: center; margin-bottom: 30px;">
            Bem-vindo(a)!
        </h1>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Olá {{user_name}},
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Sua conta foi confirmada com sucesso! Agora você pode aproveitar todos os recursos da nossa plataforma.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="{{platform_url}}" 
               style="background-color: {{primary_color}}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Acessar Plataforma
            </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{from_name}} {{#if company_address}}- {{company_address}}{{/if}}
            </p>
        </div>
    </div>
</body>
</html>',
'Bem-vindo(a) à {{from_name}}!

Olá {{user_name}},

Sua conta foi confirmada com sucesso! Acesse nossa plataforma em:
{{platform_url}}

--
{{from_name}}',
'["user_name", "platform_url", "from_name", "logo_url", "primary_color", "company_address"]'::jsonb),

('reset_password', 'Redefinir Senha', 'Redefinir sua senha', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        {{#if logo_url}}
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="{{logo_url}}" alt="{{from_name}}" style="max-width: 200px; height: auto;">
        </div>
        {{/if}}
        
        <h1 style="color: {{primary_color}}; text-align: center; margin-bottom: 30px;">
            Redefinir Senha
        </h1>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
            <a href="{{reset_url}}" 
               style="background-color: {{primary_color}}; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Redefinir Senha
            </a>
        </div>
        
        <p style="color: #dc2626; font-size: 14px; line-height: 1.6; background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <strong>Atenção:</strong> Este link expira em 1 hora por motivos de segurança.
        </p>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            Se você não solicitou esta redefinição, pode ignorar este email com segurança.
        </p>
        
        <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                {{from_name}} {{#if company_address}}- {{company_address}}{{/if}}
            </p>
        </div>
    </div>
</body>
</html>',
'Redefinir Senha

Recebemos uma solicitação para redefinir a senha da sua conta.

Clique no link abaixo para criar uma nova senha:
{{reset_url}}

Atenção: Este link expira em 1 hora.

Se você não solicitou esta redefinição, ignore este email.

--
{{from_name}}',
'["reset_url", "from_name", "logo_url", "primary_color", "company_address"]'::jsonb);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;

-- Políticas para email_templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
USING (public.is_admin());

CREATE POLICY "Everyone can read active email templates"
ON public.email_templates
FOR SELECT
USING (is_active = true);

-- Políticas para email_config
CREATE POLICY "Admins can manage email config"
ON public.email_config
FOR ALL
USING (public.is_admin());

CREATE POLICY "Everyone can read email config"
ON public.email_config
FOR SELECT
USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_config_updated_at
BEFORE UPDATE ON public.email_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();