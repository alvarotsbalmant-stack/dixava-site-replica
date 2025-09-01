UPDATE public.email_templates 
SET html_content = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, ''Helvetica Neue'', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
            {{#if logo_url}}
            <img src="{{logo_url}}" alt="{{from_name}}" style="max-width: 180px; height: auto; margin-bottom: 20px;">
            {{/if}}
        </div>
        
        <!-- Main Card -->
        <div style="background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header Gradient -->
            <div style="background: linear-gradient(135deg, {{primary_color}}, #667eea); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    🎉 Confirme sua conta
                </h1>
                <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 10px 0 0 0;">
                    Estamos quase lá! Só falta um clique
                </p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Olá! 👋<br><br>
                    Ficamos felizes em tê-lo conosco! Para começar a aproveitar todos os recursos da nossa plataforma, 
                    clique no botão abaixo para confirmar sua conta.
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="{{confirmation_url}}" 
                       style="background: linear-gradient(135deg, {{primary_color}}, #667eea); 
                              color: white; 
                              text-decoration: none; 
                              padding: 16px 40px; 
                              border-radius: 50px; 
                              font-weight: 600; 
                              font-size: 16px;
                              display: inline-block;
                              box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
                              transition: all 0.3s ease;">
                        ✨ Confirmar Minha Conta
                    </a>
                </div>
                
                <!-- Alternative Link -->
                <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-top: 30px;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">
                        🔗 Link alternativo:
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 0; word-break: break-all; font-family: monospace;">
                        {{confirmation_url}}
                    </p>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                    Se você não criou uma conta, pode ignorar este email com segurança. 🛡️
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px;">
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;">
                {{from_name}}
                {{#if company_address}}<br>{{company_address}}{{/if}}
            </p>
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 10px 0 0 0;">
                © 2024 {{from_name}}. Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>',
text_content = 'Confirme sua conta - {{from_name}}

Olá!

Ficamos felizes em tê-lo conosco! Para começar a aproveitar todos os recursos da nossa plataforma, clique no link abaixo para confirmar sua conta:

{{confirmation_url}}

Se você não criou uma conta, pode ignorar este email com segurança.

Atenciosamente,
{{from_name}}
{{#if company_address}}
{{company_address}}
{{/if}}'
WHERE type = 'confirmation';